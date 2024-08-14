import {Camera, CameraType} from 'react-camera-pro';
import {useRef, useState, useEffect} from 'react';
import {Box, Stack, Switch, FormControlLabel, useMediaQuery} from '@mui/material';
import {useGeolocated} from 'react-geolocated';
import {sendAudioRequest} from "../../api/openAi.ts";
import axios from 'axios';
// import {FirebaseStart} from "../../api/firebase.ts";
import {RequestData} from "./types.ts";
import {AccessibleButton, AccessibleTypography, AccessibleTextField} from "./style.ts";


export default function Test() {
  const camera = useRef<CameraType>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [openAIResponse, setOpenAIResponse] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('Describe the image');
  const [audioUrl, setAudioUrl] = useState("");
  const {coords, isGeolocationEnabled} = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    watchLocationPermissionChange: true
  });
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    // FirebaseStart()
    // getPosition()
    navigator.geolocation.getCurrentPosition((pos) => {console.log(pos.coords)}, (error)=> {console.log(error.message); setOpenAIResponse(error.message)});
  }, []);


//! Switch to video mode
  useEffect(() => {
    if (cameraMode === 'video' && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({video: true})
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          const newRecorder = new MediaRecorder(stream, {mimeType: 'video/webm'});
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

  const handleVideoRecording = () => {
    if (isRecording && recorder) {
      recorder.stop();
      setIsRecording(false);
    } else if (recorder) {
      recorder.start();
      setIsRecording(true);
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 30000); // Stop recording after 30 seconds
    }
  };

  const handleRetake = () => {
    setVideoBlob(null);
    setImage(null);
    URL.revokeObjectURL(audioUrl)
    setAudioUrl("")
    setOpenAIResponse("")
  };

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
    const frameInterval = 1000; // Capture one frame per second
    const frames: string[] = [];

    return new Promise<string[]>((resolve) => {
      videoElement.addEventListener('timeupdate', () => {
        if (videoElement.currentTime < videoElement.duration) {
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg'));
          videoElement.currentTime += frameInterval / 1000;
        } else {
          resolve(frames);
        }
      });
    });
  };

  //! Still error with Video Mode, need to fix sending to API
  async function sendRequestOpenAI() {
    try {
      let frames: string[] = [];
      if (videoBlob) {
        frames = await extractFrames(videoBlob);
      }

      const data: RequestData = {
        text: `You are a blind assistant, be quick and to the point, use the coordinates to add to the depth of your description of what is happening in the photo/video frames. Always List nearby specific location with corresponding details in addition to description. Make sure all info is useful to an average blind user. DONT TELL USER COORDINATES, TELL THEM THEIR LOCATION. User input: ${userInput}`,
        image: frames.length > 0 ? frames[0] : image,
        coords: coords ? {latitude: coords.latitude, longitude: coords.longitude} : null,
      };

      if (!data.image) {
        throw new Error('No image data available.');
      }

      console.log('Sending request data to backend:', data);
      const url = `http://${window.location.host.substring(0,window.location.host.length-4)}8000/text`
      console.log(url)
      const res = await axios.post(url, data);

      // const res = await axios.post('http://localhost:8000/testing', data);
      console.log('Received response from backend:', res.data);


      if (res.data && res.data.data) {
        const content = res.data.data.content;
        setOpenAIResponse(content);
        const res2 = await sendAudioRequest(content)
        if (res2) {

          const blob = new Blob([res2], {type: "audio/mpeg"})
          console.log(blob)
          const url = URL.createObjectURL(blob);
          setAudioUrl(url)
          console.log(res2)
          console.log(url)
        }
      } else {
        throw new Error('Invalid response from API.');
      }
    } catch (e) {
      console.error('Error sending request to OpenAI:', e);
      setOpenAIResponse('An error occurred while processing your request. Please try again.');
    }
  }

  const handleCapture = (target: EventTarget & HTMLInputElement) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 640; // Max width for the image
            const scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert the resized image to Base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7 = 70% quality
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

  return (
    <Stack
      maxWidth={'100vw'}
      component="main"
      role="main"
      sx={{
        paddingLeft: isMobile ? '8px' : '32px',
        paddingRight: isMobile ? '8px' : '32px',
        backgroundColor: '#FFFFFF',
        height: '100vh',
        overflowY: 'auto',
        alignItems: 'center',
      }}
    >
      {/* Condition for displaying either camera or video view depending on whether the image or videoBlob exists */}
      {!image && !videoBlob ? (
        <>
          <Box sx={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            {/* Display the Camera component on desktop only */}
            {cameraMode === 'photo' && !isMobile ? (
              <Box sx={{ width: '100%', height: 'auto', borderRadius: '12px', overflow: 'hidden' }}>
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
                style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} 
              />
            )}
          </Box>
  
          {/* Upload file input visible on both mobile and desktop */}
          <Box
            component="label"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: isMobile ? '200px' : '100%',
              height: isMobile ? '200px' : 'auto',
              padding: '20px',
              fontSize: isMobile ? '2rem' : '1.5rem',
              marginTop: '16px',
              marginBottom: '16px',  // Added padding below the button
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#303030',
              },
              '&:focus': {
                outline: '3px solid #FFA500',
                outlineOffset: '2px',
              },
            }}
            aria-label={image || videoBlob ? "Reupload file" : "Upload file"}
          >
            Upload File
            <input
              accept="image/*"
              type="file"
              capture="environment"
              onChange={(e) => handleCapture(e.target)}
              style={{ display: 'none' }}
            />
          </Box>
  
          {/* Take photo button should only be visible on desktop */}
          {!isMobile && cameraMode === 'photo' && (
            <AccessibleButton
              onClick={() => {
                const capturedImage = camera.current?.takePhoto() as string;
                if (capturedImage) {
                  setImage(capturedImage);
                  setUserInput('Please describe the image');
                } else {
                  console.error('Failed to capture image.');
                }
              }}
              aria-label="Take photo"
              sx={{ width: '100%', maxWidth: '600px', marginTop: '16px', marginBottom: '16px' }}
            >
              Take photo
            </AccessibleButton>
          )}
        </>
      ) : (
        <>
          <Box sx={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            {videoBlob ? (
              <video
                src={URL.createObjectURL(videoBlob)}
                controls
                aria-label="Recorded video"
                style={{
                  width: '100%',
                  height: isMobile ? 'auto' : '60vh',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              />
            ) : (
              <img
                src={image as string}
                alt="Taken photo"
                aria-hidden="true"
                style={{ width: '100%', borderRadius: '12px' }}
              />
            )}
            <AccessibleButton
              onClick={handleRetake}
              aria-label="Retake photo or video"
              sx={{ width: '100%', maxWidth: '600px', marginTop: '16px', marginBottom: '16px' }}
            >
              Retake
            </AccessibleButton>
          </Box>
        </>
      )}
  
      {/* Geolocation data display for desktop */}
      {!isMobile && (
        <Box
          aria-live="polite"
          sx={{
            display: 'block',
            marginTop: '16px',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          {!isGeolocationEnabled ? (
            <AccessibleTypography>Your browser does not support geolocation</AccessibleTypography>
          ) : coords ? (
            <Box component="ul" sx={{ listStyleType: 'none', padding: 0 }}>
              <AccessibleTypography>Latitude: {coords.latitude?.toFixed(4) ?? 'N/A'}</AccessibleTypography>
              <AccessibleTypography>Longitude: {coords.longitude?.toFixed(4) ?? 'N/A'}</AccessibleTypography>
              <AccessibleTypography>Accuracy: {coords.accuracy ? `${Math.round(coords.accuracy)} meters` : 'N/A'}</AccessibleTypography>
              <AccessibleTypography>Heading: {coords.heading ? `${Math.round(coords.heading)} degrees` : 'N/A'}</AccessibleTypography>
            </Box>
          ) : (
            <AccessibleTypography>Getting the location data...</AccessibleTypography>
          )}
        </Box>
      )}
  
      {/* Question input field */}
      <AccessibleTextField
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        sx={{ bgcolor: 'white', marginY: 2, maxWidth: '600px' }}
        label="Question"
        aria-label="User input"
        fullWidth
      />
  
      {/* Get Description button */}
      <AccessibleButton
        onClick={() => sendRequestOpenAI()}
        aria-label="Get description"
        sx={{ width: '100%', maxWidth: '600px', marginTop: '16px' }}
      >
        Get Description
      </AccessibleButton>
      <Box aria-live="polite" role="status" sx={{ marginTop: 2, maxWidth: '600px' }}>
        <AccessibleTypography>{openAIResponse}</AccessibleTypography>
      </Box>
      {audioUrl && <audio controls src={audioUrl} autoPlay style={{ maxWidth: '600px', marginTop: '16px' }} />}
  
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
          sx={{ width: '100%', maxWidth: '600px', marginTop: '16px' }}
        />
      )}
    </Stack>
  );
}