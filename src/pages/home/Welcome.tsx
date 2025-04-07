import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaArrowRightLong } from "react-icons/fa6";
import { MdWavingHand } from 'react-icons/md';
import logo from '../../assets/logo.webp';  //logo


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

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/enable'); //welcome --> enabling page (waiver) --> homepage
  };
// -------------------------------------------------------------------------------------------
  //tts function for loading state
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  }
//   ---------------------------------------------------------------------------------------------
    // // speak
    // useEffect(() => {
    //     speak('Welcome to Buddy Walk! Buddy Walk is designed to help you better understand and navigate your surroundings. Simply take a picture or video, ask a question, and well do the rest! From finding directions to the nearest train station to identifying the color of your shirt, we’re here to assist you. Tap continue to start');
    // }, []);
//   ---------------------------------------------------------------------------------------------

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'black',
          color: 'white',
          textAlign: 'center',
          padding: 2,
          minHeight: '100vh',
        }}
        aria-label="welcome page container"
      >
        {/* logo*/}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center the logo
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <img
            src={logo}
            alt="Buddy Walk Logo"
            style={{
                maxWidth: '100px',
                height: 'auto',  
                display: 'block', 
                borderRadius: '20px', 
                marginBottom: '20px', // Space between the logo and text
            }}
          />
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 'bold',
            marginTop: 5,
            letterSpacing: '0.05em',
            textAlign: 'center',
            color: 'white',
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
          aria-label="Welcome to buddy walk"
        >
          Welcome <br></br>to <br></br> Buddy <br></br>Walk!  
          <MdWavingHand size={45} 
                        color="white" 
                        aria-label="waving hand"
                        style={{ marginLeft: '10px' }}
                        />    
          
        </Typography>
        <br></br>
        <Typography variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.5rem', //enlarged for readability
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: 3,
                  }}
                  aria-label="Description of Buddy Walk's functionality"
        >
          Buddy Walk is designed to help you better understand and navigate your surroundings.
          Simply take a picture or video, ask a question, and we'll do the rest! 
          From finding directions to the nearest train station to identifying the color of your shirt, we’re 
          here to assist you.
        </Typography>
        <br></br>
        <Typography variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '1.5rem', //enlarged for readability
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        color: 'white',
                        marginBottom: 1,
                    }}
                    aria-label="tap continue to start using buddy walk"

        >
          Tap continue to start
        </Typography>

        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{
            padding: "20px 40px",
            borderRadius: "45px 45px 0 0",
            cursor: "pointer",
            color: "black",
            fontSize: '2rem',
            fontWeight: '900',
            letterSpacing: '0.15em',
            width: '100%',
            display: "flex",
            flexDirection: "column",
            backgroundColor: 'white',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            '&:active': {
              backgroundColor: '#d0d0d0',
            },
          }}
          aria-label="Continue button"

        >
          Continue
          <FaArrowRightLong size={80} />
        </Button>
      </Container>
    </ThemeProvider>
  );
};

export default Welcome;
