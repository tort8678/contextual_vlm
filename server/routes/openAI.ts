import express from "express"
import {OpenAIController} from "../controllers/openAI";
const route = express.Router()

const openAIController = new OpenAIController();

route.post("/text", openAIController.textRequest)
route.post("/audio", openAIController.audioRequest)

export default route;