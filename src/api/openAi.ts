import axios, {AxiosResponse} from "axios";

const baseRequest = axios.create({baseURL: "http://localhost:8000"});

interface openAIData {
  text: string,
}


export async function sendTextRequest(data: {text:string, image: string|null}){
  if(data.text !== ""){
    try {
      const res: AxiosResponse<openAIData> = await baseRequest.post("/text", data)
      //console.log(res)
      return res.data;
    } catch(e){
      console.error(e)
    }
  }
}

export async function sendAudioRequest(text:string){
  if(text !== ""){
    try{
      const audioRequest = axios.create({baseURL: "http://localhost:8000", responseType: "arraybuffer"});
      const res:AxiosResponse<Buffer> = await audioRequest.post("/audio", {text})
      console.log(res)
      return res.data
    } catch(e){
      console.error(e)
    }
  }
}