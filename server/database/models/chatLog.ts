import mongoose, { Schema } from "mongoose";


export interface messageInterface {
  input: string,
  output: string,
  imageURL: string
}
export interface chatLogInterface {
  messages: messageInterface[],
}

const MessageSchema = new Schema<messageInterface>({
  input: {type:String, required:true},
  output: {type:String, required:true},
  imageURL: {type:String, required:false},
})

const ChatLogSchema = new Schema<chatLogInterface>({
  messages: [MessageSchema]
})

export default mongoose.model<chatLogInterface>("ChatLog", ChatLogSchema, "chat_log");