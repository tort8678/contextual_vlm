import { TokenController } from "../controllers/token";
import express from "express";
const route = express.Router();

const tokenController = new TokenController();
route.get("/getToken", tokenController.getToken);
export default route;