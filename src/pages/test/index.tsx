import {Camera, CameraType} from 'react-camera-pro';
import {useRef, useState, useEffect} from 'react';
import {Box, Stack, Switch, FormControlLabel, useMediaQuery, InputAdornment, IconButton, CircularProgress} from '@mui/material';
import {useGeolocated} from 'react-geolocated';
import {sendAudioRequest, sendTextRequest} from "../../api/openAi.ts";
// import {FirebaseStart} from "../../api/firebase.ts";
import {RequestData} from "./types.ts";
import {AccessibleButton, AccessibleTypography, AccessibleTextField, BlueSection, GraySection, GreenSection} from "./style.ts";
import {createChatLog, addChatToChatLog} from "../../api/chatLog.ts";
import ReportMessage from '../../components/ReportMessage.tsx';
import ClearIcon from '@mui/icons-material/Clear';
import { useDeviceOrientation } from '../../hooks/useDeviceOrientation.ts';



export default function Test() {
  const camera = useRef<CameraType>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [openAIResponse, setOpenAIResponse] = useState<string>('');
  const [loading, setLoading] = useState(false); //for the loading bar
  const responseRef = useRef<HTMLDivElement>(null); //to make the page scroll down when submit is clicked
  const [userInput, setUserInput] = useState<string>('Describe the image'); //-----------------------------
  const [audioUrl, setAudioUrl] = useState("");
  const [currentChatId, setCurrentChatId] = useState("")
  const [currentMessageId, setCurrentMessageId] = useState("")
  const {coords, isGeolocationEnabled} = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    watchLocationPermissionChange: true
  });
  const [currentOrientation, setCurrentOrientation] = useState<{
    alpha: number | null,
    beta: number | null,
    gamma: number | null
  }>({alpha: null, beta: null, gamma: null});
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false); // Track if voice button is active
  const {orientation, requestAccess} = useDeviceOrientation();


  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log(pos.coords)
    }, (error) => {
      console.log(error.message);
      setOpenAIResponse(error.message)
    });
    requestAccess().then((granted) => { 
      console.log(orientation)
      if (orientation)
      setCurrentOrientation({alpha: orientation.alpha, beta: orientation.beta, gamma: orientation.gamma});
      console.log(currentOrientation)
    })
    console.log(orientation)
    

    if (orientation) {
      setCurrentOrientation({alpha: orientation.alpha, beta: orientation.beta, gamma: orientation.gamma});
      console.log(currentOrientation)
    } else {
      setCurrentOrientation({alpha: null, beta: null, gamma: null});
    }

    // return () => {
    //   window.removeEventListener('deviceorientation', handleOrientation);
    // };
  }, []);

  interface CustomCoords {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
    orientation?: {
      alpha: number | null;
      beta: number | null;
      gamma: number | null;
    } | null;
  }


//! Switch to video mode
  useEffect(() => {
    if (cameraMode === 'video' && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({video: true})
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          const newRecorder = new MediaRecorder(stream, {mimeType: 'video/webm'}); //webm is for desktop video compatibility
          newRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
              setVideoBlob(event.data);
            }
          };
          setRecorder(newRecorder);
        })
        .catch((error) => {
          console.error('Error accessing media devices.', error);
        });
    }
  }, [cameraMode]);

  useEffect(() => {
    (async function () {
      if(openAIResponse !== "") {
        if (currentChatId === "") {
          console.log(openAIResponse)
          const res3 = await createChatLog({input: userInput, output: openAIResponse, imageURL: image as string, location:{lat:coords?.latitude as number, lon:coords?.longitude as number}})
          console.log('chatLog', res3)
          if(res3){
            setCurrentChatId(res3.data._id)
            setCurrentMessageId(res3.data.messages[res3.data.messages.length-1]._id)
          }
        } else {
          const res3 = await addChatToChatLog({
            id: currentChatId,
            chat: {input: userInput, output: openAIResponse, imageURL: image as string, location:{lat:coords?.latitude as number, lon:coords?.longitude as number}}
          })
          console.log('chatLog', res3)
          if(res3){

            setCurrentMessageId(res3.data.messages[res3.data.messages.length-1]._id)
          }
        }
        console.log(currentMessageId)
      }
    })()

  }, [openAIResponse])

