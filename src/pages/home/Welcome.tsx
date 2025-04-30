import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaArrowRightLong } from "react-icons/fa6";
import { MdWavingHand } from 'react-icons/md';
import logo from '../../assets/logo.webp'; //logo

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000' },
    text: { primary: '#ffffff' },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
});

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/waiver'); // welcome --> enabling page (waiver) --> homepage
  };

  // tts function (if needed)
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  }

  // Uncomment useEffect if you want TTS on load.
  // useEffect(() => {
  //   speak('Welcome to Buddy Walk!...');
  // }, []);

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
          p: { xs: 1, sm: 2 },
          overflow: 'hidden',
          height: '100dvh', // Fill the entire viewport height.
        }}
        aria-label="welcome page container"
      >
        {/* Header: Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: { xs: 1, sm: 3 },

            width: '100%',
          }}
        >
          <img
            src={logo}
            alt="Buddy Walk Logo"
            style={{
              maxWidth: '80px', // slightly smaller for mobile
              height: 'auto',
              borderRadius: '20px',
              marginBottom: '10px',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '2.8rem',
              lineHeight: 1.2,
              marginTop: '2vh'
            }}
            aria-label="Welcome to buddy walk"
          >
            Welcome to<br />Buddy Walk!{' '} <br />
            <MdWavingHand
              size={30}
              color="white"
              aria-label="waving hand emoji"
              style={{ verticalAlign: 'middle', marginLeft: '5px' }}
            />
          </Typography>
        </Box>

        {/* Main Content: Description and instruction */}
        <Box sx={{ flexGrow: 1, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
              letterSpacing: '0.02em',
              mb: 1,
              px: 1,
            }}
            aria-label="Description of Buddy Walk's functionality"
          >
            Buddy Walk helps you better understand and navigate your surroundings.
            Take a picture or video, ask a question, and we'll do the rest! Whether you need directions
            or just want to know details about your environment, we’re here to assist.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              letterSpacing: '0.02em',
              mt: 1,
              px: 1,
            }}
            aria-label="Instruction to start using Buddy Walk"
          >
            Tap continue to start
          </Typography>
        </Box>

        {/* Bottom Button */}
        <Box sx={{ width: '100%', mb: { xs: 1, sm: 2 } }}>
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{
              p: { xs: '10px 20px', sm: '20px 40px' },
              borderRadius: "45px 45px 0 0",
              cursor: "pointer",
              color: "black",
              fontWeight: '900',
              fontSize: '1.4rem',
              letterSpacing: '0.15em',
              width: '100%',
              display: "flex",
              flexDirection: "column",
              backgroundColor: 'white',
              boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
              '&:hover': { backgroundColor: '#e0e0e0' },
              '&:active': { backgroundColor: '#d0d0d0' },
            }}
            aria-label="Continue button"
          >
            Continue
            <FaArrowRightLong size={50} /> {/* Smaller icon on mobile */}
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Welcome;
