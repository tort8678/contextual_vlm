import express, {Request, Response, Application, NextFunction} from 'express';
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


async function openAIReq(ctx: AppContext, content: { text: string; image: string; coords: { latitude: number; longitude: number } | null }) {
  const {res} = ctx
  let userContent = content.text;

  if (content.coords) {
    userContent += ` Coordinates: Latitude ${content.coords.latitude}, Longitude ${content.coords.longitude}`;
  }
  
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{
        role: 'user', content: [
          {type: 'text', text: userContent},
          {
            type: 'image_url', image_url: {
              url: content.image,
              detail: "low"
            }
          }
        ]
      }],
      model: 'gpt-4o-mini-2024-07-18',
    });
    //console.log(chatCompletion.choices)
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
  const {text,image, coords} = req.body

  if (text !== "") {
    openAIReq({req, res}, {text, image, coords})
    // console.log(process.env.OPENAI_API_KEY
  } else res.send("you didn't send me test")
})

app.listen(port, () => {
  console.log(`Server is live at http://localhost:${port}`);
});

