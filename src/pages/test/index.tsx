import {Camera, CameraType} from "react-camera-pro";
import {useRef, useState} from "react";
import {Box, Button, TextField, Stack, Typography} from "@mui/material";
import {useGeolocated} from "react-geolocated";
import {sendTextRequest, sendAudioRequest} from "../../api/openAi.ts";
import {styled} from '@mui/material/styles';

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
  const [audioUrl, setAudioUrl] = useState("")
  const {coords} = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000
  })

  async function sendRequestOpenAI() {
    try {
      const data = {
        text: "You are a blind assistant, be quick and to the point, describe what is in the image and important details" +
          "using provided geolocation for a blind user. Do not tell them what we provide you. Userinput: " + userInput,
        image: image as string,
        coords: coords ? {latitude: coords.latitude, longitude: coords.longitude} : null
      };
      const res = await sendTextRequest(data);
      //console.log(res)
      if (res) {
        setOpenAIResponse(res.text);
        const res2 = await sendAudioRequest(res.text)
        if (res2) {

          const blob = new Blob([res2], {type: "audio/mpeg"})
          console.log(blob)
          const url = URL.createObjectURL(blob);
          setAudioUrl(url)
          console.log(res2)
          console.log(url)
        }
      }
      return res;
    } catch (e) {
      console.error(e);
    }
  }

  function reset() {
    setImage(null)
    URL.revokeObjectURL(audioUrl)
    setAudioUrl("")
  }

  return (
    <Stack maxWidth={"100vw"}
           component="main"
           role="main"
           sx={{
             paddingLeft: '16px',
             paddingRight: '16px',
             backgroundColor: '#FFFFFF',
           }}>
      {!image ?
        <>
          <Box>
            <Camera aspectRatio={4 / 3} facingMode={"environment"} ref={camera} errorMessages={{}}
                    aria-label="Camera viewfinder"/>
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
        </> :
        <>
          <img src={image as string} alt="Taken photo" aria-hidden="true"/>
          <AccessibleButton
            onClick={() => reset()}
            aria-label="Retake photo"
          >
            Retake photo
          </AccessibleButton>
        </>
      }
      <Box>
        {/*{!isGeolocationEnabled ? <div>Your browser does not support geolocation</div> : coords ? (*/}
        {/*  <table>*/}
        {/*    <tbody>*/}
        {/*    <tr>*/}
        {/*      <td>latitude</td>*/}
        {/*      <td>{coords.latitude}</td>*/}
        {/*    </tr>*/}
        {/*    <tr>*/}
        {/*      <td>longitude</td>*/}
        {/*      <td>{coords.longitude}</td>*/}
        {/*    </tr>*/}
        {/*    <tr>*/}
        {/*      <td>accuracy</td>*/}
        {/*      <td>{coords.accuracy}</td>*/}
        {/*    </tr>*/}
        {/*    <tr>*/}
        {/*      <td>heading</td>*/}
        {/*      <td>{coords.heading}</td>*/}
        {/*    </tr>*/}
        {/*    </tbody>*/}
        {/*  </table>*/}
        {/*) : (*/}
        {/*  <div>Getting the location data&hellip; </div>*/}
        {/*)}*/}
      </Box>
      {image &&
          <>
              <AccessibleTextField
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  sx={{bgcolor: "white", marginY: 2}}
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
              <Box aria-live="polite" role="status" sx={{marginTop: 2}}>
                  <AccessibleTypography>{openAIResponse}</AccessibleTypography>
              </Box>
          </>
      }
      {audioUrl !== "" && <audio controls src={audioUrl}></audio>}
    </Stack>
  )
}