// -------------------------------------------------------------------------------------------------------------------

const handleVideoRecording = async () => {
  if (!isRecording) {
    setUserInput('Describe the video');
    try {
      // Request rear camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Force rear camera
      });
      videoStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/mp4" }); //mp4 is needed for browser compatibility on mobile 
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      // Push recorded video data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Handle stop recording
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: "video/mp4" });
        setVideoBlob(videoBlob);
        console.log("Video recorded:", URL.createObjectURL(videoBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          stopVideoStream();
        }
      }, 6000);
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  } else {
    // Stop manually if button is clicked again
    mediaRecorderRef.current?.stop();
    stopVideoStream();
  }
};

// Stops the video stream
const stopVideoStream = () => {
  videoStreamRef.current?.getTracks().forEach((track) => track.stop());
  setIsRecording(false);
};
  
// -------------------------------------------------------------------------------------------------------------------

  const handleRetake = () => {
    setVideoBlob(null);
    setImage(null);
    URL.revokeObjectURL(audioUrl)
    setAudioUrl("")
    setOpenAIResponse("")
  };
// -------------------------------------------------------------------------------------------------------------------

  const extractFrames = async (videoBlob: Blob): Promise<string[]> => {
    const videoUrl = URL.createObjectURL(videoBlob);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    await videoElement.play();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    const frameInterval = 1; // Capture one frame per second
    const frames: string[] = [];

    return new Promise<string[]>((resolve) => {
      videoElement.addEventListener('timeupdate', () => {
        if (videoElement.currentTime < videoElement.duration) {
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg'));
          videoElement.currentTime += frameInterval;
        } else {
          resolve(frames);
        }
      });
    });
  };
// -------------------------------------------------------------------------------------------------------------------
  async function sendRequestOpenAI() {
    try {
      setLoading(true); //  loading starts
      speak("loading response"); // Play TTS message
      responseRef.current?.scrollIntoView({ behavior: 'smooth' }); // page scrolls down when loading starts

      let frames: string[] = [];
      // If videoBlob exists, extract all frames
      if (videoBlob) {
        frames= await extractFrames(videoBlob);
        // console.log('Extracted frames:', frames);
      }

      // Create the CustomCoords object
      const customCoords: CustomCoords | null = coords ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading !== undefined ? coords.heading : null,
        speed: coords.speed,
        orientation: orientation ? {
          alpha: orientation.alpha !== null ? orientation.alpha : null,
          beta: orientation.beta !== null ? orientation.beta : null,
          gamma: orientation.gamma !== null ? orientation.gamma : null,
        } : null,
      } : null;

      //prepare the request data, including all extracted frames (if available)
      const data: RequestData = {
        text: userInput,
        image: frames.length > 0 ? frames : [image], //sends all frames, or fallback to a single image 
        // image: frames.length > 0 ? frames[0] : image, //only takes the first extracted frame or fallback to default image
        coords: customCoords,  // Use the CustomCoords object here
      };

      // if (!data.image) {
      //   throw new Error('No image data available.');
      // }

      console.log('Sending request data to backend:', data);
      const res = await sendTextRequest(data)

      if (res) {
        setOpenAIResponse(res.output);
        // TODO: Commented out audio response cause it takes a lot of tokens but make sure to reenable if building for production
        const res2 = await sendAudioRequest(res.output);
        if (res2) {
          const blob = new Blob([res2], {type: "audio/mpeg"});
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } else {
        throw new Error('Invalid response from API.');
      }
    } catch (e) {
      console.error('Error sending request to OpenAI:', e);
      setOpenAIResponse('An error occurred while processing your request. Please try again.');
    }
    finally {
      setLoading(false); // loading cirlce stops
      speechSynthesis.cancel(); // Stop TTS when loading ends

    }
  }
