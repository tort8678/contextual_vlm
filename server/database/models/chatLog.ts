import mongoose, { Schema } from "mongoose";

export type LocationInterface = {lat: number; lon: number};
export interface messageInterface {
  input: string,
  output: string,
  imageURL: string,
  location: LocationInterface,
  flag?: boolean,
  flag_reason?: string
}
export interface chatLogInterface {
  messages: messageInterface[],
}

const MessageSchema = new Schema<messageInterface>({
  input: {type:String, required:true},
  output: {type:String, required:true},
  imageURL: {type:String, required:false},
  location: {
    type: {lat:Number, lon: Number},
    required: true
  },
  flag: {type:Boolean, default: false},
  flag_reason: {type:String, required: false}


})

const ChatLogSchema = new Schema<chatLogInterface>({
  messages: [MessageSchema]
})

export default mongoose.model<chatLogInterface>("ChatLog", ChatLogSchema, "chat_log");