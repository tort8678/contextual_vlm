import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';

const App: React.FC = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const navigate = useNavigate();

  // Enable location using the Geolocation API
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

  // Enable camera using the MediaDevices API
  const enableCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraEnabled(true);
    } catch (error) {
      alert('Camera access denied or unavailable.');
    }
  };

  // Navigate to the main project route
  const handleContinue = () => {
    if (locationEnabled && cameraEnabled) {
      navigate('/test');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Please enable location and camera access to continue :)
      </Typography>

      <Button
        variant="contained"
        color={locationEnabled ? 'success' : 'error'}
        onClick={enableLocation}
        sx={{ marginY: 1, width: '100%' }}
      >
        {locationEnabled ? 'Location Enabled' : 'Enable Location'}
      </Button>

      <Button
        variant="contained"
        color={cameraEnabled ? 'success' : 'error'}
        onClick={enableCamera}
        sx={{ marginY: 1, width: '100%' }}
      >
        {cameraEnabled ? 'Camera Enabled' : 'Enable Camera'}
      </Button>

      {locationEnabled && cameraEnabled && (
        <Button
          variant="contained"
          color="success"
          onClick={handleContinue}
          sx={{
            marginTop: 2,
            padding: 2,
            width: '100%',
            fontSize: '1rem',
          }}
        >
          Continue
        </Button>
      )}
    </Container>
  );
};

export default App;
