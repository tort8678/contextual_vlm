import express, { Request, Response , Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from "cors"

dotenv.config();

const key = process.env.OPENAI_API_KEY
console.log("api key is", key)
const client = new OpenAI({
  apiKey: key, // This is the default and can be omitted
});

export interface AppContext {
  req: Request;
  res: Response;
}


async function openAIReq(ctx: AppContext, content: string) {
  const {res} = ctx
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{role: 'user', content}],
      model: 'gpt-4o-mini-2024-07-18',
    });
    console.log(chatCompletion.choices)
    res.json({data: chatCompletion.choices[0].message})
  } catch (e) {
    console.error(e);
  }
}


const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors())
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  //console.log(req)
  res.send('Welcome to Express & TypeScript Server');
});

app.post('/testing', (req: Request, res: Response) => {
  const {content} = req.body

  if(content !== ""){
     openAIReq({req, res}, content)
    // console.log(process.env.OPENAI_API_KEY
  }
  else res.send("you didn't send me test")
})

app.listen(port, () => {
  console.log(`Server is live at http://localhost:${port}`);
});

