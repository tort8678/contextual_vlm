import axios from "axios";

const baseRequest = axios.create({baseURL: "http://localhost:8000"});



export default async function sendRequest(data: {text:string, image: string}){
  if(data.text !== ""){
    try {
      const res = await baseRequest.post("/testing", data)
      //console.log(res)
      return res.data;
    } catch(e){
      console.error(e)
    }
  }
}