import {ChatLogController} from "../controllers/chatLog";
import express from "express"
const route = express.Router()
const chatLogController = new ChatLogController()

route.post("/createChatLog", chatLogController.createChatLog)
route.post("/newChat", chatLogController.updateChatLog)

export default route;
