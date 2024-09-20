import {OpenAIService} from "../services/openAI";
import {textRequestBody} from "../types";
import { Request, Response } from "express";

const openAIService = new OpenAIService();

export class OpenAIController {

  async parseUserRequest(req:Request, res:Response) {
    const {text} = req.body
    await openAIService.parseUserRequest({req,res}, text)
  }
  async textRequest(req: Request,
                    res: Response): Promise<void> {
    const body: textRequestBody = req.body
    await openAIService.textRequest({req,res}, body)

  }

  async audioRequest(req: Request,
                     res: Response): Promise<void> {
    const {text}= req.body

    await openAIService.audioRequest({req,res}, text)

  }
}