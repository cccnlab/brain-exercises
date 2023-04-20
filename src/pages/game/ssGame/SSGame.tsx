import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SSGame.css';
import AppHeader from '../../../components/appHeader/AppHeader';
import SSWindow from '../../../components/gameWindow/ssWindow/SSWindow';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import ScoreSummaryOverlay from '../../../components/scoreSummaryOverlay/ScoreSummaryOverlay';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3'
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import $ from 'jquery';
import moment from 'moment';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';

let progressBarElement: HTMLProgressElement;

//Test parameters
const flashDuration: number = 250;
const flashInterval: number = 750;
const trialNumber: number = 2; // to edit
const initialSpan: number = 2;
const probeNumber: number = 6;
const allProbe: number[] = [1,2,3,4,5,6];
const probeAngularPosition: number[] = [45, 90, 135, 225, 270, 315];
const probeShape: string = 'circle';
const probeParams: string = 'radius'; 
const radius: string = (getComputedStyle(document.documentElement).getPropertyValue('--cir-base-unit') + " / 2 " );
const cueColor: string = getComputedStyle(document.documentElement).getPropertyValue('--cue-color');
const cueBorderColor: string = getComputedStyle(document.documentElement).getPropertyValue('--cue-border-color');
const restColor: string = getComputedStyle(document.documentElement).getPropertyValue('--rest-color');
const restBorderColor: string = getComputedStyle(document.documentElement).getPropertyValue('-rest-border-color');
const rampingCorrectCount: number = 3;
const maxFailStreakCount: number = 2;
const maxFailCount: number = 3; 

// Initaial values
let currSpan = initialSpan;
let currTrial: number = 0;
let allSpan: number[] = [];
let spanInCorrectAns: any[] = [];
let allSeq: string[] = [];
let genSeq: number[] = [];
let currSeq: number[] = [];
let allAns: string[] = [];
let currAns: number[] = [];
let correctCount: number = 0;
let failCount: number = 0;
let failStreakCount: number = 0;
let checkAns: number[]  = [];
let enterStruggleTimeCount: number = 0;
let struggleTime: boolean = false;
let isTest: boolean = false;
let allReactionTime: string[]  = [];
let reactionTime: number[] = [];
let allReactionTrial: number[] = [];
let answerTimePerTrial: any[] = [];
let latestIndex: number = 0;
let scorePerTrial: number[] = [];
let spanMultiplier: number = 1000;
let summaryCorrect: number = 0;
let sumScores: number  = 0;
let score: number;
let trialStruct: any[] = [];
let cueStartTime: any[] = [];
let cueEndTime: any[] = [];
let startTime : number = 0;
let timeoutList: any[] = []; 
let cueDataResult: any[] = [];
let probeDataResult: any[] = [];
let answerDataResult: any[] = [];
let trialDataResult: any[] = [];
let gameLogicSchemeResult: { game: string; schemeName: string; version: number; variant: string; parameters: { trialNumber: { value: any; unit: null; description: string }; flashDuration: { value: any; unit: string; description: string }; flashInterval: { value: any; unit: string; description: string }; initialSpan: { value: any; unit: null; description: string }; probeNumber: { value: any; unit: null; description: string }; probeAngularPosition: { value: any; unit: string; description: string }; rampingCorrectCount: { value: any; unit: null; description: string }; maxFailStreakCount: { value: any; unit: null; description: string }; maxFailCount: { value: any; unit: null; description: string } }; description: string };
let scoringDataResult: any[] = [];
let metricDataResult: any[] = [];
let postEntryResult;

