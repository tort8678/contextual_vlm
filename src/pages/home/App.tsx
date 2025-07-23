import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceOrientation } from '../../hooks/useDeviceOrientation';
import { Box, Button, Typography, Container, Link } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaArrowRightLong } from "react-icons/fa6";
// import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';



// for the wording font
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
    },
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const navigate = useNavigate();
  // const [language, setLanguage] = useState('en');



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
  const { orientation, requestAccess, revokeAccess } = useDeviceOrientation();
 
  const onToggle = (toggleState: boolean): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = toggleState ? requestAccess() : revokeAccess();
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


  // Enable microphone using the MediaDevices API
  const enableMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneEnabled(true);
    } catch (error) {
      alert('Microphone access denied or unavailable.');
    }
  };


  // Navigate to the main project route
  const handleContinue = () => {
    if (locationEnabled && cameraEnabled && microphoneEnabled) {
      navigate('/test');
    }
  };

  // const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  // setLanguage(event.target.value as string);
  // };


  return (
    <ThemeProvider theme={theme}>
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white',
        textAlign: 'center',
        padding: 2,
        minHeight: '100vh', //covers the full viewport height
      }}
    >
      <Typography
      variant="h3"
      sx={{
      fontWeight: 'bold',
      marginTop: 5,
      letterSpacing: '0.05em',
      textAlign: 'center',
      color: 'white',
      textTransform: 'uppercase',
      marginBottom: 3,
      }}
      aria-label="User Agreement"
      >
      User Agreement     
      </Typography>
{/* code below is for changing langauges,might do for entire app */}
{/* <FormControl fullWidth sx={{ marginBottom: 2 }}>
  <InputLabel id="language-select-label" sx={{ color: 'white' }}>Language</InputLabel>
  <Select
    labelId="language-select-label"
    value={language}
    onChange={handleLanguageChange}
    sx={{
      color: 'white',
      borderColor: 'white',
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
      },
      '& .MuiSvgIcon-root': {
        color: 'white',
      },
    }}
  >
    <MenuItem value="en">English</MenuItem>
    <MenuItem value="es">Español</MenuItem>
    <MenuItem value="zh">中文</MenuItem>
  </Select>
</FormControl> */}
{/* ----------------------------- */}
      <Box
      sx={{
        maxHeight: '250px', // Adjust height as needed
        overflowY: 'auto',
        paddingRight: 1,
        marginBottom: 2,
        border: '1px solid white',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          fontSize: '1.5rem',
          letterSpacing: '0.05em',
          textAlign: 'center',
          color: 'white',
        }}
      >
        This app is designed to assist blind and visually impaired users in navigation and localization.
        However, due to the limitations of AI, GPS accuracy, and real-world conditions, the app may not
        always provide correct or real-time information. Users should not rely solely on this app for
        navigation and should use additional assistive tools. By using this app, you acknowledge that
        you assume full responsibility for your safety and agree that the developers are not liable for
        any accidents, injuries, or damages that may occur while using the app. For the detailed Waiver
        and Disclaimer for AI-Powered Navigation App, please click the link below:<br></br>
        <Link
          aria-label="Link to Waiver"
          sx={{
            color: 'white',
            textDecorationColor: 'white',
            fontWeight: '1000',
            cursor: 'pointer',
          }}
          component="button"
          onClick={() => navigate('/waiver')}
        >
          Waiver
        </Link>
      </Typography>
    </Box>

  

      
      <br></br>
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
        If you agree to the waiver, please enable location, camera, and microphone access to continue
      </Typography>


      <Button
        variant="contained"
        onClick={enableLocation}
        aria-label="Enable location access"
        sx={{
          padding: "10px 20px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          color: "black",
          fontSize: '1.1rem',          
          fontWeight: '900', // Bolder text (options: 400 = normal, 700 = bold, 900 = extra bold)
          letterSpacing: '0.15em',
          textAlign: 'center',
          marginY: 1,
          width: '100%',
          backgroundColor: 'white',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
          '&:active': {
            backgroundColor: '#d0d0d0',
          },
        }}
      >
        {locationEnabled ? 'Location Enabled' : 'Enable Location'}
      </Button>

      <Button
        variant="contained"
        onClick={enableCamera}
        aria-label="Enable camera access"
        sx={{
          padding: "10px 20px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          color: "black",
          fontSize: '1.1rem',          
          fontWeight: '900', // Bolder text (options: 400 = normal, 700 = bold, 900 = extra bold)
          letterSpacing: '0.15em',
          textAlign: 'center',
          marginY: 1,
          width: '100%',
          backgroundColor: 'white',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
          '&:active': {
            backgroundColor: '#d0d0d0',
          },
        }}
      >
        {cameraEnabled ? 'Camera Enabled' : 'Enable Camera'}
      </Button>

      <Button
          variant="contained"
          onClick={enableMicrophone}
          aria-label="Enable microphone access"
          sx={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            color: "black",
            fontSize: '1.1rem',          
            fontWeight: '900', // Bolder text (options: 400 = normal, 700 = bold, 900 = extra bold)
            letterSpacing: '0.15em',
            textAlign: 'center',
            marginY: 1,
            width: '100%',
            backgroundColor: 'white',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            '&:active': {
              backgroundColor: '#d0d0d0',
            },
          }}
        >
          {microphoneEnabled ? 'Microphone Enabled' : 'Enable Microphone'}
        </Button>


        {/* <OrientationSwitcher
          onToggle={onToggle}
          labelOff="Show orientation angles"
          labelOn="Hide orientation angles" // Pass the onToggle function to the OrientationSwitcher component
          /> */}


      {locationEnabled && cameraEnabled && microphoneEnabled &&(
        <Button
          variant="contained"
          onClick={handleContinue}
          aria-label="Continue to the next step"
          sx={{
            padding: "20px 40px", // Increase the padding to double the size
            borderRadius: "45px 45px 0 0", // corner radius
            // borderRadius: "45px 45px 45px 45px", 
            cursor: "pointer",
            color: "black",
            fontSize: '2rem',  
            fontWeight: '900',
            letterSpacing: '0.15em',
            textAlign: 'center',
            marginY: 1,
            marginBottom: 0,
            width: '100%',
            display: "flex", // Flexbox to align text and icon
            flexDirection: "column", // Stack the text and icon vertically
            backgroundColor: 'white',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            '&:active': {
              backgroundColor: '#d0d0d0',
            },
          }}
        >
          Continue
          <FaArrowRightLong size={80}/>
        </Button>
        )}
     
    </Container>
    </ThemeProvider>
  );
};


export default App;