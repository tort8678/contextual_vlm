import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaArrowRightLong } from "react-icons/fa6";
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

  const handleAgree = () => {
    navigate('/test'); // Navigate to enable page
  };

  const handleDisagree = () => {
    // You can modify this as needed (e.g., navigate to a different route, display a message, etc.)
    console.log('User disagreed with the terms.');
    // navigate('/some-other-route'); // Optional: navigate to another page
  };

  // tts function for loading state (if needed)
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
  //     speak('Welcome to Buddy Walk! ...');
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100svh', // Fill the entire viewport height.
          background: 'black',
          color: 'white',
          textAlign: 'center',
          padding: 2,
        }}
        aria-label="welcome page container"
      >
        {/* Top section: Logo and title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
            aria-label="Welcome to buddy walk"
          >
            Waiver
          </Typography>
        </Box>

        {/* Scrollable waiver text section */}
        <Box
          sx={{
            flex: 1, // Take up all remaining vertical space.
            overflowY: 'auto',
            paddingRight: 1,
            marginBottom: 2,
            border: '1px solid white',
            borderRadius: 2,
            textAlign: 'left',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              marginLeft: '1rem',
              mt:'1rem'
            }}
          >
            This app is designed to assist blind and visually impaired users in navigation and localization.
            However, due to the limitations of AI, GPS accuracy, and real-world conditions, the app may not
            always provide correct or real-time information. Users should not rely solely on this app for
            navigation and should use additional assistive tools. By using this app, you acknowledge that
            you assume full responsibility for your safety and agree that the developers are not liable for
            any accidents, injuries, or damages that may occur while using the app. For the detailed Waiver
            and Disclaimer for AI-Powered Navigation App, continue reading. If you agree, please tap the agree button at the bottom
            of the screen. <br /><br />
            Full waiver and disclaimer: <br />
            Effective Date: March 5, 2025 <br /><br />

            1. Acknowledgment of Limitations <br />
            This app is designed to assist blind and visually impaired users in navigation and localization.
            However, due to the limitations of AI technology, GPS accuracy, and external factors such as
            environmental conditions, the app may not always provide correct, real-time, or reliable information.
            Users acknowledge that the app is intended as an assistive tool only and should not be solely relied upon for
            navigation or mobility decisions.
            <br /><br />
            2. Assumption of Risk<br />
            By using this app, users acknowledge and accept that:
            The app may provide incomplete, delayed, or incorrect guidance.
            Real-world conditions, such as signal interference, moving obstacles, and construction changes, may impact the app’s effectiveness.
            Users should always exercise caution and use additional mobility aids, such as a cane, guide dog, or human assistance, while navigating.
            <br /><br />
            3. Beta Testing and Development Risks<br />
            If the app is in a beta testing phase, users acknowledge that the software is still under development and may contain bugs, errors, or incomplete features.
            The developers reserve the right to update, modify, or discontinue features without prior notice.
            <br /><br />
            4. No Liability Clause<br />
            To the fullest extent permitted by law, the developers, company, affiliates, and partners of this app disclaim any liability for:
            Personal injuries, accidents, or harm resulting from reliance on the app.
            Any damage or loss of property incurred while using the app.
            Any third-party services, maps, or data sources integrated into the app.
            Interruptions, software errors, or system failures that impact performance.
            <br /><br />
            5. User Responsibility<br />
            Users agree to:<br />
            Use the app at their own risk.<br />
            Not hold the developers responsible for any mishaps, injuries, or legal claims arising from its use.<br />
            Regularly check for updates and instructions to improve app performance and safety.
            <br /><br />
            6. Indemnification<br />
            Users agree to indemnify and hold harmless the developers, company, employees, and affiliates from any claims, losses, liabilities, damages, costs, or legal fees arising from the use or misuse of the app.
            <br /><br />
            7. Consent and Agreement<br />
            By proceeding with the installation and use of this app, the user confirms that they:
            <br />
            Have read and understood this waiver and disclaimer.<br />
            Acknowledge the risks and limitations of the app.<br />
            Accept full responsibility for their own safety and navigation decisions.<br />
            Agree to all terms outlined in this document.
            <br /><br />
            If you do not agree with the terms of this waiver, do not use this app.
            <br /><br />
            For inquiries or support, contact: <br />
            Hao Tang, htang@gc.cuny.edu, CUNY
            <br /><br />
            Version: 0.1
          </Typography>
        </Box>

        {/* Bottom buttons container */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            gap: 2, // Adds space between buttons
            paddingBottom: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleDisagree}
            sx={{
              padding: "20px 40px",
              borderRadius: "45px",
              cursor: "pointer",
              color: "black",
              fontSize: '1.4rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              flex: 1,
              backgroundColor: 'white',
              boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:active': {
                backgroundColor: '#d0d0d0',
              },
            }}
            aria-label="Disagree button"
          >
            Disagree
          </Button>
          <Button
            variant="contained"
            onClick={handleAgree}
            sx={{
              padding: "20px 40px",
              borderRadius: "45px",
              cursor: "pointer",
              color: "black",
              fontSize: '1.4rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              flex: 1,
              backgroundColor: 'white',
              boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:active': {
                backgroundColor: '#d0d0d0',
              },
            }}
            aria-label="Agree button"
          >
            Agree
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Welcome;
