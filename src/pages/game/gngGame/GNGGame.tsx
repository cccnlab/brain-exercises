import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GNGGame.css';
import BreadCrumb from '../../../components/breadcrumbs/breadCrumb';
import GNGWindow from '../../../components/gameWindow/gngWindow/GNGWindow';
import ScoreSummaryOverlay from '../../../components/scoreSummaryOverlay/ScoreSummaryOverlay';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3';
import combo1SoundSrc from '../../../assets/sound/combo1.mp3';
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import combo3SoundSrc from '../../../assets/sound/combo3.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import moment from 'moment';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';
import { Shuffle } from '../../../scripts/shuffle';
import { saveJSONDataToClientDevice } from '../../../uitls/offline';
import axios from 'axios';

let trialNumber = 100;
let goSignalColor: string = getComputedStyle(document.documentElement).getPropertyValue('--go-color').trim();
let noGoSignalColor: string = getComputedStyle(document.documentElement).getPropertyValue('--nogo-color').trim();
let restColor: string = getComputedStyle(document.documentElement).getPropertyValue('--rest-color').trim();
let flashDuration = 450;
let baseFlashInterval = 600;
let timeOffset = 100;
let haveDone = false;
let haveToClick = false;
let falseClicked = false;
let rtBound: number = 1000;
let scorePerTrial: number[] = [];
let total: number = 0;
let score: number;
let correctCountForCombo = 0;
let comboCount: number[] = [];
let allTimePop: Date[] = []; // use for scoring section
let allColorPop: string[] = [];
let allTimeEvent: string[] = []; // use for collecting in backend
let allInteractionEvent: string[] = [];
let allClickEvent: string[] = [];
let testEnd: Date[] = [];
let rt: number[] = [];
let hitRt: number[] = [];
let latestRtIndex = 0;
let latestHitRtIndex = 0;
let sumHitRt;
let avgHitRt: number = 0;
let blockDuration = 1; // sec เข้าใจว่าระยะห่างของเวลาการปิ้งแว้บขึ้นของแต่ละตัว (ยิ่งเยอะตัวปิ้งแว้บยิ่งน้อย)
let changeRate = 0.8; // % changes 
let noGoRate = 0.2; // % nogo 
let onlyGoBlockRatio = 0.1;
let goNoGoBlockRatio = 1 - onlyGoBlockRatio;
let onlyGoBlock = Math.round((trialNumber) * onlyGoBlockRatio);
let goInOnlyGo = Math.round(onlyGoBlock * changeRate * (1 - noGoRate));
let noChangeInOnlyGo = onlyGoBlock - goInOnlyGo;
let tempEventGo: any[] = [];
for (let i1 = 0; i1 < goInOnlyGo; i1++) { tempEventGo.push(1)};
for (let i0 = 0; i0 < (noChangeInOnlyGo - 1); i0++) { tempEventGo.push(0)};
let goNoGoBlock = Math.round((trialNumber) * goNoGoBlockRatio);
let noGoInGoNoGo = Math.round(goNoGoBlock * changeRate * noGoRate);
let goInGoNoGo = Math.round(goNoGoBlock * changeRate * (1 - noGoRate));
let noChangeInGoNoGo = goNoGoBlock - goInGoNoGo - noGoInGoNoGo;
let tempEventGoNoGo: any[] = [];
for (let i2 = 0; i2 < noGoInGoNoGo; i2++) { tempEventGoNoGo.push(1)};
for (let i1 = 0; i1 < goInGoNoGo; i1++) { tempEventGoNoGo.push(1)};
for (let i0 = 0; i0 < (noChangeInGoNoGo - 1); i0++) { tempEventGoNoGo.push(0)}; // white will be in the first and last ones to make sure that the RTs will be recorded.
Shuffle(tempEventGo);
Shuffle(tempEventGoNoGo);
let eventId = [0];
eventId = eventId.concat(tempEventGo);
eventId = eventId.concat(tempEventGoNoGo);
eventId = eventId.concat(0);
trialNumber = eventId.length;
let currEventId = 0;
let jitterBase = 400;
let jitterAmplitude = 300;
const Jitter = [Math.random() * jitterAmplitude + jitterBase];
for (let i = 0; i < eventId.length - 1; i++) {
    Jitter.push((Math.random() * jitterAmplitude + jitterBase) + Jitter[i])
};
let hitCount = 0;
let missCount = 0;
let correctRejectionCount = 0;
let falseAlarmCount = 0;
let falseHitCount = 0;
let falseSignalRejectionCount = 0;
let allNone = 0;
let allGo = 0;
let allNoGo = 0;
let gameLogicSchemeResult;
let cueDataResult: any[] = [];
let userInteractionDataResult: any[] = [];
let scoringDataResult: any[] = [];
let metricDataResult: any[] = [];
let postEntryResult;