// -------------------------------------------------------------------------------------------------------------------
  //tts function for loading state
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  }
// -------------------------------------------------------------------------------------------------------------------
//speech to text- Speech recognition
const startListening = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => setIsListening(true); // Update UI state
  recognition.onend = () => setIsListening(false);

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setUserInput(transcript);  // Update userInput with the transcribed text
  };

  recognitionRef.current = recognition;
  recognition.start();
};

const stopListening = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    setIsListening(false);
  }
};
// -------------------------------------------------------------------------------------------------------------------
const handleCapture = (target: EventTarget & HTMLInputElement) => {
  if (target.files) {
    if (target.files.length !== 0) {
      const file = target.files[0];

      if (file.type.startsWith("video")) {
        setUserInput('Describe the video'); // Update prompt for video upload
        //Blob URL for uploaded video
        const videoBlob = new Blob([file], { type: file.type });
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log("Video URL:", videoUrl);
        setVideoBlob(videoBlob); // uploaded video is stored in BLOB same as recorded video
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 640; // Max width for the image
            const scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert the resized image to Base64
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // 0.7 = 70% quality
            console.log(compressedBase64); // Use the compressed base64 string
            setImage(compressedBase64);
          };
        };
        
        if (file) {
          reader.readAsDataURL(file);
        }
        // const newUrl = URL.createObjectURL(file);
        // console.log(newUrl);
      }
    }
  }
};

// -------------------------------------------------------------------------------------------------------------------
return (
    <div>
    <Stack
      
      component="main"
      role="main"
      sx={{
        display: 'flex', //flex container
        flexDirection: 'column',
        justifyContent: 'center', //centered horizontally
        alignItems: 'center', //centered vertically
        paddingLeft: isMobile ? '8px' : '32px',
        paddingRight: isMobile ? '8px' : '32px',
        backgroundColor: 'black',
        color: 'white',
        height: '100vh', //full height
        overflowY: 'auto',
        minHeight: '100vh'
      }}
    >
      
      {/* Blue Section: Take Photo */}
      <BlueSection>
      {/* Condition for displaying either camera or video view depending on whether the image or videoBlob exists */}
      {!image && !videoBlob ? (
        <>
          <Box sx={{width: '100%', maxWidth: '600px', textAlign: 'center', border: '4px solid white',}}>
            {/* Display the Camera component on both desktop/mobile */}
            {cameraMode === 'photo'  ? ( 
              <Box sx={{width: '100%', height: 'auto', borderRadius: '12px', overflow: 'hidden',textAlign: 'center'}}>
                <Camera
                  aspectRatio={4 / 3}
                  facingMode={'environment'}
                  ref={camera}
                  aria-label="Camera viewfinder"
                  errorMessages={{}}
                />
              </Box>
             ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                aria-label="Camera video feed"
                style={{width: '100%', borderRadius: '12px', overflow: 'hidden'}}
              />
            )}
          </Box>
{/* ----------------------------------------------------------------------------------------------------------- */}
          {/* Upload file button for desktop */}
          {!isMobile && (
          <AccessibleButton
            component="label"
            sx={{width: '100%', 
              maxWidth: '600px', 
              marginTop: '16px', 
              marginBottom: '16px',
              '&:hover': {backgroundColor: '#303030',},
              '&:focus': {outline: '3px solid #FFA500',
                          outlineOffset: '2px',},
              }}
            aria-label={image || videoBlob ? "Reupload file" : "Upload file"}
          >
              {cameraMode === 'video' ? "UPLOAD VIDEO" : "UPLOAD IMAGE"}
              <input
              accept="image/*,video/*"
              type="file"
              capture="environment"
              onChange={(e) => handleCapture(e.target)}
              style={{display: 'none'}}
            />
          </AccessibleButton>
          )}  
{/* ----------------------------------------------------------------------------------------------------------- */}  
          {/* button for taking photo mobile version */}
          {isMobile  &&(
           <Box
            component="label"
            sx={{
              display: 'inline-flex',
              justifyContent: 'center',
              verticalAlign: 'top', // aligns them nicely
              alignItems: 'center',
              gap: '16px', // space between buttons
              marginTop: '16px',
              marginBottom: '16px',
              margin: '8px',
              width: '120px',
              height: '120px',
              padding: '20px',
              fontSize: '2rem',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:active': {
                backgroundColor: '#d0d0d0',
              },
            }}
            onClick={() => {
              const capturedImage = camera.current?.takePhoto() as string;
              if (capturedImage) {
                setImage(capturedImage);
                setUserInput('Describe the image');
              } else {
                console.error('Failed to capture image.');
              }
              console.log(orientation)
            }}
            aria-label={image || videoBlob ? "Reupload file" : "Upload file"}
          >
            TAKE PICTURE
            {/* below code is for opening camera interface on mobile */}
            {/* <input
              accept="image/*"
              type="file"
              capture="environment"
              onChange={(e) => handleCapture(e.target)}
              style={{display: 'none'}}
            /> */}
          </Box>
  )} 

{/* -------------------------------------------------------------------------------------------- */}
          {/* button for taking video mobile version*/}
          {isMobile &&(
          <Box
            component="label"
            sx={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px', // space between buttons
              flexWrap: 'wrap',
              marginTop: '16px',
              marginBottom: '16px',
              margin: '8px', // spacing between buttons
              width: '120px',
              height: '120px',
              padding: '20px',
              fontSize: '2rem',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '20px', // Match shared style
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)', // Keep subtle, clean shadow
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:active': {
                backgroundColor: '#d0d0d0',
              },
            }}
            // aria-label={videoBlob ? "Reupload file" : "Upload file"}
            onClick={handleVideoRecording}
          >
            {isRecording ? "STOP VIDEO" : "START VIDEO"}
            {/* <input
              accept="video/*"
              type="file"
              capture="environment"
              onChange={(e) => handleCapture(e.target)}
              style={{display: 'none'}}
            /> */}
          </Box>
  )}
  
