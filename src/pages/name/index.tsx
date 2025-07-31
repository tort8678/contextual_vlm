import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaArrowRightLong } from "react-icons/fa6";
import { AccessibleTextField } from '../main/style';
import { useRef, useState, useEffect } from 'react';
import { getToken } from '../../api/token';
import { createSpeechRecognitionPonyfill } from 'web-speech-cognitive-services';


const theme = createTheme({
    typography: {
        fontFamily: 'Poppins, Arial, sans-serif',
    },
});

const Name: React.FC = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false); // Track if voice button is active
    const [userInput, setUserInput] = useState(''); // Store user input from voice recognition
    const recognitionRef = useRef<SpeechRecognition | null | any>(null);

    useEffect(() => {
        (async function () {
            const azureToken = await getToken();
            if (azureToken && azureToken.token && azureToken.region) {
                const { SpeechRecognition } = createSpeechRecognitionPonyfill({
                    credentials: {
                        region: azureToken.region,
                        authorizationToken: azureToken.token,
                    }
                });
                const recognition = new SpeechRecognition();

                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
                recognition.onresult = (event) => {
                    const lastResultIndex = event.results.length - 1;
                    const transcript = event.results[lastResultIndex]![0]!.transcript;
                    setUserInput(transcript);
                };

                recognitionRef.current = recognition;
            }
        })()
    }, [])

    const handleContinue = () => {
        localStorage.setItem('name', userInput);
        navigate('/main'); // welcome --> enabling page (waiver) --> homepage
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }
        console.log(recognitionRef.current);
        recognitionRef.current?.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

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
                        width: '100%',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontSize: '2.6rem',
                            lineHeight: 1.2,
                            marginTop: '2vh'
                        }}
                        aria-label="Enter your name"
                    >
                        Enter a Name
                    </Typography>
                </Box>

                {/* Main Content: Description and instruction */}
                <Box sx={{ flexGrow: 1, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
                            letterSpacing: '0.02em',
                            mb: "5%",
                            px: 1,
                        }}
                        aria-label="Description of Buddy Walk's functionality"
                    >
                        Please enter your name if you would like credit for your contributions to the Buddy Walk app.
                        This step is optional, but it helps us recognize your efforts in making the app better for everyone.
                        By entering your name, you agree to share the data you submit on the app with the Buddy Walk team.
                        We use this data strictly for improving the app and enhancing user experience.
                        This data will stay confidential and will not be shared with any third parties.
                    </Typography>

                    <AccessibleTextField
                        sx={{ color: 'black', bgcolor: 'white', marginY: 2, maxWidth: '550px', borderRadius: '12px', width: '93%' }}
                        aria-label="Enter Name Text Field"
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <Button
                        onPointerDown={startListening}
                        // onPointerDown={()=> SpeechRecognition.startListening}
                        onPointerUp={stopListening}
                        // onPointerUp={() => {SpeechRecognition.stopListening(); console.log(transcript)}}
                        // onTouchStart={startListening}
                        // onTouchEnd={stopListening}
                        onPointerCancel={stopListening} // Ensure it stops if finger is moved
                        // onPointerCancel={() => SpeechRecognition.stopListening()}
                        style={{
                            padding: "12px 28px",          // shorter height and wider for tap comfort
                            borderRadius: "40px",          // rounder edges
                            cursor: "pointer",
                            color: "black",
                            fontSize: "1.2rem",
                            fontWeight: "800",
                            letterSpacing: "0.05em",
                            backgroundColor: "white",
                            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "fit-content",          // allows it to size based on content
                            border: "none",
                            minWidth: '100%', // minimum width for better touch target
                        }}
                    >
                        {isListening ? 'Listening...' : 'Hold to Speak'}
                    </Button>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            letterSpacing: '0.02em',
                            mt: 1,
                            px: 1,
                        }}
                        aria-label="Tap continue button below to proceed"
                    >
                        Tap continue to go to main page
                    </Typography>
                </Box>

                {/* Bottom Button */}
                <Box sx={{ width: '100%', mb: { xs: 0, sm: 0 } }}>
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

export default Name;