function GNGGame(props) {
    const navigate = useNavigate();
    const [btnOnClicked, setBtnOnClicked] = useState(false);
    const [circleBtnClass, setCircleBtnClass] = useState("");
    const [clickSound] = useSound(clickSoundSrc);
    const [combo1Sound] = useSound(combo1SoundSrc);
    const [combo2Sound] = useSound(combo2SoundSrc);
    const [combo3Sound] = useSound(combo3SoundSrc);
    const [losingSound] = useSound(losingSoundSrc);
    const [progressValue, setProgressValue] = useState(0);
    const [isItDone, setIsItDone] = useState(false);
    const [hardGNGDone, setHardGNGDone] = useState(false);
    let timeoutList: any[] = [];

    useEffect(() => {
        initiateData();
        let progressDuration = ((flashDuration + ((trialNumber - 1) * baseFlashInterval) + Jitter[trialNumber - 1] + 200) / 1000).toString() + 's';
        createProgressBar('progressBar', progressDuration);
        gameLogicSchemeResult = gameLogicScheme(trialNumber, changeRate, noGoRate, onlyGoBlockRatio, goNoGoBlockRatio, flashDuration, baseFlashInterval, jitterBase, jitterAmplitude, timeOffset);
        popColor(flashDuration, baseFlashInterval, eventId);
        return () => {
            timeoutList.forEach(tm => {
                clearTimeout(tm);
            })
        };
    }, [])

    function initiateData() {
        rt = [];
        hitRt = [];
        allTimePop = [];
        allColorPop = [];
        testEnd = [];
        currEventId = 0;
        haveDone = false;
        haveToClick = false;
        falseClicked = false;
        comboCount = [];
        correctCountForCombo = 0;
        correctRejectionCount = noChangeInOnlyGo + noChangeInGoNoGo;
        falseSignalRejectionCount = noGoInGoNoGo;
    }

    function gameLogicScheme(trialNumber, changeRate, noGoRate, onlyGoBlockRatio, goNoGoBlockRatio, flashDuration, baseFlashInterval, jitterBase, jitterAmplitude, timeOffset) {
        eventId.map((num, index) => {
            if (num === 0){
                allNone++;
            } else if (num === 1){
                allGo++;
            } else {
                allNoGo++;
            }
        });
        gameLogicSchemeResult = {
            "game": "go-nogo",
            "schemeName" : "default",
            "version" : 1.0,
            "variant": "main",
            "parameters" : {
                "trialNumber" : {
                    "value": trialNumber,
                    "unit": null,
                    "description" : "Total number of signal"
                },
                "allGoSignal" : {
                    "value" : allGo,
                    "unit" : null,
                    "description" : "Total number of go signal"
                },
                "allNoGoSignal" : {
                    "value" : allNoGo,
                    "unit" : null,
                    "description" : "Total number of nogo signal"
                },
                "allNoneSignal" : {
                    "value" : allNone,
                    "unit" : null,
                    "description" : "Total number of none signal"
                },
                "changeRate" : {
                    "value": null,
                    "unit": null,
                    "description": "Rate of change between go and nogo block"
                },
                "nogoRate" : {
                    "value": null,
                    "unit": null,
                    "description": "Rate of no go signal"
                },
                "onlyGoBlockRatio": {
                    "value": null,
                    "unit" : null,
                    "description" : "Ratio of only go block section"
                },
                "goNoGoBlockRatio": {
                    "value": null,
                    "unit" : null,
                    "description" : "Ratio of go-nogo block section"
                },
                "flashDuration" : {
                    "value" : flashDuration,
                    "unit": "ms",
                    "description" : "Duration(ms) of flash/signal"
                },
                "baseFlashInterval" : {
                    "value" : baseFlashInterval,
                    "unit" : "ms",
                    "description" : "Base duration between each signal"
                },
                "jitterBase" : {
                    "value" : jitterBase,
                    "unit" : "ms",
                    "description" : "Base(added) duration between each signal"
                },
                "jitterAmplitude" : {
                    "value" : jitterAmplitude,
                    "unit": "ms",
                    "description" : "Added jittering amplitude of time between each signal"
                },
                "timeOffset" : {
                    "value" : timeOffset,
                    "unit": "ms",
                    "description" : "Negative time offset to reduce time before first signal (Deduct from jittered timeout)"
                }
            },
            "description" : "Default Go-Nogo Configuration"
        }
        return gameLogicSchemeResult;
    }

    function createProgressBar(id, duration) {
        let progressBar = document.getElementById(id);
        let progressBarInner = document.createElement('div');
        progressBarInner.className = 'inner';
    
        progressBarInner.style.animationDuration = duration;
    
        if (progressBar) {
            progressBar.hidden = false;
            if (progressBar.firstChild) {
                progressBar.removeChild(progressBar.firstChild);
            }
            progressBar.className = 'progressbar';
            progressBar.appendChild(progressBarInner);
        }
    
        progressBarInner.style.animationPlayState = 'running';
    }

    function popColor(popTime, intervalTime, colors) {
        let progressBar = document.getElementById('progressBar');
        progressBar?.classList.add('show-block');
        for (let iSeq = 0; iSeq < trialNumber; iSeq++) {
            if (colors[iSeq] === 0) {
                timeoutList.push(
                    setTimeout(function () {
                        let end = endTime();
                        allTimePop.push(end);
                        allColorPop.push(restColor);
                        allTimeEvent.push(thisTime());
                        currEventId = 0;
                        falseClicked = false;
                    }, (iSeq * intervalTime) + Jitter[iSeq])
                )
            } else if (colors[iSeq] === 1) {
                timeoutList.push(
                    setTimeout(function () {
                        let end = endTime();
                        setCircleBtnClass("green")
                        allTimePop.push(end);
                        allColorPop.push(goSignalColor);
                        allTimeEvent.push(thisTime());
                        currEventId = 1;
                        haveToClick = false;
                    }, (iSeq * intervalTime) + Jitter[iSeq])
                )

                timeoutList.push(
                    setTimeout(function () {
                        let end = endTime();
                        setCircleBtnClass("")
                    }, popTime + (iSeq * intervalTime) + Jitter[iSeq])
                )

                timeoutList.push(
                    setTimeout(function () {
                        if (haveToClick === false) {
                            correctCountForCombo = 0;
                            missCount++;
                        }
                    }, (iSeq + 1) * intervalTime + Jitter[iSeq + 1] - timeOffset)
                )
            } else if (colors[iSeq] === 2) {
                timeoutList.push(
                    setTimeout(function () {
                        let end = endTime();
                        setCircleBtnClass("red")
                        allTimePop.push(end);
                        allColorPop.push(noGoSignalColor);
                        allTimeEvent.push(thisTime());
                        currEventId = 2;
                        falseClicked = false;
                    }, (iSeq * intervalTime) + Jitter[iSeq])
                )

                timeoutList.push(
                    setTimeout(function () {
                        let end = endTime();
                        setCircleBtnClass("")
                    }, popTime + (iSeq * intervalTime) + Jitter[iSeq])
                )
            }
        }
        runIsOver(popTime + ((trialNumber - 1) * intervalTime) + Jitter[trialNumber - 1] + 200)
    }

    function runIsOver(waitTheWholeTime: number) {
        timeoutList.push(
            setTimeout(function () {
                testEnd.push(endTime());
                if (haveDone === false) {
                    haveDone = true;
                    checkAllAns();
                    Done();
                }
            }, waitTheWholeTime)
        )
    }

    function scoringData(rtBound, trialNumber, score){
        scoringDataResult = [{
            "scoringModel" : {
                "scoringName" : "default",
                "parameters" : {
                    "rtBound" : {
                        "value" : rtBound,
                        "unit" : null,
                        "description" : "rtBound - hitRt = rtScore"
                    },
                    "trialNumber" : {
                        "value" : trialNumber,
                        "unit" : null,
                        "description" : "Total number of signal"
                    }

                },
                "description" : `score = sum of the scorePerTrial if comboCount = [1, 2, 3, 4] -> comboMultiplier = [1, 1.5, 3, 5]`
            },
            "score" : score
        }]
        return scoringDataResult;
    }

    function metricData(hitCount, missCount, correctRejectionCount, falseAlarmCount, falseSignalRejectionCount, falseHitCount, hitRt, avgHitRt){
        hitRt.sort((a,b) => a-b);
        let metricName 
            = ['correctCount', 
               'incorrectCount', 
               'hitCount', 
               'missCount', 
               'correctRejectionCount', 
               'falseAlarmCount', 
               'falseSignalRejectionCount', 
               'falseHitCount',
               'hitAccuracy',
               'falseSignalRejectionAccuracy', 
               'fastestHitReactionTime', 
               'averageHitReactionTime'];
        let metricValue 
            = [hitCount + correctRejectionCount + falseSignalRejectionCount, 
               missCount + falseAlarmCount + falseHitCount, 
               hitCount, 
               missCount, 
               correctRejectionCount, 
               falseAlarmCount, 
               null, 
               null,
               (hitCount / allGo) * 100,
               null, 
               hitRt[0], 
               avgHitRt];
        let metricUnit = [null, null, null, null, null, null, null, null, '%', '%', 'ms', 's'];
        let metricDescription 
            = ['Total number of correct trials', 
               'Total number of incorrect trials', 
               'Total number of hit trials', 
               'Total number of miss trials', 
               'Total number of correct rejection trials', 
               'Total number of false alarm trials',
               'Total number of rejection incorrect signal trials', 
               'Total number of hit on incorrect signal trials',
               'The accuracy of hit',
               'The accuracy of false signal rejection', 
               'The fastest hit reaction time that user reached', 
               'The average of all hit reaction time',];
        for (let i = 0; i < metricName.length; i++){
            let obj_to_append
            obj_to_append = {
                "metricName" : metricName[i],
                "value" : metricValue[i],
                "unit" : metricUnit[i],
                "description" : metricDescription[i]
            }
            metricDataResult.push(obj_to_append);
        }   
        return metricDataResult;
    }

    function cueData(allColorPop, allTimeEvent) {
        for (let i = 0; i < allColorPop.length; i++){
            let obj_to_append;
            obj_to_append = {
                "cueEvent" : allColorPop[i],
                "cueStart" : allTimeEvent[i],
            }
            cueDataResult.push(obj_to_append);
        }
        return cueDataResult;
    }

    function userInteractionData(allInteractionEvent, allClickEvent) {
        for (let i = 0; i < allInteractionEvent.length; i++){
            let obj_to_append;
            obj_to_append = {
                "interactionEvent" : allInteractionEvent[i],
                "timestamp" : allClickEvent[i],
            }
            userInteractionDataResult.push(obj_to_append);
        }
        return userInteractionDataResult;
    }

    function postEntry(cueDataResult, userInteractionDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult) {
        postEntryResult = {
            "userId" : props.userId,
            "userPhone" : props.userPhone,
            "data" : {
                "rawData" : {
                    "cueData" : cueDataResult,
                    "userInteractionData" : userInteractionDataResult
                },
                "gameLogicScheme" : gameLogicSchemeResult,
                "scoringData" : scoringDataResult,
                "metricData" : metricDataResult
            }
        }
        return postEntryResult;
    }

    function checkAllAns() {
        for (let popIndex = 0; popIndex < allColorPop.length; popIndex++) {
            let currColorPop = allColorPop[popIndex];
            let currTimePop = allTimePop[popIndex];
            let satisfied = false;
            let nextTimePop: any = testEnd
            if (popIndex < allColorPop.length - 1) {
                nextTimePop = allTimePop[popIndex + 1];
            }
            let currRt;
            for (let rtIndex = latestRtIndex; rtIndex < rt.length; rtIndex++) {
                currRt = rt[rtIndex];
                latestRtIndex = rtIndex;
                if (currRt < currTimePop) {
                    continue;
                } else if ((currRt >= currTimePop) && (currRt < nextTimePop)) {
                    if (satisfied === false) {
                        if (currColorPop === goSignalColor) {
                            hitRt.push(currRt - currTimePop.getTime());
                        }
                        satisfied = true;
                        }
                    } else {
                        break;
                    }
                }
        }
        getSummaryScore();
    }

    function getSummaryScore() {
        for (let correctIndex = latestHitRtIndex; correctIndex < comboCount.length; correctIndex++) {
            latestHitRtIndex = correctIndex;
            let rtScore = rtBound - hitRt[correctIndex];
            if (comboCount[correctIndex] === 1) {
                rtScore *= 1;
            } else if (comboCount[correctIndex] === 2) {
                rtScore *= 1.5;
            } else if (comboCount[correctIndex] === 3) {
                rtScore *= 3;
            } else if (comboCount[correctIndex] === 4) {
                rtScore *= 5;
            }
            scorePerTrial.push(rtScore);
        }

        sumHitRt = hitRt.reduce((sum, score) => {
            return sum + score;
        });

        avgHitRt = sumHitRt / 1000 / hitRt.length;
        
        if (scorePerTrial.length !== 0){
            total = scorePerTrial.reduce((sum, score) => {
                return sum + score;
            });
        } else {
          scorePerTrial.push(0);
        }

        return total;
    }

    function checkResp() {
        // clickSound();
        if (currEventId === 1) {
            if (haveToClick === false) {
                haveToClick = true;
                if (correctCountForCombo === 5) {
                    correctCountForCombo = 5;
                } else {
                    correctCountForCombo++;
                }
                if (correctCountForCombo === 1) {
                    comboCount.push(1);
                    // combo1Sound();
                } else if (correctCountForCombo === 2) {
                    comboCount.push(1);
                    // combo2Sound();
                } else if (correctCountForCombo === 3) {
                    comboCount.push(2);
                    // combo3Sound();
                } else if (correctCountForCombo === 4) {
                    comboCount.push(3);
                    // combo3Sound();
                } else if (correctCountForCombo === 5) {
                    comboCount.push(4);
                    // combo3Sound();
                }
            }
            hitCount++;
        } else {
            if (falseClicked === false) {
                correctCountForCombo = 0;
                // losingSound();
                falseClicked = true;
                if (currEventId === 0) {
                    falseAlarmCount++;
                    if (correctRejectionCount > 0) {
                        correctRejectionCount--;
                    }
                }
                if (currEventId === 2) {
                    falseHitCount++;
                    if (falseSignalRejectionCount > 0) {
                        falseSignalRejectionCount--;
                    }
                }
            }
        }
    }

    function Done() {
        setIsItDone(true);
        setHardGNGDone(true);
        score = Math.max(10000, Math.round(total));
        cueDataResult = cueData(allColorPop, allTimeEvent);
        userInteractionDataResult = userInteractionData(allInteractionEvent, allClickEvent);
        scoringDataResult = scoringData(rtBound, trialNumber, score);
        metricDataResult = metricData(hitCount, missCount, correctRejectionCount, falseAlarmCount, falseSignalRejectionCount, falseHitCount, hitRt, avgHitRt);
        postEntryResult = postEntry(cueDataResult, userInteractionDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult);
        axios.post('https://hwsrv-1063269.hostwindsdns.com/exercise-api-easy/go-nogo', postEntryResult)
            .then(function (postEntryResult) {
                console.log(postEntryResult)
            })
            .catch(function (error) {
                console.log('error')
            });
        saveJSONDataToClientDevice(postEntryResult, `GNG_${props.userPhone}_${thisTime().toString()}`);
    }

    function touchStart() {
        let end = endTime();
        allInteractionEvent.push('mouse-down');
        allClickEvent.push(thisTime());
        setBtnOnClicked(true);
        rt.push(end.getTime());
        checkResp();
    }

    function touchEnd() {
        let end = endTime();
        allInteractionEvent.push('mouse-up');
        allClickEvent.push(thisTime());
        setBtnOnClicked(false);
    }

    function refreshPage(){
        window.location.reload();
    } 

    function backToLandingPage() {
        navigate('/landing');
    }

    return (
        <div className='container-fluid'>
        <div className='row'>
            <div className='py-4 px-12 sm:py-8 w-full bg-blue-100 shadow-md'>
              {<BreadCrumb />}
            </div>
            <div id='GNGGameBody' className='col'>
            <div className="GNGGameBodyProgressBar">
                <div className="progressBarContainer">
                    <div id='progressBar' hidden></div>
                </div>
            </div>
              <div className="GNGGameWindow">
                {<GNGWindow touchStart={touchStart} touchEnd={touchEnd} btnOnClicked={btnOnClicked} circleBtnClass={circleBtnClass}/>}
              </div>
              <div className="GNGGameEnterButton"></div>
            </div>
        </div>
        {isItDone ? 
        <div>
            {<ScoreSummaryOverlay accuracy={((hitCount + correctRejectionCount + falseSignalRejectionCount) / trialNumber) * 100}  falseHit={(falseHitCount / allNoGo) * 100} avgHitRt={avgHitRt} hardGNGDone={hardGNGDone} refreshPage={refreshPage} backToLandingPage={backToLandingPage}/>}
        </div>
        : null}
        {<RotateAlert />}
    </div>
    )
}
export default GNGGame;

function endTime() {
    let d = new Date();
    return d;
}

function thisTime() {
    let thisTime = moment().format('YYYY-MM-DDTkk:mm:ss.SSSSSS');
    return thisTime;
}
