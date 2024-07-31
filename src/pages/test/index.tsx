import {Camera, CameraType} from "react-camera-pro";
import {useRef, useState} from "react";
import {Box, Button, TextField, Stack} from "@mui/material";
import {useGeolocated} from "react-geolocated";
import sendRequest from "../../api/openAi.ts";

export default function Test() {
  const camera = useRef<CameraType>(null)
  const [image, setImage] = useState<string | null>(null)
  const [openAIResponse, setOpenAIResponse] = useState("")
  const [userInput, setUserInput] = useState<string>("say this is a test")
  const { coords, isGeolocationEnabled} = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000
  })

  async function sendRequestOpenAI(){
    try{
      const res = await sendRequest({text:userInput, image: image as string})
      console.log(res.data.content)
      setOpenAIResponse(res.data.content)
      return res
    } catch(e){
      console.error(e)
    }
  }


  return (
    <Stack maxWidth={"100vw"}>
      <Box width="50%" height="50%">
        <Camera aspectRatio={4 / 3} facingMode={"environment"} ref={camera} errorMessages={{}}/>
      </Box>
      <button onClick={() => {
        setImage(camera.current?.takePhoto() as string);
      }}>Take photo
      </button>
      {image !== null && <img src={image as string} alt='Taken photo'/> }
      <Box>
        {!isGeolocationEnabled ? <div>Your browser does not support geolocation</div> : coords ? (
          <table>
            <tbody>
            <tr>
              <td>latitude</td>
              <td>{coords.latitude}</td>
            </tr>
            <tr>
              <td>longitude</td>
              <td>{coords.longitude}</td>
            </tr>
            <tr>
              <td>accuracy</td>
              <td>{coords.accuracy}</td>
            </tr>
            <tr>
              <td>heading</td>
              <td>{coords.heading}</td>
            </tr>
            </tbody>
          </table>
        ) : (
          <div>Getting the location data&hellip; </div>
        ) }
      </Box>
      <TextField value={userInput} onChange={(e)=> setUserInput(e.target.value)} sx={{bgcolor:"white"}}></TextField>
      <Button sx={{bgcolor:"white"}} onClick={()=> sendRequestOpenAI()}>Test OpenAi Request</Button>
      <div>{openAIResponse}</div>
    </Stack>
  )
}