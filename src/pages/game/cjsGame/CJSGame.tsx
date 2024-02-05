import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CJSGame.css';
import BreadCrumb from '../../../components/breadcrumbs/breadCrumb';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import CJSWindow from '../../../components/gameWindow/cjsWindow/CJSWindow';
import ScoreSummaryOverlay from '../../../components/scoreSummaryOverlay/ScoreSummaryOverlay';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3';
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import moment from 'moment';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';
import { Shuffle } from '../../../scripts/shuffle';
import * as vismem from '../../../scripts/vismemCC_simon';
import CJSButton from '../../../components/gameWindow/cjsWindow/cjsButton/CJSButton';
import { saveJSONDataToClientDevice } from '../../../uitls/offline';
import axios from 'axios';

let myCanvas: HTMLCanvasElement;
let canvasContext: CanvasRenderingContext2D;
let trialNumber;
let currTrial = 0;
let backgroundColor = '#E5E5E5';
let stimulusColor = ['#0072FF', '#FFC837']; 
let searchTargetList: any[][] = [
    [
        { description: 'สี่เหลี่ยมสีฟ้า', color: 'blue', shape: 'square' },
        { description: 'สี่เหลี่ยมเหลือง', color: 'yellow', shape: 'square' }
    ],
    [
        { description: 'วงกลมสีฟ้า', color: 'blue', shape: 'circle' },
        { description: 'วงกลมเหลือง', color: 'yellow', shape: 'circle' }
    ]
]
let canvasWidth = 800;
let canvasHeight = 800;
let squareWidth = 55;
let squareHeight = 55;
let radius = squareWidth / 2;
let positionJitter = 8;
let centerX: number;
let centerY: number;
let Xspan = canvasWidth / 2;
let Yspan = canvasHeight / 2;
let XblockNumber = 8;
let YblockNumber = 6;
let Xblock = Xspan * 2 / XblockNumber;
let Yblock = Yspan * 2 / YblockNumber;
let X: number[]
let Y: number[]
let Xs: number[] = [];
let Ys: number[] = [];
let Xtemps: number[] = [];
let Ytemps: number[] = [];
let posId: number[] = [];
let maxSS = Math.floor((XblockNumber * YblockNumber - 1) / 2);
let ceilingSS = 0;
let currSS = 2;
let initialSetSize = 2; // must have same value as currSS
let allSetsizeAndTarget: number[][] = [];
let change = NaN;
let shapeRand: number[] = [];
let ori: number[]
let col: string[]
let oris: number[] = [];
let cols: number[] = [];
let ceilingTimeLimit = 10 * 1000;
let timeLimit = 10 * 1000;
let timeLimitDeclineStep = 1000;
let timeLimitInclineStep = 500;
let checkAns: string[] = [];
let thatRight: string = '';
let responseText: string = '';
let timeoutList: any[] = []; 
let count = 0;
let NupNdown = 5;
let trackRecord = 0;
let levelUpCount = 0;
let STT;
let ET;
let sumRt = 0;
let allRt: number[] = [];
let sumHitRt;
let hitRt: number[] = [];
let hit2SetSizeRtF: number[] = [];
let hit6SetSizeRtF: number[] = [];
let hit12SetSizeRtF: number[] = [];
let hit24SetSizeRtF: number[] = [];
let hit44SetSizeRtF: number[] = [];
let correctRejection2SetSizeRtF: number[] = [];
let correctRejection6SetSizeRtF: number[] = [];
let correctRejection12SetSizeRtF: number[] = [];
let correctRejection24SetSizeRtF: number[] = [];
let correctRejection44SetSizeRtF: number[] = [];
let hit2SetSizeRtC: number[] = [];
let hit6SetSizeRtC: number[] = [];
let hit12SetSizeRtC: number[] = [];
let hit24SetSizeRtC: number[] = [];
let hit44SetSizeRtC: number[] = [];
let correctRejection2SetSizeRtC: number[] = [];
let correctRejection6SetSizeRtC: number[] = [];
let correctRejection12SetSizeRtC: number[] = [];
let correctRejection24SetSizeRtC: number[] = [];
let correctRejection44SetSizeRtC: number[] = [];
let latestHitRtIndex = 0;
let correctButLateCount = 0;
let lateMultiplier = 10000;
let incorrectCount = 0;
let incorrectMultiplier = 20000;
let scorePerTrial = [0];
let sumScores = 0;
let scoresMultiplier = 10;
let comboCount: number[] = [];
let rtBound = 10000;
let avgHitRt;
let avgHit2SetSizeRtF;
let avgHit6SetSizeRtF;
let avgHit12SetSizeRtF;
let avgHit24SetSizeRtF;
let avgHit44SetSizeRtF;
let avgCorrectRejection2SetSizeRtF;
let avgCorrectRejection6SetSizeRtF;
let avgCorrectRejection12SetSizeRtF;
let avgCorrectRejection24SetSizeRtF;
let avgCorrectRejection44SetSizeRtF;
let hitAccuracy2SetSizeF;
let hitAccuracy6SetSizeF;
let hitAccuracy12SetSizeF;
let hitAccuracy24SetSizeF;
let hitAccuracy44SetSizeF;
let correctRejectionAccuracy2SetSizeF;
let correctRejectionAccuracy6SetSizeF;
let correctRejectionAccuracy12SetSizeF;
let correctRejectionAccuracy24SetSizeF;
let correctRejectionAccuracy44SetSizeF;
let avgHit2SetSizeRtC;
let avgHit6SetSizeRtC;
let avgHit12SetSizeRtC;
let avgHit24SetSizeRtC;
let avgHit44SetSizeRtC;
let avgCorrectRejection2SetSizeRtC;
let avgCorrectRejection6SetSizeRtC;
let avgCorrectRejection12SetSizeRtC;
let avgCorrectRejection24SetSizeRtC;
let avgCorrectRejection44SetSizeRtC;
let hitAccuracy2SetSizeC;
let hitAccuracy6SetSizeC;
let hitAccuracy12SetSizeC;
let hitAccuracy24SetSizeC;
let hitAccuracy44SetSizeC;
let correctRejectionAccuracy2SetSizeC;
let correctRejectionAccuracy6SetSizeC;
let correctRejectionAccuracy12SetSizeC;
let correctRejectionAccuracy24SetSizeC;
let correctRejectionAccuracy44SetSizeC;
let swiftness: string = '';
let total: number = 0;
let score: number;
let targetMatch: boolean[] = [];
let allStartTime: string[] = [];
let allClickTime: string[] = [];
let allCurrSS: number[] = [];
let gameLogicSchemeResult;
let trialDataResult: any[] = [];
let stimulusDataResult: any[] = [];
let targetDataResult;
let scoringDataResult: any[] = [];
let timeLimitRecord: any[] = [];
let setSizeRecord: any[] = [];
let setSizeInCorrectAns: any[] = [];
let metricDataResult: any[] = [];
let allSearchMode: string[] = [];
let postEntryResult;