function SSGame() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLButtonElement>(null);
  const [clickSound] = useSound(clickSoundSrc);
  const [combo2Sound] = useSound(combo2SoundSrc);
  const [losingSound] = useSound(losingSoundSrc);
  const [progressValue, setProgressValue] = useState(0);
  const [isItDone, setIsItDone] = useState(false);

  useEffect(() => {
      initiateData();
      gameLogicScheme(trialNumber, flashDuration, flashInterval, initialSpan, probeNumber, probeAngularPosition, rampingCorrectCount, maxFailStreakCount, maxFailCount);
      progressBarElement = document.getElementById("progressBar") as HTMLProgressElement;
      seqGenerator();
      
      return () => {
        refreshPage();
        timeoutList.forEach(tm => {
            clearTimeout(tm);
        })
      };
  }, [])

  useEffect(() => {
      if (inputRef.current != null) {
          inputRef.current.focus();
      }
  }, []);

  const checkSeq = (event: { currentTarget: { classList: { contains: (arg0: string) => any } } }) => {
      if (isTest === true) {
          let end : number = endTime();
          reactionTime.push(end - startTime);
          answerTimePerTrial.push(thisTime());
          clickSound();
      }

      if (event.currentTarget.classList.contains('1')) {
          currAns.push(1);
          ($('#cirButton1').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton1').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('2')) {
          currAns.push(2);
          ($('#cirButton2').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton2').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('3')) {
          currAns.push(3);
          ($('#cirButton3').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton3').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('4')) { 
          currAns.push(4);
          ($('#cirButton4').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton4').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('5')) {
          currAns.push(5);
          ($('#cirButton5').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton5').removeClass('clicked') 
              }, 150)
          )
      } else {
          currAns.push(6);
          ($('#cirButton6').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton6').removeClass('clicked') 
              }, 150)
          )
      }

      if (currAns.length === currSpan) {
          cueData(currSeq, cueColor, cueBorderColor, cueStartTime, cueEndTime);
          probeData(probeNumber, allProbe, restColor, restBorderColor, probeShape, probeParams, radius, probeAngularPosition);
          answerData(currAns, answerTimePerTrial);
          trialData(currSpan, cueDataResult, probeDataResult, answerDataResult);
          timeoutList.push(
              setTimeout(function() {
                  $('.cirButton').removeClass('clicked');
                  $('.cirButton').addClass('hoverDisabled'); 
              }, 150)
          )

          $('#goSignal').html("");
          $('.cirButton').removeClass('readyToClick');
          allAns.push(currAns.toString());
          
          const equalCheck = (currAns: any[], currSeq: string | any[]) => 
              currAns.length === currSeq.length && currAns.every((value, index) => value === currSeq[index]);
              
          if (equalCheck(currAns, currSeq)) {
              $('#goSignal').html("ถูก");
              setProgressValue(progressValue + 1);
              combo2Sound();
              currSeq = [];
              genSeq = [];
              currTrial++;
              checkAns.push(1);
              failCount = 0;
              correctCount++;
              if (correctCount === rampingCorrectCount) {
                  currSpan++;
                  correctCount = 0;
              }

              if (struggleTime === true) {
                  struggleTime = false;
                  enterStruggleTimeCount++;
                  correctCount = 0;
                  failStreakCount++;
                  if (failStreakCount === maxFailStreakCount) {
                      currSpan--;
                          if (currSpan < initialSpan) {
                              currSpan = initialSpan;
                          }
                      failStreakCount = 0;
                  }
              } else {
                  failStreakCount = 0;
              }
              
              timeoutList.push(
                  setTimeout(function() {
                      seqGenerator();
                  }, (flashDuration + flashInterval))
              )
          } else {
              $('#goSignal').html("ผิด");
              losingSound();
              struggleTime = true;
              currSeq = [];
              checkAns.push(0);
              correctCount = 0;
              failCount++;
              if (failCount === maxFailCount) {
                  setProgressValue(progressValue + 1);
                  currTrial++;
                  genSeq = [];
                  failCount = 0;
                  struggleTime = false;
                  enterStruggleTimeCount++;
                  failStreakCount++;
                  if (failStreakCount === maxFailStreakCount) {
                      currSpan--;
                          if (currSpan < initialSpan) {
                              currSpan = initialSpan;
                          }
                      failStreakCount = 0;
                  }
              }
              
              timeoutList.push(
                  setTimeout(function() {
                      seqGenerator();
                  }, (flashDuration + flashInterval))
              )
          }
          
          allReactionTime.push(reactionTime.toString());
          let lastReaction = reactionTime[reactionTime.length-1];
          allReactionTrial.push(lastReaction);
          reactionTime = [];
      }

      if (currTrial === trialNumber){
          summaryScore();
          runIsOver();
      }
  };

  function initiateData() {
      allSpan = []; 
      allSeq = [];
      genSeq = [];
      currSeq = [];
      allAns = [];
      currAns = [];
      correctCount = 0;
      failCount = 0;
      checkAns = [];
      struggleTime = false;
      isTest = false; 
      allReactionTime = [];
      reactionTime = [];
      allReactionTrial = [];
      latestIndex = 0;
      scorePerTrial = [];
      summaryCorrect = 0;
      sumScores = 0;
  }

    function gameLogicScheme(trialNumber: number, flashDuration: number, flashInterval: number, initialSpan: number, probeNumber: number, probeAngularPosition: number[], rampingCorrectCount: number, maxFailStreakCount: number, maxFailCount: number) {
      gameLogicSchemeResult = {
          "game": "spatial-span",
          "schemeName" : "default",
          "version" : 1.0,
          "variant": "main",
          "parameters" : {
              "trialNumber": {
                  "value": trialNumber,
                  "unit": null,
                  "description": "Total number of trial in the test"
              },
              "flashDuration": {
                  "value": flashDuration,
                  "unit": "ms",
                  "description": "Duration of color flash signal"
              },
              "flashInterval" : {
                  "value": flashInterval,
                  "unit": "ms",
                  "description" : "Duration between the end-to-beginning of signal flash"
              },
              "initialSpan": {
                  "value": initialSpan,
                  "unit": null,
                  "description": "Initial span size at the first trial"
              },
              "probeNumber" : {
                  "value" : probeNumber,
                  "unit" : null,
                  "description" : "Number of probe (constant) in test"
              },
              "probeAngularPosition" : {
                  "value" : probeAngularPosition,
                  "unit" : "degree",
                  "description" : "Probe angular position"
              },
              "rampingCorrectCount" : {
                  "value" : rampingCorrectCount,
                  "unit" : null,
                  "description" : "Correct count before increase of sequence size"
              },
              "maxFailStreakCount" : {
                  "value" : maxFailStreakCount,
                  "unit" : null,
                  "description" : "Fail count before decrease of sequence size"
              },
              "maxFailCount" : {
                  "value" : maxFailCount,
                  "unit" : null,
                  "description" : "Maximum fail count in struggle loop"
              }
          },
          "description": "Spatial span default scheme"
      }
      return gameLogicSchemeResult;
  }

  function seqGenerator() {
      if (currTrial !== trialNumber) {
          allSpan.push(currSpan);
          if (genSeq.length === 0) {
              for (let i = 0; i < currSpan; i++) {
                  let thisSeq = Math.floor(Math.random() * probeNumber) + 1;
                  genSeq.push(thisSeq);
              }
          }
          timeIntervalPerTrial();
      } 
  }

  function timeIntervalPerTrial() {
      $('.cirButton').addClass('hoverDisabled');

      timeoutList.push(
          setTimeout(function() {
              $('#goSignal').html("");
              $('#goSignal').html("3");
          }, 100) 
      )

      timeoutList.push(
          setTimeout(function() {
              $('#goSignal').html("");
              $('#goSignal').html("2");
          }, 1100) 
      )

      timeoutList.push(
          setTimeout(function() {
              $('#goSignal').html("");
              $('#goSignal').html("1");
          }, 2100) 
      )

      timeoutList.push(
          setTimeout(function() {
              $('#goSignal').html("");
          }, 3100) 
      )

      timeoutList.push(
          setTimeout(function() {
              popCircleButton();
          }, 4100) 
      )
  }
  
  function popCircleButton(popTime = flashDuration, intervalTime = flashInterval, locationPop = allSeq) {
      isTest = false;
      currAns = [];
      cueStartTime = [];
      cueEndTime = [];
      
      timeoutList.push(
          setTimeout(function () {
              $('#goSignal').html("ตาคุณ");
              startTime = timeStart();
              $('.cirButton').removeClass('hoverDisabled');
              $('.cirButton').addClass('readyToClick');
              isTest = true;
          }, currSpan * ((popTime/5) + (intervalTime))) 
      )
  
      for (let i = 0; i < currSpan; i++) {
          if (genSeq[i] === 1) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton1').addClass('pop');
                      currSeq.push(1);
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton1').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (genSeq[i] === 2) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2').addClass('pop');
                      currSeq.push(2);
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (genSeq[i] === 3) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton3').addClass('pop');
                      currSeq.push(3);
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton3').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (genSeq[i] === 4) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton4').addClass('pop');
                      currSeq.push(4);
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton4').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (genSeq[i] === 5) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5').addClass('pop');
                      currSeq.push(5); 
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (genSeq[i] === 6) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton6').addClass('pop');
                      currSeq.push(6);
                      cueStartTime.push(thisTime());
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton6').removeClass('pop');
                      cueEndTime.push(thisTime());
                  }, popTime + (i * intervalTime))
              )
          } 
      }
      allSeq.push(genSeq.toString());
  }

  function runIsOver() {
      timeoutList.push(
          setTimeout(function () {
              let currTrialStruct = {
                  allSeq: allSeq,
                  allAns: allAns,
                  allSpan: allSpan,
                  checkAns: checkAns,
                  allReactionTime: allReactionTime,
                  allReactionTrial: allReactionTrial,
              }
              trialStruct.push(currTrialStruct);
              Done();
          }, )
      )
  }

  function Done() {
      setIsItDone(true);
      let end = endTime();
      score = sumScores;
      scoringData(trialNumber, spanMultiplier, score);
      metricData(trialNumber, summaryCorrect, spanInCorrectAns, enterStruggleTimeCount);
      postEntry(trialDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult);
  }

  function cueData(currSeq: string | any[], cueColor: string, cueBorderColor: string, cueStartTime: any[], cueEndTime: any[]){
      let obj_in_trial: any[] = [];

      for (let i = 0; i < currSeq.length; i++) {
          let obj_to_append;
          obj_to_append = {
              "probeID" : currSeq[i],
              "color" : cueColor,
              "borderColor" : cueBorderColor,
              "cueStart" : cueStartTime[i],
              "cueEnd" : cueEndTime[i],
              "cueDescription" : 'color flash signal that randomly appear'
          }
          obj_in_trial.push(obj_to_append);
      }
      cueDataResult.push(obj_in_trial);
      return cueDataResult;
  }

  function probeData(probeNumber: number, allProbe: any[], restColor: string, restBorderColor: string, probeShape: string, probeParams: string, radius: string, probeAngularPosition: any[]){
      let obj_in_trial: any[] = [];

      for (let i = 0; i < probeNumber; i++) {
          let obj_to_append;
          obj_to_append = {
              "probeID" : allProbe[i],
              "restColor" : restColor,
              "borderColor" : restBorderColor,
              "shape" : probeShape,
              "shapeParams" : [{
                  "parameterName" : probeParams,
                  "value" : radius,
                  "unit" : 'px'
              }],
              "angularPosition" : probeAngularPosition[i]
          }
          obj_in_trial.push(obj_to_append);
      }
      probeDataResult.push(obj_in_trial);
      return probeDataResult;
  }

  function answerData(currAns: string | any[], answerTimePerTrial: any[]){
      let obj_in_trial: any[] = [];

      for (let i = 0; i < currAns.length; i++) {
          let obj_to_append;
          obj_to_append = {
              "answer" : currAns[i],
              "timestamp" : answerTimePerTrial[i]
          }
          obj_in_trial.push(obj_to_append);
      }
      answerDataResult.push(obj_in_trial);
      return answerDataResult;
  }

  function trialData(currSpan: number, cueDataResult: any[], probeDataResult: any[], answerDataResult: any[]){
      
      for (let i = 0; i < 1; i++) {
          let obj_to_append;
          obj_to_append = {
              "spanSize" : currSpan,
              "cueData" : cueDataResult[i],
              "probeData" : probeDataResult[i],
              "answerData" : answerDataResult[i],
              "mode" : 'forward'
          }
          trialDataResult.push(obj_to_append);
      }
      return trialDataResult;
  }

  function scoringData(trialNumber: number, spanMultiplier: number, score: number){
      scoringDataResult = [{
          "scoringModel" : {
              "scoringName" : "default",
              "parameters" : {
                  "trialNumber" : {
                      "value" : trialNumber,
                      "unit" : null,
                      "description" : "Total number of trial in the test"
                  },
                  "spanMultiplier" : {
                      "value" : spanMultiplier,
                      "unit" : null,
                      "description" : "Multiplier for size of span"
                  }

              },
              "description" : `score = sum of the scorePerTrial (allSpan[i] * spanMultiplier)`
          },
          "score" : score
      }]
      return scoringDataResult;
  }

  function metricData(trialNumber: number, summaryCorrect: number, spanInCorrectAns: any[], enterStruggleTimeCount: number){
      spanInCorrectAns.sort((a,b) => a-b);
      let metricName 
          = ['correctCount', 
              'incorrectCount', 
              'struggleTimeCount', 
              'highestSpan'];
      let metricValue 
          = [summaryCorrect, 
              trialNumber - summaryCorrect, 
              enterStruggleTimeCount, 
              spanInCorrectAns[spanInCorrectAns.length - 1]];
      let metricUnit = [null, null, null, null, null];
      let metricDescription 
          = ['Total number of correct trials', 
              'Total number of incorrect trials', 
              'Total number of entered struggle loop', 
              'The highest span that user reached'];
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

  function postEntry(trialDataResult: any[], gameLogicSchemeResult: { game: string; schemeName: string; version: number; variant: string; parameters: { trialNumber: { value: any; unit: null; description: string }; flashDuration: { value: any; unit: string; description: string }; flashInterval: { value: any; unit: string; description: string }; initialSpan: { value: any; unit: null; description: string }; probeNumber: { value: any; unit: null; description: string }; probeAngularPosition: { value: any; unit: string; description: string }; rampingCorrectCount: { value: any; unit: null; description: string }; maxFailStreakCount: { value: any; unit: null; description: string }; maxFailCount: { value: any; unit: null; description: string } }; description: string }, scoringDataResult: any[], metricDataResult: any[]){
      postEntryResult = {
          "profileID" : '8b332a3a-434c-4c90-b800-00002e031cd0',
          "entryInformation" : {
              "rawData" : {
                  "trialData" : trialDataResult,
                  "description" : 'all important data per trial'
              },
              "gameLogicScheme" : gameLogicSchemeResult,
              "scoringData" : scoringDataResult,
              "metricData" : metricDataResult
          }
      }
      console.log(postEntryResult);
      console.log(JSON.stringify(postEntryResult));
      return postEntryResult;
  }

  function summaryScore() {
      for (let correctIndex = latestIndex; correctIndex < checkAns.length; correctIndex++) {
          latestIndex = correctIndex;
  
          if (checkAns[correctIndex] === 1) {
              scorePerTrial.push(allSpan[correctIndex] * spanMultiplier);
              summaryCorrect++;
              spanInCorrectAns.push(allSpan[correctIndex]);
          } else if (checkAns[correctIndex] === 0 && checkAns[correctIndex + 1] === 1) {
              summaryCorrect--;
          }
      }
      
      sumScores = scorePerTrial.reduce((sum, score) => {
        return sum + score;
      });
  
      return sumScores;
  }
  
  function timeStart() : number{
      let startTime = new Date();
      return startTime.getTime();
  }

  function refreshPage(){
      window.location.reload();
  } 

  function backToLandingPage() {
    navigate('/');
  }

  return (
    <div className='container-fluid'>
        <div className='row'>
            <div id='SSGameHeader' className='col'>
              {<AppHeader />}
            </div>
            <div id='SSGameBody' className='col'>
            <div className="SSGameBodyProgressBar">
              {<ProgressBar progressValue={progressValue} trialNumber={trialNumber}/>}
            </div>
              <div className="SSGameWindow">
                {<SSWindow checkSeq={checkSeq}/>}
              </div>
              <div className="SSGameEnterButton"></div>
            </div>
        </div>
        {isItDone ? 
        <div>
            {<ScoreSummaryOverlay sumScores={sumScores} refreshPage={refreshPage} backToLandingPage={backToLandingPage}/>}
        </div>
        : null}
        {<RotateAlert />}
    </div>
  )
}

export default SSGame;

function endTime() { 
  let d = new Date();
  return d.getTime();
}

function thisTime() {
  let thisTime = moment().format('YYYY-MM-DDTkk:mm:ss.SSSSSS');
  return thisTime;
}


