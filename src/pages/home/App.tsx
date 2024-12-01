import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import {FirebaseStart} from "../../api/firebase.ts";
// import './App.css'
// import axios from 'axios'



const App: React.FC = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const navigate = useNavigate();

  // async function handleTest(){
  //   const res = await axios.get("api/test")
  //   console.log(res)
  // }

  //Enabling location: Using geolocation API
  const enableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => alert('Location access denied.')
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  //Enabling camera: Using MediaDevices API
  const enableCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraEnabled(true);
    } catch (error) {
      alert('Camera access denied or unavailable.');
    }
  };

  //Navigate to the main project file (test/index.tsx)
  const handleContinue = () => {
    if (locationEnabled && cameraEnabled) {
      navigate('/test');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f8f8',
        textAlign: 'center',
        padding: '16px',
      }}
    >
      <h3>Please enable location and camera access to continue :)</h3>

      <button
        onClick={enableLocation}
        style={{
          backgroundColor: locationEnabled ? 'green' : 'red',
          color: '#fff',
          padding: '12px 24px',
          margin: '8px 0',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {locationEnabled ? 'Location Enabled' : 'Enable Location'}
      </button>

      <button
        onClick={enableCamera}
        style={{
          backgroundColor: cameraEnabled ? 'green' : 'red',
          color: '#fff',
          padding: '12px 24px',
          margin: '8px 0',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {cameraEnabled ? 'Camera Enabled' : 'Enable Camera'}
      </button>

      {locationEnabled && cameraEnabled && (
        <button
          onClick={handleContinue}
          style={{
            backgroundColor: 'green',
            color: '#fff',
            padding: '16px',
            marginTop: '16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            width: '100%',
            height: '85px',
          }}
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default App;