function CJSGame(props): any {
    const navigate = useNavigate();
    const [clickSound] = useSound(clickSoundSrc);
    const [combo2Sound] = useSound(combo2SoundSrc);
    const [losingSound] = useSound(losingSoundSrc);
    const [searchTarget, setSearchTarget] = useState<{ shape: number, col: number }>();
    const [progressValue, setProgressValue] = useState(0);
    const [disabledButton, setDisabledButton] = useState(false);
    const [isItDone, setIsItDone] = useState(false);

        useEffect(() => {
            initiateData();
            // have to set search target before switchSearchMode() & createTargetCanvas() 
            setSearchTarget({ shape: (Math.random() > 0.5 ? 1 : 0), col: (Math.random() > 0.5 ? 1 : 0) });
            createPseudorandomStimuli();
            gameLogicSchemeResult = gameLogicScheme(trialNumber, backgroundColor, squareWidth, radius, stimulusColor, positionJitter, XblockNumber, YblockNumber, ceilingTimeLimit, timeLimitDeclineStep, timeLimitInclineStep, canvasHeight, canvasWidth, initialSetSize);

            return() => {
                timeoutList.forEach(tm => {
                    clearTimeout(tm);
                })
            };
        }, [])

        useEffect(() => {
            switchSearchMode();
            createTargetCanvas();
        }, [searchTarget])

    function gameLogicScheme(trialNumber, backgroundColor, squareWidth, radius, stimulusColor, positionJitter, XblockNumber, YblockNumber, ceilingTimeLimit, timeLimitDeclineStep, timeLimitInclineStep, canvasHeight, canvasWidth, initialSetSize){
        gameLogicSchemeResult = {
            "game" : "conjunction-search",
            "schemeName" : "default",
            "version" : "1.0",
            "variant" : "main",
            "parameters" : {
                "trialNumber": {
                    "value" : trialNumber,
                    "unit" : null,
                    "description" : "Total number of trials"
                },
                "backgroundColor": {
                    "value": backgroundColor,
                    "unit": null,
                    "description" : "Background color of test canvas"
                },
                "stimulusShape" : {
                    "value" : [
                        {
                            "shapeName": "square",
                            "parameters": {
                                "squareWidth" : {
                                    "value": squareWidth,
                                    "unit": "px",
                                    "description" : "Square stimulus width"
                                }
                            },
                            "description" : "Square stimulus"
                        }, 
                        {
                            "shapeName": "circle",
                            "parameters": {
                                "radius" : {
                                    "value": radius,
                                    "unit": "px",
                                    "description" : "Circle stimulus radius"
                                }
                            },
                            "description" : "Circle stimulus"
                        }
                    ],
                    "unit" : null,
                    "description" : "Set of possible stimulus shape"
                },
                "stimulusColor": {
                    "value" : stimulusColor,
                    "unit" : null,
                    "description" : "Set of possible stimulus color"
                },
                "positionJitter" : {
                    "value": positionJitter,
                    "unit": "px",
                    "description": "Amplitude of spatial jittering in each axis"
                },
                "XblockNumber": {
                    "value": XblockNumber,
                    "unit": null,
                    "description": "Number of horizontal blocks composing the canvas"
                },
                "YblockNumber": {
                    "value": YblockNumber,
                    "unit": null,
                    "description": "Number of vertical blocks composing the canvas"
                },
                "ceilingTimeLimit" : {
                    "value" : ceilingTimeLimit,
                    "unit": "ms",
                    "description" : "Maximum(&initial) time limit of answer time in each trial"
                },
                "timeLimitDeclineStep" : {
                    "value" : timeLimitDeclineStep,
                    "unit" : "ms",
                    "description" : "Time limit declination step size at the maximum span"
                },
                "timeLimitInclineStep" : {
                    "value" : timeLimitInclineStep,
                    "unit" : "ms",
                    "description" : "Time limit inclination step size at the maximum span"
                },
                "canvasProperty" : {
                    "canvasHeight" : {
                        "value" : canvasHeight,
                        "unit" : "px",
                        "description" : "Height of canvas"
                    },
                    "canvasWidth" : {
                        "value" : canvasWidth,
                        "unit" : "px",
                        "description" : "Width of canvas"
                    }
                },
                "initialSetSize" : {
                    "value": initialSetSize,
                    "unit": null,
                    "description" : "Initial set size"
                }
            },
            "description" : "Conjunction search default scheme"
        }
        return gameLogicSchemeResult;
    }

    function initiateData() {
        hitRt = [];
        allRt = [];
        currSS = 2;
        ceilingSS = 0;
        latestHitRtIndex = 0;
        comboCount = [];
        correctButLateCount = 0;
        incorrectCount = 0;
        count = 0;
        currTrial = 0;
        Xtemps = [];
        Xs = [];
        Ytemps = [];
        Ys = [];
        posId = [];
        hit2SetSizeRtF = [];
        hit6SetSizeRtF = [];
        hit12SetSizeRtF = [];
        hit24SetSizeRtF = [];
        hit44SetSizeRtF = [];
        correctRejection2SetSizeRtF = [];
        correctRejection6SetSizeRtF = [];
        correctRejection12SetSizeRtF = [];
        correctRejection24SetSizeRtF = [];
        correctRejection44SetSizeRtF = [];
        hit2SetSizeRtC = [];
        hit6SetSizeRtC = [];
        hit12SetSizeRtC = [];
        hit24SetSizeRtC = [];
        hit44SetSizeRtC = [];
        correctRejection2SetSizeRtC = [];
        correctRejection6SetSizeRtC = [];
        correctRejection12SetSizeRtC = [];
        correctRejection24SetSizeRtC = [];
        correctRejection44SetSizeRtC = [];
    }

    function createTargetCanvas() {
        let cv: HTMLCanvasElement = document.getElementById("target-canvas") as HTMLCanvasElement;
        if (cv) {
            let ctx: CanvasRenderingContext2D = cv.getContext("2d") as CanvasRenderingContext2D;
            let xOffset = cv.width / 2;
            if (searchTarget?.col === 1) {
                ctx.strokeStyle = '#FFC837'
                ctx.fillStyle = '#FFC837';
            } else if (searchTarget?.col === 0) {
                ctx.strokeStyle = '#0072FF'
                ctx.fillStyle = '#0072FF';
            }
            if (searchTarget?.shape === 0) {
                ctx.rect(xOffset - 10, cv.height - 21, 20, 20);
            } else if (searchTarget?.shape === 1) {
                ctx.arc(xOffset, cv.height - 11, 10, 0, 2 * Math.PI);
            } 
            ctx.stroke();
            ctx.fill();
        }
    }

    function createPseudorandomStimuli() {
        allSetsizeAndTarget = [];
        let allSetsizeRange = [2, 6, 12, 24, 44];
        let trialsPerSetsize = 8; 
        let targetCondition = 2; // target appear or disappear
        let searchMode = 2; // feature or conjunction 
        let trialsPerCondition = trialsPerSetsize / targetCondition; 

        for (let iSetsize = 0; iSetsize < allSetsizeRange.length; iSetsize++) {
            for (let iRep = 0; iRep < trialsPerCondition; iRep++) {
                for (let iTarget = 0; iTarget < targetCondition; iTarget++) {
                    for (let iMode = 0; iMode < searchMode; iMode++) {
                        allSetsizeAndTarget.push([allSetsizeRange[iSetsize],iTarget,iMode]);
                    }
                }
            }
        }
        Shuffle(allSetsizeAndTarget); 
        // shuffleWithCondition();
        trialNumber = trialsPerSetsize * allSetsizeRange.length * searchMode;
    }

    function shuffleWithCondition() { 
        // condition: prevent repetition 4 times in the row in every modes
        let conditionUnsatisfied: boolean = true;
        
        // this while loop will be continue till the conditionUnsatisfied turns to false
        while (conditionUnsatisfied) { 
            let allMode: number[] = [];
            let reShuffle: boolean = false;
            Shuffle(allSetsizeAndTarget); 

            for (let i = 0; i < allSetsizeAndTarget.length; i++){
                // push only search mode into allMode array
                allMode.push(allSetsizeAndTarget[i][2]); 
                        
                // check this array for mode value(0 or 1) 4 times repetition in the row 
                if (allMode[i] === allMode[i - 1] && 
                    allMode[i] === allMode[i - 2] && 
                    allMode[i] === allMode[i - 3]){
                    // when the loop found 4 times repetition, change the reShuffle = true
                    reShuffle = true;
                } 
            }
            
            // didn't find any 4 times repetition, reShuffle still 'false' from the beginning of the while loop
            if (reShuffle === false) {
                // change conditionUnsatisfied = false to end the while loop
                conditionUnsatisfied = false;
            }
        }
    }

    function switchSearchMode() {
        if (searchTarget) {
            oris = [];
            cols = [];
            if (allSetsizeAndTarget[currTrial][2] === 0) {
                // feature search
                allSearchMode.push('feature search');
                for (let j = 0; j < maxSS; j++) { oris.push(0); oris.push(0)};
                if (searchTarget.shape === 1) {
                    shapeRand = [1];
                } else {
                    shapeRand = [0];
                }
                if (searchTarget.col === 1) {
                    for (let k = 0; k < maxSS; k++) { cols.push(0); cols.push(0)};
                } else {
                    for (let k = 0; k < maxSS; k++) { cols.push(1); cols.push(1)};
                }
            } else {
                // conjunction search
                allSearchMode.push('conjunction search');
                for (let j = 0; j < maxSS; j++) { oris.push(0); oris.push(1)};
                for (let k = 0; k < maxSS; k++) { cols.push(0); cols.push(1)};
                if (searchTarget.shape === 1) {
                    shapeRand = [1];
                } 
                else {
                    shapeRand = [0];
                }
                if (searchTarget.col === 1) {
                    for (let k = 0; k < cols.length; k++) { cols[k] = 1 - cols[k] };
                } 
            }
            // if createCanvas() runs before switchSearchMode() the target and distractors position might be overlapped
            if (currTrial === 0){ 
                // create only one time when the game started
                createCanvas();
            }
            initialT(0, allSetsizeAndTarget[currTrial][0]);
        }
    }
    
    function createCanvas() {
        myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        canvasContext = myCanvas.getContext("2d") as CanvasRenderingContext2D;
        centerX = myCanvas.width / 2;
        centerY = myCanvas.height / 2;

        for (var ix = 0; ix < XblockNumber; ix++) {
            Xtemps.push(Math.round(Xblock / 2) + Xblock * ix - Xspan + centerX);
        }

        for (var iy = 0; iy < YblockNumber; iy++) {
            Ytemps.push(Math.round(Yblock / 2) + Yblock * iy - Yspan + centerY);
        }

        for (ix = 0; ix < XblockNumber; ix++) {
            for (iy = 0; iy < YblockNumber; iy++) {
                Xs.push(Xtemps[ix]);
                Ys.push(Ytemps[iy]);
                posId.push(count);
                count++;
            }
        }
        myCanvas.hidden = false;
    }

    function initialT(_waittime, SS) {
        setDisabledButton(false);
        setSizeRecord.push(SS);
        timeLimitRecord.push(timeLimit);
        if (!ceilingSS) {
            ceilingSS = SS + 1;
        };
        vismem.erase(canvasContext);
        vismem.clear();
        allCurrSS.push(allSetsizeAndTarget[currTrial][0]);
        shuffleSS(SS);
        targetData(squareWidth, ori, col);
        makeBackground(backgroundColor);
        makeSearchArray(X, Y, squareWidth, squareHeight, ori, col);
        stimulusData(realX, realY, squareWidth, ori, col);
        vismem.drawObjects(canvasContext, vismem.objects);
        let dT = new Date();
        STT = dT.getTime();
        allStartTime.push(thisTime());
    }

    function shuffleSS(setSize) {
        Shuffle(posId);
        X = []; for (let ix = 0; ix < setSize + 1; ix++) { X.push(Xs[posId[ix]]) };
        Y = []; for (let iy = 0; iy < setSize + 1; iy++) { Y.push(Ys[posId[iy]]) };
        ori = []; for (let j = 0; j < setSize; j++) { ori.push(oris[j]) };
        col = []; for (let j = 0; j < setSize; j++) { col.push(stimulusColor[cols[j]]) };

        // check if this trial is feature or conjunction search
        if (allSetsizeAndTarget[currTrial][2] === 0) {
            // feature search
            // check if the target appears or disappears
            if (allSetsizeAndTarget[currTrial][1] === 0) {
                // disappears
                ori.push(oris[setSize]);
                col.push(stimulusColor[cols[setSize]]);
            } else {
                // appears
                ori.push(1 - oris[setSize]);
                col.push(stimulusColor[1 - cols[setSize]]);
            }
        } else {
            // conjunction search
            // check if the target appears or disappears
            if (allSetsizeAndTarget[currTrial][1] === 0) {
                // disappears
                ori.push(oris[setSize]);
                col.push(stimulusColor[cols[setSize]]);
            } else {
                // appears
                ori.push(1 - oris[setSize]);
                col.push(stimulusColor[cols[setSize]]);
            }
        }
    }

    function makeBackground(backgroundColor) {
        // Fill background
        vismem.makeRectangle('bg', centerX, centerY, canvasWidth, canvasHeight, false, backgroundColor, backgroundColor);
    }

    let realX: number[] = [];
    let realY: number[] = [];
    function makeSearchArray(numarrayX, numarrayY, squareWidth, squareHeight, orienVec, colorVec) {
        for (let i = 0; i < orienVec.length; i++) {
            if (orienVec[i] === shapeRand[0]) {
                vismem.makeCircle('c', numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter, numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter, radius, false, colorVec[i], colorVec[i]);
            } else {
                vismem.makeRectangle('s', numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter, numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter, squareHeight, squareWidth, false, colorVec[i], colorVec[i], 0, 0);
            }
            realX.push(numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter);
            realY.push(numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter);
        }
        if (searchTarget) {
            // Find Target from Object
            let find = vismem.objects.find(x => x.id === (searchTarget.shape === 0 ? 's' : 'c') && x.color === stimulusColor[searchTarget.col])
            change = find ? 1 : 0
            targetMatch.push(find ? true : false);
        }
    }
    
    function targetData(width, ori, col) {
        let thisShape = "";
        let thisParameterName = "";
        let thisValue = 0;
        let obj_in_trial: any[] = [];
        let obj_to_append;
        if (shapeRand[0] === 1) {
            thisShape = "circle";
                thisParameterName = "radius";
                thisValue = radius;
            } else {
                thisShape = "square";
                thisParameterName = "width";
                thisValue = width;
            }

            if (searchTarget) {
                obj_to_append = {
                    "shape" : thisShape,
                    "shapeParams" : {
                        "parameterName" : thisParameterName,
                        "value" : thisValue,
                        "unit" : "px"
                    },
                    "color" : stimulusColor[searchTarget.col]
                }
                obj_in_trial.push(obj_to_append);
            }
        targetDataResult = obj_in_trial[obj_in_trial.length - 1];
        return targetDataResult;
    }

    function stimulusData(x, y, width, ori, col) {
        let thisShape = "";
        let thisParameterName = "";
        let thisValue = 0;
        let obj_in_trial: any[] = [];
        
        for (let i = 0; i < col.length; i++){
            let obj_to_append;
            if (ori[i] === shapeRand[0]) {
                thisShape = "circle";
                thisParameterName = "radius";
                thisValue = radius;
            } else {
                thisShape = "square";
                thisParameterName = "width";
                thisValue = width;
            }
                obj_to_append = {
                "type" : "distractor",
                "display" : {
                    "shape" : thisShape,
                    "shapeParams" : {
                        "parameterName" : thisParameterName,
                        "value" : thisValue,
                        "unit" : "px"
                    },
                    "color" : col[i]
                },
                "position" : {
                    "x" : {
                        "value" : x[i],
                        "unit" : "px"
                    },
                    "y" : {
                        "value" : y[i],
                        "unit" : "px"
                    }
                }
            }   
            obj_in_trial.push(obj_to_append);
        }
        obj_in_trial[obj_in_trial.length - 1].type = "target";
        stimulusDataResult.push(obj_in_trial);
        return stimulusDataResult;
    }

    function trialData(targetMatch, allStartTime, allCurrSS, allClickTime, checkAns, stimulusDataResult, allSearchMode){
        let thisAns;
        let obj_in_trial: any[] = [];
        for (let i = 0; i < targetMatch.length; i++){
            let obj_to_append;
            if (checkAns[i] === 'right' || checkAns[i] === 'late'){
                thisAns = true;
            } else {
                thisAns = false;
            }
            obj_to_append = {
                "hasTarget" : targetMatch[i],
                "startTime" : allStartTime[i],
                "setSize" : allCurrSS[i],
                "answerTime" : allClickTime[i],
                "hasTargetAnswerBool" : thisAns,
                "stimulusData" : stimulusDataResult[i],
                "mode" : allSearchMode[i]
            }
            obj_in_trial.push(obj_to_append);
        }
        trialDataResult.push(obj_in_trial[obj_in_trial.length - 1]);
        return trialDataResult;
    }
    
    function checkResp(foo) {
        setProgressValue(progressValue + 1);
        // clickSound();
        let dT2 = new Date();
        ET = dT2.getTime();
        allClickTime.push(thisTime());
        let rt = ET - STT;
        allRt.push(rt);
        if (change === foo) {
            // combo2Sound();
            if (rt < timeLimit) {
                trackRecord = trackRecord + 1;
                thatRight = 'right';
                checkAns.push(thatRight);
                hitRt.push(rt);
                if (levelUpCount === 0) {
                    comboCount.push(0);
                } else if (levelUpCount === 1) {
                    comboCount.push(1);
                } else if (levelUpCount === 2) {
                    comboCount.push(2);
                } else if (levelUpCount === 3) {
                    comboCount.push(3);
                } else if (levelUpCount === 4) {
                    comboCount.push(4);
                } else if (levelUpCount === 5) {
                    comboCount.push(5);
                }
            } else {
                // combo2Sound();
                thatRight = 'late';
                trackRecord = 0;
                checkAns.push(thatRight);
                correctButLateCount++;
            }

            // check if feature or conjunction mode
            if (allSetsizeAndTarget[currTrial][2] === 0){
                // feature
                // check if target appear or disappear
                if (allSetsizeAndTarget[currTrial][1] === 0){
                    // disappear
                    // check setsize that correct rejection
                    if (allSetsizeAndTarget[currTrial][0] === 2){
                        correctRejection2SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                        correctRejection6SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                        correctRejection12SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                        correctRejection24SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                        correctRejection44SetSizeRtF.push(rt);
                    }
                } else {
                    // appear
                    // check setsize that hit
                    if (allSetsizeAndTarget[currTrial][0] === 2){
                        hit2SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                        hit6SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                        hit12SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                        hit24SetSizeRtF.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                        hit44SetSizeRtF.push(rt);
                    }
                }
            } else {
                // conjunction
                // check if target appear or disappear
                if (allSetsizeAndTarget[currTrial][1] === 0){
                    // disappear
                    // check setsize that correct rejection
                    if (allSetsizeAndTarget[currTrial][0] === 2){
                        correctRejection2SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                        correctRejection6SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                        correctRejection12SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                        correctRejection24SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                        correctRejection44SetSizeRtC.push(rt);
                    }
                } else {
                    // appear
                    // check setsize that hit
                    if (allSetsizeAndTarget[currTrial][0] === 2){
                        hit2SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                        hit6SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                        hit12SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                        hit24SetSizeRtC.push(rt);
                    } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                        hit44SetSizeRtC.push(rt);
                    }
                }
            }
        } else {
            // losingSound();
            thatRight = 'wrong';
            trackRecord = 0;
            checkAns.push(thatRight);
            incorrectCount++;
        }
        trialDataResult = trialData(targetMatch, allStartTime, allCurrSS, allClickTime, checkAns, stimulusDataResult, allSearchMode);
        trialIsOver();
    }

    function trialIsOver() {
        vismem.erase(canvasContext);
        vismem.clear();
        makeBackground(backgroundColor)
        vismem.drawObjects(canvasContext, vismem.objects);
        if (trackRecord >= NupNdown) {
            if (allSetsizeAndTarget[currTrial][0] < maxSS * 2 - 2) {
                // currSS = currSS + 2;
                ceilingSS = allSetsizeAndTarget[currTrial][0] + 1;
                if (levelUpCount === 5) {
                    levelUpCount = 5;
                } else {
                    levelUpCount++
                }
            } else {
                ceilingSS = allSetsizeAndTarget[currTrial][0] + 1;
                timeLimit = timeLimit - timeLimitDeclineStep;
            }
        }

        if (trackRecord === 0 && allSetsizeAndTarget[currTrial][0] > 4) {
            // currSS = currSS - 2;
            timeLimit = timeLimit + timeLimitInclineStep;
            if (timeLimit > ceilingTimeLimit) {
                timeLimit = ceilingTimeLimit;
            }
        }
        currTrial = currTrial + 1;
        if (currTrial >= trialNumber) {
            summarySetSize();
            summaryScore();
            Done();
        } else {
            trialConclude();
        }
    }
    
    function trialConclude() {
        setDisabledButton(true);
        vismem.erase(canvasContext);
        vismem.clear();
        makeBackground(backgroundColor);
        vismem.drawObjects(canvasContext, vismem.objects);
        
        let textHeight = 0;
        if (thatRight === 'wrong'){
            responseText = "ผิด";
            textHeight = 36;
        } else {
            responseText = "ถูก";
            textHeight = 20;
        }

        canvasContext.font = "120px Sarabun"
        let textWidth = canvasContext.measureText(responseText).width;
        timeoutList.push(
            setTimeout(function() {
                let text = vismem.makeText('t', centerX - textWidth/2, centerY + textHeight, responseText, "Black", canvasContext.font);
                vismem.drawText(canvasContext, text);
            }, 100),

            setTimeout(function() {
                vismem.erase(canvasContext);
                vismem.clear();
                makeBackground(backgroundColor);
                vismem.drawObjects(canvasContext, vismem.objects);
            }, 600),

            setTimeout(function() {
                switchSearchMode();
            }, 900)
        )
    }

    function summarySetSize() {
        let sumHit2SetSizeRtF;
        let sumHit6SetSizeRtF;
        let sumHit12SetSizeRtF;
        let sumHit24SetSizeRtF;
        let sumHit44SetSizeRtF;
        let sumCorrectRejection2SetSizeRtF;
        let sumCorrectRejection6SetSizeRtF;
        let sumCorrectRejection12SetSizeRtF;
        let sumCorrectRejection24SetSizeRtF;
        let sumCorrectRejection44SetSizeRtF;
        let sumHit2SetSizeRtC;
        let sumHit6SetSizeRtC;
        let sumHit12SetSizeRtC;
        let sumHit24SetSizeRtC;
        let sumHit44SetSizeRtC;
        let sumCorrectRejection2SetSizeRtC;
        let sumCorrectRejection6SetSizeRtC;
        let sumCorrectRejection12SetSizeRtC;
        let sumCorrectRejection24SetSizeRtC;
        let sumCorrectRejection44SetSizeRtC;
        let featureOrConjunctionCondition = 2; // feature or conjunction
        let appearOrDisappearCondition = 2; // appear or disappear
        let setSizeCondition = 5; // [2, 6, 12, 24, 44] setsize
        let trialNumberPerCondition = allSetsizeAndTarget.length / (featureOrConjunctionCondition * appearOrDisappearCondition * setSizeCondition);

        // feature section
        // 2 setsize section
        hitAccuracy2SetSizeF = hit2SetSizeRtF.length / trialNumberPerCondition * 100;
        if (hit2SetSizeRtF.length !== 0){
            sumHit2SetSizeRtF = hit2SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit2SetSizeRtF.push(0);
            sumHit2SetSizeRtF = hit2SetSizeRtF;
        }

        avgHit2SetSizeRtF = sumHit2SetSizeRtF / 1000 / hit2SetSizeRtF.length;

        correctRejectionAccuracy2SetSizeF = correctRejection2SetSizeRtF.length / trialNumberPerCondition * 100;
        if (correctRejection2SetSizeRtF.length !== 0){
            sumCorrectRejection2SetSizeRtF = correctRejection2SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection2SetSizeRtF.push(0);
            sumCorrectRejection2SetSizeRtF = correctRejection2SetSizeRtF;
        }

        avgCorrectRejection2SetSizeRtF = sumCorrectRejection2SetSizeRtF / 1000 / correctRejection2SetSizeRtF.length;

        // 6 setsize section
        hitAccuracy6SetSizeF = hit6SetSizeRtF.length / trialNumberPerCondition * 100;
        if (hit6SetSizeRtF.length !== 0){
            sumHit6SetSizeRtF = hit6SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit6SetSizeRtF.push(0);
            sumHit6SetSizeRtF = hit6SetSizeRtF;
        }

        avgHit6SetSizeRtF = sumHit6SetSizeRtF / 1000 / hit6SetSizeRtF.length;

        correctRejectionAccuracy6SetSizeF = correctRejection6SetSizeRtF.length / trialNumberPerCondition * 100;
        if (correctRejection6SetSizeRtF.length !== 0){
            sumCorrectRejection6SetSizeRtF = correctRejection6SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection6SetSizeRtF.push(0);
            sumCorrectRejection6SetSizeRtF = correctRejection6SetSizeRtF;
        }

        avgCorrectRejection6SetSizeRtF = sumCorrectRejection6SetSizeRtF / 1000 / correctRejection6SetSizeRtF.length;

        // 12 setsize section
        hitAccuracy12SetSizeF = hit12SetSizeRtF.length / trialNumberPerCondition * 100;
        if (hit12SetSizeRtF.length !== 0){
            sumHit12SetSizeRtF = hit12SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit12SetSizeRtF.push(0);
            sumHit12SetSizeRtF = hit2SetSizeRtF;
        }

        avgHit12SetSizeRtF = sumHit12SetSizeRtF / 1000 / hit12SetSizeRtF.length;

        correctRejectionAccuracy12SetSizeF = correctRejection12SetSizeRtF.length / trialNumberPerCondition * 100;
        if (correctRejection12SetSizeRtF.length !== 0){
            sumCorrectRejection12SetSizeRtF = correctRejection12SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection12SetSizeRtF.push(0);
            sumCorrectRejection12SetSizeRtF = correctRejection12SetSizeRtF;
        }

        avgCorrectRejection12SetSizeRtF = sumCorrectRejection12SetSizeRtF / 1000 / correctRejection12SetSizeRtF.length;

        // 24 setsize section
        hitAccuracy24SetSizeF = hit24SetSizeRtF.length / trialNumberPerCondition * 100;
        if (hit24SetSizeRtF.length !== 0){
            sumHit24SetSizeRtF = hit24SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit24SetSizeRtF.push(0);
            sumHit24SetSizeRtF = hit24SetSizeRtF;
        }

        avgHit24SetSizeRtF = sumHit24SetSizeRtF / 1000 / hit24SetSizeRtF.length;

        correctRejectionAccuracy24SetSizeF = correctRejection24SetSizeRtF.length / trialNumberPerCondition * 100;
        if (correctRejection24SetSizeRtF.length !== 0){
            sumCorrectRejection24SetSizeRtF = correctRejection24SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection24SetSizeRtF.push(0);
            sumCorrectRejection24SetSizeRtF = correctRejection24SetSizeRtF;
        }

        avgCorrectRejection24SetSizeRtF = sumCorrectRejection24SetSizeRtF / 1000 / correctRejection24SetSizeRtF.length;

        // 44 setsize section
        hitAccuracy44SetSizeF = hit44SetSizeRtF.length / trialNumberPerCondition * 100;
        if (hit44SetSizeRtF.length !== 0){
            sumHit44SetSizeRtF = hit44SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit44SetSizeRtF.push(0);
            sumHit44SetSizeRtF = hit44SetSizeRtF;
        }

        avgHit44SetSizeRtF = sumHit44SetSizeRtF / 1000 / hit44SetSizeRtF.length;

        correctRejectionAccuracy44SetSizeF = correctRejection44SetSizeRtF.length / trialNumberPerCondition * 100;
        if (correctRejection44SetSizeRtF.length !== 0){
            sumCorrectRejection44SetSizeRtF = correctRejection44SetSizeRtF.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection44SetSizeRtF.push(0);
            sumCorrectRejection44SetSizeRtF = correctRejection44SetSizeRtF;
        }

        avgCorrectRejection44SetSizeRtF = sumCorrectRejection44SetSizeRtF / 1000 / correctRejection44SetSizeRtF.length;

        // conjunction section
        // 2 setsize section
        hitAccuracy2SetSizeC = hit2SetSizeRtC.length / trialNumberPerCondition * 100;
        if (hit2SetSizeRtC.length !== 0){
            sumHit2SetSizeRtC = hit2SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit2SetSizeRtC.push(0);
            sumHit2SetSizeRtC = hit2SetSizeRtC;
        }

        avgHit2SetSizeRtC = sumHit2SetSizeRtC / 1000 / hit2SetSizeRtC.length;

        correctRejectionAccuracy2SetSizeC = correctRejection2SetSizeRtC.length / trialNumberPerCondition * 100;
        if (correctRejection2SetSizeRtC.length !== 0){
            sumCorrectRejection2SetSizeRtC = correctRejection2SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection2SetSizeRtC.push(0);
            sumCorrectRejection2SetSizeRtC = correctRejection2SetSizeRtC;
        }

        avgCorrectRejection2SetSizeRtC = sumCorrectRejection2SetSizeRtC / 1000 / correctRejection2SetSizeRtC.length;

        // 6 setsize section
        hitAccuracy6SetSizeC = hit6SetSizeRtC.length / trialNumberPerCondition * 100;
        if (hit6SetSizeRtC.length !== 0){
            sumHit6SetSizeRtC = hit6SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit6SetSizeRtC.push(0);
            sumHit6SetSizeRtC = hit6SetSizeRtC;
        }

        avgHit6SetSizeRtC = sumHit6SetSizeRtC / 1000 / hit6SetSizeRtC.length;

        correctRejectionAccuracy6SetSizeC = correctRejection6SetSizeRtC.length / trialNumberPerCondition * 100;
        if (correctRejection6SetSizeRtC.length !== 0){
            sumCorrectRejection6SetSizeRtC = correctRejection6SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection6SetSizeRtC.push(0);
            sumCorrectRejection6SetSizeRtC = correctRejection6SetSizeRtC;
        }

        avgCorrectRejection6SetSizeRtC = sumCorrectRejection6SetSizeRtC / 1000 / correctRejection6SetSizeRtC.length;

        // 12 setsize section
        hitAccuracy12SetSizeC = hit12SetSizeRtC.length / trialNumberPerCondition * 100;
        if (hit12SetSizeRtC.length !== 0){
            sumHit12SetSizeRtC = hit12SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit12SetSizeRtC.push(0);
            sumHit12SetSizeRtC = hit2SetSizeRtC;
        }

        avgHit12SetSizeRtC = sumHit12SetSizeRtC / 1000 / hit12SetSizeRtC.length;

        correctRejectionAccuracy12SetSizeC = correctRejection12SetSizeRtC.length / trialNumberPerCondition * 100;
        if (correctRejection12SetSizeRtC.length !== 0){
            sumCorrectRejection12SetSizeRtC = correctRejection12SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection12SetSizeRtC.push(0);
            sumCorrectRejection12SetSizeRtC = correctRejection12SetSizeRtC;
        }

        avgCorrectRejection12SetSizeRtC = sumCorrectRejection12SetSizeRtC / 1000 / correctRejection12SetSizeRtC.length;

        // 24 setsize section
        hitAccuracy24SetSizeC = hit24SetSizeRtC.length / trialNumberPerCondition * 100;
        if (hit24SetSizeRtC.length !== 0){
            sumHit24SetSizeRtC = hit24SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit24SetSizeRtC.push(0);
            sumHit24SetSizeRtC = hit24SetSizeRtC;
        }

        avgHit24SetSizeRtC = sumHit24SetSizeRtC / 1000 / hit24SetSizeRtC.length;

        correctRejectionAccuracy24SetSizeC = correctRejection24SetSizeRtC.length / trialNumberPerCondition * 100;
        if (correctRejection24SetSizeRtC.length !== 0){
            sumCorrectRejection24SetSizeRtC = correctRejection24SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection24SetSizeRtC.push(0);
            sumCorrectRejection24SetSizeRtC = correctRejection24SetSizeRtC;
        }

        avgCorrectRejection24SetSizeRtC = sumCorrectRejection24SetSizeRtC / 1000 / correctRejection24SetSizeRtC.length;

        // 44 setsize section
        hitAccuracy44SetSizeC = hit44SetSizeRtC.length / trialNumberPerCondition * 100;
        if (hit44SetSizeRtC.length !== 0){
            sumHit44SetSizeRtC = hit44SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit44SetSizeRtC.push(0);
            sumHit44SetSizeRtC = hit44SetSizeRtC;
        }

        avgHit44SetSizeRtC = sumHit44SetSizeRtC / 1000 / hit44SetSizeRtC.length;

        correctRejectionAccuracy44SetSizeC = correctRejection44SetSizeRtC.length / trialNumberPerCondition * 100;
        if (correctRejection44SetSizeRtC.length !== 0){
            sumCorrectRejection44SetSizeRtC = correctRejection44SetSizeRtC.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection44SetSizeRtC.push(0);
            sumCorrectRejection44SetSizeRtC = correctRejection44SetSizeRtC;
        }

        avgCorrectRejection44SetSizeRtC = sumCorrectRejection44SetSizeRtC / 1000 / correctRejection44SetSizeRtC.length;
    }

    function summaryScore() {
        for (let correctIndex = latestHitRtIndex; correctIndex < comboCount.length; correctIndex++) {
            latestHitRtIndex = correctIndex;
            let rtScore = rtBound - hitRt[correctIndex];
            let comboMultiplier = 0;
            if (comboCount[correctIndex] === 0) {
                comboMultiplier = 1;
            } else if (comboCount[correctIndex] === 1) {
                comboMultiplier = 1.05;
            } else if (comboCount[correctIndex] === 2) {
                comboMultiplier = 1.10;
            } else if (comboCount[correctIndex] === 3) {
                comboMultiplier = 1.20;
            } else if (comboCount[correctIndex] === 4) {
                comboMultiplier = 1.50;
            } else if (comboCount[correctIndex] === 5) {
                comboMultiplier = 2.00;
            }
            rtScore *= comboMultiplier;
            scorePerTrial.push(rtScore);
        }
        sumScores = scorePerTrial.reduce((sum, score) => {
            return sum + score;
        });

        sumRt = allRt.reduce((sum, scores) => {
            return sum + scores;
        });

        if (hitRt.length !== 0){
            sumHitRt = hitRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hitRt.push(0);
            sumHitRt = hitRt;
        }

        avgHitRt = sumHitRt / 1000 / hitRt.length;
        if (avgHitRt < 1) {
            swiftness = "เร็วมาก";
        }
        else if (avgHitRt < 2) {
            swiftness = "เร็ว";
        }
        else {
            swiftness = "ปานกลาง";
        }

        total = Math.max(10000, Math.round((sumScores - (incorrectCount * incorrectMultiplier + correctButLateCount * lateMultiplier)) * scoresMultiplier / trialNumber));

        return total;
    }

    function Done() {
        setIsItDone(true);
        score = total;
        hightestSetSizeCheck(checkAns, setSizeRecord);
        scoringDataResult = scoringData(rtBound, incorrectMultiplier, lateMultiplier, scoresMultiplier, trialNumber, total);
        metricDataResult = metricData(trialNumber, incorrectCount, correctButLateCount, setSizeInCorrectAns, timeLimitRecord, hitRt, avgHitRt, swiftness);
        postEntryResult = postEntry(targetDataResult, trialDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult);
        axios.post('https://exercise-vercel-svelte-backend.vercel.app/api/hard/conjunction_search', postEntryResult)
            .then(function (postEntryResult) {
                console.log(postEntryResult)
            })
            .catch(function (error) {
                console.log('error')
            });
        saveJSONDataToClientDevice(postEntryResult, `Subject${props.userId}_visualsearch_hard_session${props.userSession}_${thisTime().toString()}`);
    }

    function scoringData(rtBound, incorrectMultiplier, lateMultiplier, scoresMultiplier, trialNumber, total){
        scoringDataResult = [{
            "scoringModel" : {
                "scoringName" : "default",
                "parameters" : {
                    "rtBound" : {
                        "value" : rtBound,
                        "unit" : null,
                        "description" : "rtBound - hitRt = rtScore"
                    },
                    "incorrectMultiplier" : {
                        "value" : incorrectMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for incorrectCount"
                    },
                    "lateMultiplier" : {
                        "value" : lateMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for correctButLateCount"
                    },
                    "scoresMultiplier" : {
                        "value" : scoresMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for total score"
                    },
                    "trialNumber" : {
                        "value" : trialNumber,
                        "unit" : null,
                        "description" : "Total number of trials"
                    }
                },
                "description" : `score = (sumScores - (incorrectCount * incorrectMultiplier + correctButLateCount * lateMultiplier)) * scoresMultiplier / trialNumber; comboMultiplier depends on comboCount if comboCount = [0, 1, 2, 3, 4, 5] -> comboMultiplier = [1, 1.05, 1.10, 1.20, 1.50, 2]`
            },
            "score" : total
        }]
        return scoringDataResult;
    }

    function hightestSetSizeCheck(checkAns, setSizeRecord){
        for (let i = 0; i < checkAns.length; i++){
            if (checkAns[i] === 'right' || checkAns[i] === 'late'){
                setSizeInCorrectAns.push(setSizeRecord[i])
            } 
        }
        setSizeInCorrectAns.sort((a,b) => a-b);
        return setSizeInCorrectAns;
    }

    function metricData(trialNumber, incorrectCount, correctButLateCount, setSizeInCorrectAns, timeLimitRecord, hitRt, avgHitRt, swiftness){
        timeLimitRecord.sort((a,b) => a-b);
        hitRt.sort((a,b) => a-b);
        let metricName 
            = ['correctCount', 
               'incorrectCount', 
               'correctButLateCount', 
               'highestSetSize', 
               'lowestTimeLimit', 
               'fastestHitReactionTime', 
               'averageHitReactionTime', 
               'swiftness',
               'hitAccuracyFeature2SS',
               'avgHitReactionTimeFeature2SS',
               'hitAccuracyFeature6SS',
               'avgHitReactionTimeFeature6SS',
               'hitAccuracyFeature12SS',
               'avgHitReactionTimeFeature12SS',
               'hitAccuracyFeature24SS',
               'avgHitReactionTimeFeature24SS',
               'hitAccuracyFeature44SS',
               'avgHitReactionTimeFeature44SS',
               'correctRejectionAccuracyFeature2SS',
               'avgCorrectRejectionTimeFeature2SS',
               'correctRejectionAccuracyFeature6SS',
               'avgCorrectRejectionTimeFeature6SS',
               'correctRejectionAccuracyFeature12SS',
               'avgCorrectRejectionTimeFeature12SS',
               'correctRejectionAccuracyFeature24SS',
               'avgCorrectRejectionTimeFeature24SS',
               'correctRejectionAccuracyFeature44SS',
               'avgCorrectRejectionTimeFeature44SS',
               'hitAccuracyConjunction2SS',
               'avgHitReactionTimeConjunction2SS',
               'hitAccuracyConjunction6SS',
               'avgHitReactionTimeConjunction6SS',
               'hitAccuracyConjunction12SS',
               'avgHitReactionTimeConjunction12SS',
               'hitAccuracyConjunction24SS',
               'avgHitReactionTimeConjunction24SS',
               'hitAccuracyConjunction44SS',
               'avgHitReactionTimeConjunction44SS',
               'correctRejectionAccuracyConjunction2SS',
               'avgCorrectRejectionTimeConjunction2SS',
               'correctRejectionAccuracyConjunction6SS',
               'avgCorrectRejectionTimeConjunction6SS',
               'correctRejectionAccuracyConjunction12SS',
               'avgCorrectRejectionTimeConjunction12SS',
               'correctRejectionAccuracyConjunction24SS',
               'avgCorrectRejectionTimeConjunction24SS',
               'correctRejectionAccuracyConjunction44SS',
               'avgCorrectRejectionTimeConjunction44SS',];
        let metricValue 
            = [trialNumber - incorrectCount, 
               incorrectCount, 
               correctButLateCount, 
               setSizeInCorrectAns[setSizeInCorrectAns.length - 1], 
               timeLimitRecord[1], 
               hitRt[0], 
               avgHitRt, 
               swiftness,
               hitAccuracy2SetSizeF,
               avgHit2SetSizeRtF,
               hitAccuracy6SetSizeF,
               avgHit6SetSizeRtF,
               hitAccuracy12SetSizeF,
               avgHit12SetSizeRtF,
               hitAccuracy24SetSizeF,
               avgHit24SetSizeRtF,
               hitAccuracy44SetSizeF,
               avgHit44SetSizeRtF,
               correctRejectionAccuracy2SetSizeF,
               avgCorrectRejection2SetSizeRtF,
               correctRejectionAccuracy6SetSizeF,
               avgCorrectRejection6SetSizeRtF,
               correctRejectionAccuracy12SetSizeF,
               avgCorrectRejection12SetSizeRtF,
               correctRejectionAccuracy24SetSizeF,
               avgCorrectRejection24SetSizeRtF,
               correctRejectionAccuracy44SetSizeF,
               avgCorrectRejection44SetSizeRtF,
               hitAccuracy2SetSizeC,
               avgHit2SetSizeRtC,
               hitAccuracy6SetSizeC,
               avgHit6SetSizeRtC,
               hitAccuracy12SetSizeC,
               avgHit12SetSizeRtC,
               hitAccuracy24SetSizeC,
               avgHit24SetSizeRtC,
               hitAccuracy44SetSizeC,
               avgHit44SetSizeRtC,
               correctRejectionAccuracy2SetSizeC,
               avgCorrectRejection2SetSizeRtC,
               correctRejectionAccuracy6SetSizeC,
               avgCorrectRejection6SetSizeRtC,
               correctRejectionAccuracy12SetSizeC,
               avgCorrectRejection12SetSizeRtC,
               correctRejectionAccuracy24SetSizeC,
               avgCorrectRejection24SetSizeRtC,
               correctRejectionAccuracy44SetSizeC,
               avgCorrectRejection44SetSizeRtC,];
        let metricUnit = [null, null, null, null, 'ms', 'ms', 's', null, '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's'];
        let metricDescription 
            = ['Total number of correct trials', 
               'Total number of incorrect trials', 
               'Total number of correct but late trials', 
               'The highest set size that user reached', 
               'The lowest time limit for trials that user reached', 
               'The fastest hit reaction time that user reached', 
               'The average of all hit reaction time', 
               'The quality of all hit reaction time',
               'The accuracy of 2 setsize hit in feature mode',
               'The average reaction time of all 2 setsize hit in feature mode',
               'The accuracy of 6 setsize hit in feature mode',
               'The average reaction time of all 6 setsize hit in feature mode',
               'The accuracy of 12 setsize hit in feature mode',
               'The average reaction time of all 12 setsize hit in feature mode',
               'The accuracy of 24 setsize hit in feature mode',
               'The average reaction time of all 24 setsize hit in feature mode',
               'The accuracy of 44 setsize hit in feature mode',
               'The average reaction time of all 44 setsize hit in feature mode',
               'The accuracy of 2 setsize correct rejection in feature mode',
               'The average reaction time of all 2 setsize correct rejection in feature mode',
               'The accuracy of 6 setsize correct rejection in feature mode',
               'The average reaction time of all 6 setsize correct rejection in feature mode',
               'The accuracy of 12 setsize correct rejection in feature mode',
               'The average reaction time of all 12 setsize correct rejection in feature mode',
               'The accuracy of 24 setsize correct rejection in feature mode',
               'The average reaction time of all 24 setsize correct rejection in feature mode',
               'The accuracy of 44 setsize correct rejection in feature mode',
               'The average reaction time of all 44 setsize correct rejection in feature mode',
               'The accuracy of 2 setsize hit in conjunction mode',
               'The average reaction time of all 2 setsize hit in conjunction mode',
               'The accuracy of 6 setsize hit in conjunction mode',
               'The average reaction time of all 6 setsize hit in conjunction mode',
               'The accuracy of 12 setsize hit in conjunction mode',
               'The average reaction time of all 12 setsize hit in conjunction mode',
               'The accuracy of 24 setsize hit in conjunction mode',
               'The average reaction time of all 24 setsize hit in conjunction mode',
               'The accuracy of 44 setsize hit in conjunction mode',
               'The average reaction time of all 44 setsize hit in conjunction mode',
               'The accuracy of 2 setsize correct rejection in conjunction mode',
               'The average reaction time of all 2 setsize correct rejection in conjunction mode',
               'The accuracy of 6 setsize correct rejection in conjunction mode',
               'The average reaction time of all 6 setsize correct rejection in conjunction mode',
               'The accuracy of 12 setsize correct rejection in conjunction mode',
               'The average reaction time of all 12 setsize correct rejection in conjunction mode',
               'The accuracy of 24 setsize correct rejection in conjunction mode',
               'The average reaction time of all 24 setsize correct rejection in conjunction mode',
               'The accuracy of 44 setsize correct rejection in conjunction mode',
               'The average reaction time of all 44 setsize correct rejection in conjunction mode',];
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

    function postEntry(targetDataResult, trialDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult){
        postEntryResult = {
            "date" : `${thisTime().toString()}`,
            "userId" : props.userId,
            "userPhone" : props.userPhone,
            "userSession" : props.userSession,
            "data" : {
                "rawData" : {
                    "target" : targetDataResult,
                    "trialData" : trialDataResult
                },
                "gameLogicScheme" : gameLogicSchemeResult,
                "scoringData" : scoringDataResult,
                "metricData" : metricDataResult
            }
        }
        return postEntryResult;
    }

    function touchStart(event) {
        event.target.classList.add('clicked');
    }

    function touchEnd(event) {
        event.target.classList.remove('clicked');
    }

    function refreshPage(){
        window.location.reload();
    } 

    function backToLandingPage(){
        navigate('/landing');
        refreshPage();
    }

    return (
     <div className='container-fluid'>
        <div className='row'>
            <div className='py-4 px-12 sm:py-8 w-full bg-blue-100 shadow-md'>
              {<BreadCrumb />}
            </div>
            <div id='CJSGameBody' className='col'>
              <div className="CJSGameBodyProgressBar">
                {<ProgressBar progressValue={progressValue} trialNumber={trialNumber}/>}
              </div>
              <div className="CJSGameWindow">
                {<CJSWindow searchTarget={searchTarget} searchTargetList={searchTargetList} canvasWidth={canvasWidth} canvasHeight={canvasHeight}/>}
              </div>
              <div className="CJSGameEnterButton">
                {<CJSButton searchTarget={searchTarget} disabledButton={disabledButton} checkResp={checkResp}/>}
              </div>
            </div>
        </div>
        {isItDone ? 
        <div>
            {<ScoreSummaryOverlay accuracy={((trialNumber - incorrectCount) / trialNumber) * 100} avgHitRt={avgHitRt} refreshPage={refreshPage} backToLandingPage={backToLandingPage}/>}
        </div>
        : null}
        {<RotateAlert />}
    </div>
    )
}


export default CJSGame;

function endTime() { 
    let d = new Date();
    return d.getTime();
}

function thisTime() {
    let thisTime = moment().format('YYYY-MM-DDTkk:mm:ss.SSSSSS');
    return thisTime;
}