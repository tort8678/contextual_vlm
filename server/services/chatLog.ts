import chatLogModel, {chatLogInterface, messageInterface} from "../database/models/chatLog";
import {AppContext} from "../types";

export class ChatLogService {
  async newChatLog(ctx: AppContext, body: messageInterface) {
    const {res} = ctx;
    try {

      const result = await chatLogModel.create({messages: body});
      if (result) {
        res.status(200).json({
          message: "Created new chat log!",
          data: result
        });
      }

    } catch (e) {
      const error = new Error(`${e}`);
      res.json({
        code: 500,
        message: error.message
      })
    }
  }

  async addChat(ctx: AppContext, body: {chat: messageInterface, id: string }){
    const {res} = ctx
    console.log(body)
    try{

      const result = await chatLogModel.findByIdAndUpdate(body.id, {$push:{messages: body.chat}}, {new: true} )
      if(result){
        res.status(200).json({
          message: "Added chat to existing log!",
          data: result
        });
      }
    } catch (e) {
      const error = new Error(`${e}`);
      res.json({
        code: 500,
        message: error.message
      })
    }
  }
}