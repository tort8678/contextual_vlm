import axios, {AxiosResponse} from "axios";
import {RequestData} from "../pages/test/types.ts";

const baseRequest = axios.create({baseURL: "http://localhost:8000"});



export async function sendTextRequest(data: RequestData){
  if(data.text !== ""){
    try {
      const res: AxiosResponse = await baseRequest.post(`/text`, data)
      console.log(res.data)
      return res.data;
    } catch(e){
      console.error(e)
    }
  }
}

export async function sendAudioRequest(text:string){
  if(text !== ""){
    try{
      const audioRequest = axios.create({baseURL:"http://localhost:8000", responseType: "arraybuffer"});
      const res:AxiosResponse<Buffer> = await audioRequest.post(`/audio`, {text})
      console.log(res)
      return res.data
    } catch(e){
      console.error(e)
    }
  }
}