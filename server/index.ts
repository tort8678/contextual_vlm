import express, {Request, Response, Application,} from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from "cors"
// import fs from "fs";
// import path from "path";

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


async function openAITextReq(ctx: AppContext, content: { text: string; image: string; coords: { latitude: number; longitude: number } | null }) {
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
    res.status(200).json({text: chatCompletion.choices[0].message.content})
  } catch (e) {
    console.error(e);
  }
}

async function openAIAudioRequest(ctx: AppContext, text:string){
  const {res} = ctx
  // const speechFile = path.resolve("./speech.mp3");
  //console.log(text)
  try{
    const mp3 = await client.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: text
    })
    const buffer = Buffer.from(await mp3.arrayBuffer());
    // await fs.promises.writeFile(speechFile, buffer);

    res.contentType("audio/mpeg")
    res.status(200).send(buffer)
  }
  catch(e){
    console.error(e)
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

app.post('/text', (req: Request, res: Response) => {
  const {text,image, coords} = req.body

  if (text !== "") {
    openAITextReq({req, res}, {text, image, coords})
    // console.log(process.env.OPENAI_API_KEY
  } else res.send("you didn't send me test")
})

app.post('/audio',(req: Request, res: Response)  =>{
  const {text} = req.body
  //console.log(req.body)
  if(text !== ""){
    openAIAudioRequest({req,res}, text)
  }
})

app.listen(port, () => {
  console.log(`Server is live at http://localhost:${port}`);
});

