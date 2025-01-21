import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// for the wording font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
});


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
    <ThemeProvider theme={theme}>
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #001f4d, #87CEEB)', // Match home page gradient
        // background: 'linear-gradient(135deg, #2f4f4f, #708090)', // Black to dark gray gradient
        color: 'white',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Typography variant="h5" 
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.5rem', //enlarged for readability
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    color: 'white',
                  }}
      >
        Please enable location and camera access to continue
      </Typography>

      <Button
        variant="contained"
        // color={locationEnabled ? 'success' : 'error'}
        onClick={enableLocation}
        sx={{ // css to change button color gradient
            fontWeight: 'bold',
            fontSize: '1.0rem', //enlarged for readability
            letterSpacing: '0.05em',
            textAlign: 'center',
            // color: 'white',
              marginY: 1,
              width: '100%',
            background: locationEnabled
              ? 'linear-gradient(to bottom, #56ab2f, #66bb6a)'
              : 'linear-gradient(to bottom, #e53935, #d32f2f)', 
            color: 'white',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              background: locationEnabled
                ? 'linear-gradient(to bottom, #66bb6a, #56ab2f)'
                : 'linear-gradient(to bottom, #d32f2f, #e53935)',
            },
          }}
      >
        {locationEnabled ? 'Location Enabled' : 'Enable Location'}
      </Button>

      <Button
        variant="contained"
        // color={cameraEnabled ? 'success' : 'error'}
        onClick={enableCamera}
        sx={{
          fontWeight: 'bold',
          fontSize: '1.0rem', //enlarged for readability
          letterSpacing: '0.05em',
          textAlign: 'center',
          marginY: 1,
          width: '100%',
          background: cameraEnabled
            ? 'linear-gradient(to bottom, #56ab2f, #66bb6a)'
            : 'linear-gradient(to bottom, #e53935, #d32f2f)', // Green or red gradient
          color: 'white',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            background: cameraEnabled
              ? 'linear-gradient(to bottom, #66bb6a, #56ab2f)'
              : 'linear-gradient(to bottom, #d32f2f, #e53935)',
          },
        }}
      >
        {cameraEnabled ? 'Camera Enabled' : 'Enable Camera'}
      </Button>

      {locationEnabled && cameraEnabled && (
        <Button
          variant="contained"
          // color="success"
          onClick={handleContinue}
          sx={{
            fontWeight: 'bold',
            fontSize: '1.0rem', //enlarged for readability
            letterSpacing: '0.05em',
            textAlign: 'center',
            marginTop: 2,
            padding: 2,
            width: '100%',
            background: 'linear-gradient(to bottom, #56ab2f, #66bb6a)', // Green gradient
            color: 'white',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              background: 'linear-gradient(to bottom, #66bb6a, #56ab2f)',
            },
           }}
        >
          Continue
        </Button>
      )}
    </Container>
    </ThemeProvider>
  );
};

export default App;