{/* ----------------------------------------------------------------------------------------------------------- */}

          {/* Take photo button (desktop)  */}
          {!isMobile && cameraMode === 'photo' && (
            <AccessibleButton
              onClick={() => {
                const capturedImage = camera.current?.takePhoto() as string;
                if (capturedImage) {
                  setImage(capturedImage);
                  setUserInput('Describe the image');
                } else {
                  console.error('Failed to capture image.');
                }
              }}
              aria-label="Take photo"
              sx={{width: '100%', 
                maxWidth: '600px', 
                marginTop: '16px', 
                marginBottom: '16px',
                '&:hover': {backgroundColor: '#303030',},
                '&:focus': {outline: '3px solid #FFA500',
                            outlineOffset: '2px',},
                }}
            >
              Take photo
            </AccessibleButton>
          )}
{/* ----------------------------------------------------------------------------------------------------------- */}
          {/* Start/Stop Video button (desktop) */}
          {!isMobile && cameraMode === 'video' && (
            <AccessibleButton
            onClick={handleVideoRecording}
              
            aria-label={isRecording ? "Stop video" : "Start video"}
            sx={{
              width: '100%', 
              maxWidth: '600px', 
              marginTop: '16px', 
              marginBottom: '16px',
              backgroundColor: isRecording ? '#FF0000' : 'inherit', // Red when recording
              '&:hover': {backgroundColor: isRecording ? '#CC0000' : '#303030',},
              '&:focus': {outline: '3px solid #FFA500', outlineOffset: '2px',},
            }}
          >
            {isRecording ? "Stop Video" : "Start Video"}
          </AccessibleButton>
          )}
        </>
      ) : (
        <>
          <p>Buddy Walk</p> {/* this text is a conditon that helps the video render */}
          {/* Video Preview */}
          <Box sx={{width: '100%', maxWidth: '600px', textAlign: 'center'}}>
            {videoBlob ? (
              <video
                src={URL.createObjectURL(videoBlob)}
                controls
                autoPlay
                playsInline
                muted  // Ensures video autoplay works on mobile
                aria-label="Recorded video"
                style={{
                  width: '100%',
                  height: isMobile ? 'auto' : '60vh',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '4px solid white',
                }}
              />
            ) : (
              <img
                src={image as string}
                alt="Taken photo"
                aria-hidden="true"
                style={{width: '100%', borderRadius: '12px', border: '4px solid white',}}
              />
            )}
            <AccessibleButton
              onClick={handleRetake}
              aria-label="Retake photo or video"
              sx={{width: '100%', 
                maxWidth: '600px', 
                marginTop: '16px', 
                marginBottom: '16px',
                '&:hover': {backgroundColor: '#303030',},
                '&:focus': {outline: '3px solid #FFA500',
                            outlineOffset: '2px',},
                }}
            >
              Retake
            </AccessibleButton>
          </Box>
        </>
      )}
      </BlueSection>
      {orientation && (
        <div className="mt-6">
        <ul style={{ margin: 0, padding: 0, color: 'white' }}>
          <li>ɑ: {orientation && <code className="language-text">{orientation.alpha}</code>}</li>
          <li>β: {orientation && <code className="language-text">{orientation.beta}</code>}</li>
          <li>γ: {orientation && <code className="language-text">{orientation.gamma}</code>}</li>
        </ul>
      </div>
      )}

      {/* Geolocation data display for desktop */}
      {/*{!isMobile && (*/}
      {/*  <Box*/}
      {/*    aria-live="polite"*/}
      {/*    sx={{*/}
      {/*      display: 'block',*/}
      {/*      marginTop: '16px',*/}
      {/*      textAlign: 'center',*/}
      {/*      maxWidth: '60px',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {!isGeolocationEnabled ? (*/}
      {/*      <AccessibleTypography>Your browser does not support geolocation</AccessibleTypography>*/}
      {/*    ) : coords ? (*/}
      {/*      <Box component="ul" sx={{listStyleType: 'none', padding: 0}}>*/}
      {/*        <AccessibleTypography>Latitude: {coords.latitude?.toFixed(4) ?? 'N/A'}</AccessibleTypography>*/}
      {/*        <AccessibleTypography>Longitude: {coords.longitude?.toFixed(4) ?? 'N/A'}</AccessibleTypography>*/}
      {/*        <AccessibleTypography>Accuracy: {coords.accuracy ? `${Math.round(coords.accuracy)} meters` : 'N/A'}</AccessibleTypography>*/}
      {/*        <AccessibleTypography>Heading: {coords.heading ? `${Math.round(coords.heading)} degrees` : 'N/A'}</AccessibleTypography>*/}
      {/*        <AccessibleTypography>Alpha Orientation: {orientation.alpha}</AccessibleTypography>*/}

      {/*      </Box>*/}
      {/*    ) : (*/}
      {/*      <AccessibleTypography>Getting the location data...</AccessibleTypography>*/}
      {/*    )}*/}
      {/*  </Box>*/}
      {/*)}*/}

      {/* Gray Section: Asking the Question */}
      <GraySection>
      {/* Question input field */}
      <AccessibleTextField
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        sx={{bgcolor: 'white', marginY: 2, maxWidth: '550px', borderRadius: '12px'}}
        label="Enter a question below:"
        aria-label="User input"
        fullWidth
        InputProps={{ 
          endAdornment:  (   
              <InputAdornment position="end">
                  <IconButton
                      aria-label="clear text"
                      onClick={()=> setUserInput("")}
                      edge="end"
                      sx={{ visibility: userInput ? "visible" : "hidden" }}
                  >
                      <ClearIcon />
                  </IconButton> 
              </InputAdornment>
          ),
      }}
      />
      {/* speech to text button below */}
      <button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        onTouchCancel={stopListening} // Ensure it stops if finger is moved
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
          marginTop: "5px",
          marginBottom: "16px",
          border: "none",
        }}
      >
    {isListening ? 'Listening...' : 'Hold to Ask a Question'}
    </button>
      </GraySection>

      {/* Green Section: Displaying the Response */}
      <GreenSection>
      {/* Submit button */}
      <AccessibleButton
        onClick={() => sendRequestOpenAI()}
        aria-label="Get description"
        sx={{ display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',                 // full width
          maxWidth: '600px',            // responsive cap
          height: '80px',               // shorter than 120px but still chunky
          padding: '20px',
          fontSize: '2rem',
          marginTop: '16px',
          marginBottom: '16px',
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
          '&:active': {
            backgroundColor: '#d0d0d0',
          },
        }}
      >
        Submit
      </AccessibleButton>

      <div ref={responseRef} style={{ marginTop: '16px' }}> {/* to start the scroll down */}  
      {loading ? ( //loading circle
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px',
      }}
      >
        <CircularProgress 
        size={80}
        thickness={6} //increased thickness for better visibility
        sx={{ margin: '20px', 
              color: '#f8f8ff',

            }}
        />
        <AccessibleTypography sx={{ color: '#f8f8ff', marginTop: '10px' }}>
        Loading response...
        </AccessibleTypography>
      </Box>
        ) : (
      <Box aria-live="polite" role="status" sx={{marginTop: 2, maxWidth: '600px'}}>
        <AccessibleTypography>{openAIResponse}</AccessibleTypography>
      </Box>
        )}
        
      {/* code below adds the drag/seek audio bar */}
      {audioUrl && <audio id="ttsAudio" src={audioUrl} autoPlay style={{display:"none"}}/>} 
{/* --------------------------------------------------------------------------------------------- */}

    {/*TTS Button with Play/Pause option*/}
    {audioUrl && (
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginTop: '16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <AccessibleButton
          onClick={() => {
            const audioElement = document.getElementById('ttsAudio');
            if (audioElement) {
              if (audioElement.paused) {
                audioElement.play();
              } else {
                audioElement.pause();
              }
            }
          }}
          aria-label="Play or Pause text-to-speech"
          sx={{
            padding: "12px 28px",          // shorter height and wider for tap comfort
          borderRadius: "40px",          // rounder edges
          cursor: "pointer",
          color: "black",
          fontSize: "1.2rem",
          fontWeight: "700",
          letterSpacing: "0.05em",
          backgroundColor: "white",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "fit-content",          // allows it to size based on content
          marginTop: "5px",
          marginBottom: "16px",
          border: "none",
          }}
        >
          <span role="img" aria-label="Speaker" style={{ marginRight: '8px' }}>
            🔊
          </span>
          Play/Pause Response
        </AccessibleButton>
        <ReportMessage openAIResponse={openAIResponse} currentMessageId={currentMessageId} currentChatId={currentChatId}/>

        {/* audio Element for Seek without extra controls
        <audio
          id="ttsAudio"
          src={audioUrl}
          style={{
            display: 'none', // Hide controls and seek bar
          }}
          //controls
          autoPlay
        >
          Your browser does not support the audio element. 
        </audio> */}
      </div>
    )}
  </div>
  </GreenSection>
      {/* Toggle switch for camera mode visible on desktop */}
      {!isMobile && (
        <FormControlLabel
          control={
            <Switch
              checked={cameraMode === 'video'}
              onChange={() => setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')}
            />
          }
          label={cameraMode === 'photo' ? 'Switch to Video' : 'Switch to Photo'}
          aria-label="Toggle camera mode"
          sx={{width: '100%', maxWidth: '600px', marginTop: '16px'}}
        />
      )}


    </Stack>
    </div>
  );
}