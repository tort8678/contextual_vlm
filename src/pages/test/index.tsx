import {Camera, CameraType} from "react-camera-pro";
import {useRef, useState} from "react";
import {Box, Button, TextField, Stack, Typography} from "@mui/material";
import {useGeolocated} from "react-geolocated";
import sendRequest from "../../api/openAi.ts";
import { styled } from '@mui/material/styles';

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


export default function Test() {
  const camera = useRef<CameraType>(null)
  const [image, setImage] = useState<string | null>(null)
  const [openAIResponse, setOpenAIResponse] = useState("")
  const [userInput, setUserInput] = useState<string>("say this is a test")
  const {coords, isGeolocationEnabled} = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000
  })

  async function sendRequestOpenAI() {
    try {
      const data = {
        text: "You are a blind assistent, be quick and to the point, describe the setting and geographical location for a blidn user. Do not tell them what we provide you. Userinput: " + userInput,
        image: image as string,
        coords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null
      };
      const res = await sendRequest(data);
      console.log(res.data.content);
      setOpenAIResponse(res.data.content);
      return res;
    } catch (e) {
      console.error(e);
    }
  }


  return (
    <Stack 
      maxWidth={"100vw"} 
      component="main" 
      role="main" 
      sx={{ 
        paddingLeft: '16px', 
        paddingRight: '16px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {!image ? (
        <>
          <Box>
            <Camera
              aspectRatio={4 / 3}
              facingMode={"environment"}
              ref={camera}
              errorMessages={{}}
              aria-label="Camera viewfinder"
            />
          </Box>
          <AccessibleButton
            onClick={() => {
              setImage(camera.current?.takePhoto() as string);
              setUserInput("Please describe the image");
            }}
            aria-label="Take photo"
          >
            Take photo
          </AccessibleButton>
        </>
      ) : (
        <>
          <img src={image as string} alt="Taken photo" aria-hidden="true" />
          <AccessibleButton
            onClick={() => setImage(null)}
            aria-label="Retake photo"
          >
            Retake photo
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
      {image && (
        <>
          <AccessibleTextField
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            sx={{ bgcolor: "white", marginY: 2 }}
            label="User input"
            aria-label="User input"
            fullWidth
          />
          <AccessibleButton
            onClick={() => sendRequestOpenAI()}
            aria-label="Get description"
          >
            Get Description
          </AccessibleButton>
          <Box aria-live="polite" role="status" sx={{ marginTop: 2 }}>
            <AccessibleTypography>{openAIResponse}</AccessibleTypography>
          </Box>
        </>
      )}
    </Stack>
  );
}