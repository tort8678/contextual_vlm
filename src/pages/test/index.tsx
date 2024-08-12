import { Camera, CameraType } from 'react-camera-pro';
import { useRef, useState, useEffect } from 'react';
import { Box, Button, TextField, Stack, Typography, Switch, FormControlLabel } from '@mui/material';
import { useGeolocated } from 'react-geolocated';
import {sendTextRequest, sendAudioRequest} from "../../api/openAi.ts";
import { styled } from '@mui/material/styles';
import axios from 'axios';


const AccessibleButton = styled(Button)({
  backgroundColor: '#000000',
  color: '#FFFFFF',
  fontSize: '1.2rem',
  padding: '12px 24px',
  margin: '10px 0',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#303030',
  },
  '&:focus': {
    outline: '3px solid #FFA500',
    outlineOffset: '2px',
  },
});

const AccessibleTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    fontSize: '1.2rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.2rem',
  },
});

const AccessibleTypography = styled(Typography)({
  fontSize: '1.6rem',
  lineHeight: 1.6,
  color: '#000000',
  fontWeight: 500,
});

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
}

interface RequestData {
  text: string;
  image: string | null;
  coords: GeolocationCoords | null;
}

export default function Test() {
  const camera = useRef<CameraType>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [openAIResponse, setOpenAIResponse] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('Describe the image');
  const [audioUrl, setAudioUrl] = useState("")
  const { coords, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

//! Switch to video mode
  useEffect(() => {
    if (cameraMode === 'video' && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          const newRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
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
        text: `You are a blind assistant, be quick and to the point, use the coordinates to add to the depth of your description of what is happening in the photo/video frames. Always List 1 nearby specific location with corresponding details in addition to description. Have normal basic sentence formatting: ${userInput}`,
        image: frames.length > 0 ? frames[0] : image,
        coords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
      };
  
      if (!data.image) {
        throw new Error('No image data available.');
      }
  
      console.log('Sending request data to backend:', data);
  
      const res = await axios.post('http://localhost:8000/testing', data);
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

  return (
    <Stack
      maxWidth={'100vw'}
      component="main"
      role="main"
      sx={{
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <FormControlLabel
        control={<Switch checked={cameraMode === 'video'} onChange={() => setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')} />}
        label={cameraMode === 'photo' ? 'Switch to Video' : 'Switch to Photo'}
        aria-label="Toggle camera mode"
      />
  
      {!image && !videoBlob ? (
        <>
          <Box>
            {cameraMode === 'photo' ? (
              <Camera aspectRatio={4 / 3} facingMode={'environment'} ref={camera} errorMessages={{}} aria-label="Camera viewfinder" />
            ) : (
              <video ref={videoRef} autoPlay muted aria-label="Camera video feed" style={{ width: '100%' }} />
            )}
          </Box>
          {cameraMode === 'photo' ? (
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
            >
              Take photo
            </AccessibleButton>
          ) : (
            <AccessibleButton onClick={handleVideoRecording} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </AccessibleButton>
          )}
        </>
      ) : (
        <>
          {videoBlob ? (
            <video src={URL.createObjectURL(videoBlob)} controls aria-label="Recorded video" />
          ) : (
            <img src={image as string} alt="Taken photo" aria-hidden="true" />
          )}
          <AccessibleButton onClick={handleRetake} aria-label="Retake photo or video">
            Retake
          </AccessibleButton>
        </>
      )}
  
      <Box aria-live="polite">
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
          <AccessibleTypography>Getting the location data... </AccessibleTypography>
        )}
      </Box>
  
      {(image || videoBlob) && (
        <>
          <AccessibleTextField
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            sx={{ bgcolor: 'white', marginY: 2 }}
            label="User input"
            aria-label="User input"
            fullWidth
          />
          <AccessibleButton onClick={() => sendRequestOpenAI()} aria-label="Get description">
            Get Description
          </AccessibleButton>
          <Box aria-live="polite" role="status" sx={{ marginTop: 2 }}>
            <AccessibleTypography>{openAIResponse}</AccessibleTypography>
          </Box>
          {audioUrl !== "" && <audio controls src={audioUrl}></audio>}
        </>
      )}
    </Stack>
  );
}