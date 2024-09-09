import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, NavLink, Routes } from 'react-router-dom';
import LandingPage from './pages/landingPage/LandingPage';
import SSLanding from './pages/gameLanding/ssLanding/SSLanding';
import SSInstruction from './pages/gameInstruction/ssInstruction/SSInstruction';
import SSGame from './pages/game/ssGame/SSGame';
import CJSLanding from './pages/gameLanding/cjsLanding/CJSLanding';
import CJSInstruction from './pages/gameInstruction/cjsInstruction/CJSInstruction';
import CJSGame from './pages/game/cjsGame/CJSGame';
import GNGLanding from './pages/gameLanding/gngLanding/GNGLanding';
import GNGInstruction from './pages/gameInstruction/gngInstruction/GNGInstruction';
import GNGGame from './pages/game/gngGame/GNGGame';
import LoadingSpinner from './components/loadingSpinner/LoadingSpinner';
import ParticipantForm from './pages/participantForm/participantForm';
import { getDataFromLocalStorage } from './uitls/offline';

function App() {
  useEffect(() => {
    const disablePinchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    document.addEventListener("touchmove", disablePinchZoom, { passive: false })
    documentHeightWidth();
    window.addEventListener('resize', documentHeightWidth);
    window.addEventListener('orientationchange', documentHeightWidth);

    let id = getDataFromLocalStorage('userId');
    let phone = getDataFromLocalStorage('userPhone');
    if (id !== null && phone !== null){
      setUserId(id);
      setUserPhone(phone);
      // window.location.replace(window.location.origin + "#/landing");
    } else {
      if (window.location.href === "https://cccnlab.co/vss-visual-search/"){
      } else {
        window.location.replace("https://cccnlab.co/vss-visual-search/");
      }
    }
  }, [])
  
  function documentHeightWidth() {
    let calWidth = '' + document.documentElement.clientWidth;
    let calHeight = '' + document.documentElement.clientHeight;
    let calSum = (+calWidth) + (+calHeight);
    let vh = window.innerHeight * 0.01;
    
    getComputedStyle(document.documentElement).getPropertyValue('--this-width');
    getComputedStyle(document.documentElement).getPropertyValue('--this-height');
    getComputedStyle(document.documentElement).getPropertyValue('--this-sum');
    document.documentElement.style.setProperty('--this-width', calWidth + 'px');
    document.documentElement.style.setProperty('--this-height', calHeight + 'px');
    document.documentElement.style.setProperty('--this-sum', calSum + 'px');
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  const [userId, setUserId] = useState("XXXX");
  const [userPhone, setUserPhone] = useState("XXXX");
  return (
    <>
      <Router>
          <Routes>
            <Route path="/" element={< ParticipantForm setUserId={setUserId} setUserPhone={setUserPhone}/>}></Route>
            <Route path="/landing" element={< LandingPage />}></Route>
            <Route path="/spatial-span" element={<SSLanding />}></Route>
            <Route path="/spatial-span/instruction" element={<SSInstruction userId={userId}/>}></Route>
            <Route path="/spatial-span/trial" element={<SSGame userId={userId} userPhone={userPhone}/>}></Route>
            <Route path="/conjunction-search" element={<CJSLanding />}></Route>
            <Route path="/conjunction-search/instruction" element={<CJSInstruction />}></Route>
            <Route path="/conjunction-search/trial" element={<CJSGame userId={userId} userPhone={userPhone}/>}></Route>
            <Route path="/go-nogo" element={<GNGLanding />}></Route>
            <Route path="/go-nogo/instruction" element={<GNGInstruction />}></Route>
            <Route path="/go-nogo/trial" element={<GNGGame userId={userId} userPhone={userPhone}/>}></Route>
          </Routes>
          <LoadingSpinner />
      </Router>
    </>
  );
}

export default App;
