import axios from "axios";

const baseRequest = axios.create({baseURL: "http://localhost:8000"});
export interface messageInterface {
  input: string,
  output: string,
  imageURL: string
}
export async function createChatLog(body:messageInterface){
  try{
    const result = await baseRequest.post("api/db/createChatLog", body);
    console.log(result)
    if(result)
      return result.data
  } catch(e){
    console.log(e);
  }
}
export async function addChatToChatLog(body:{id:string, chat:messageInterface}){
  try{
    const result = await baseRequest.post("api/db/newChat", body);
    console.log(result)
    if(result)
      return result.data
  } catch(e){
    console.log(e);
  }
}