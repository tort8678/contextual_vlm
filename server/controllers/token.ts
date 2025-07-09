import { TokenService } from "../services/token";
import { Request, Response } from "express";

const tokenService = new TokenService();
export class TokenController {
  async getToken(req: Request, res: Response): Promise<void> {
    await tokenService.getToken({req,res});
  }
}