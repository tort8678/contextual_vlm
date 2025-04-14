import axios, {AxiosResponse} from "axios";
import {RequestData} from "../pages/test/types.ts";

const baseRequest = axios.create({baseURL: "/api"});



export async function sendTextRequest(data: RequestData){
  if(data.text !== ""){
    try {
      const sendTime =  new Date().getTime()
      const res: AxiosResponse = await baseRequest.post(`/text`, data)
      const receiveTime = new Date().getTime()
      const timeDiff = receiveTime - sendTime
      console.log("Time taken for text request: ", timeDiff, "ms")
      //console.log(res.data)
      return res.data;
    } catch(e){
      console.error(e)
    }
  }
}

export async function sendAudioRequest(text:string){
  if(text !== ""){
    try{
      const sendTime =  new Date().getTime()
      const audioRequest = axios.create({baseURL:"/api", responseType: "arraybuffer"});
      const res:AxiosResponse<Buffer> = await audioRequest.post(`/audio`, {text})
      const receiveTime = new Date().getTime()
      const timeDiff = receiveTime - sendTime
      console.log("Time taken for audio request: ", timeDiff, "ms")
      //console.log(res)
      return res.data
    } catch(e){
      console.error(e)
    }
  }
}