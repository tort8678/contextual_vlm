import axios from 'axios';
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cors from 'cors';
// import nunjucks from "nunjucks";
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const key = process.env.OPENAI_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

const client = new OpenAI({
  apiKey: key,
});

export interface AppContext {
  req: Request;
  res: Response;
}



//* Google API
async function fetchNearbyPlaces(latitude: number, longitude: number) {
  // can add "Types" and "keywords" to the google query
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=convenience_store&key=${googleApiKey}`;
  console.log(`Fetching nearby places with URL: ${url}`);

  try {
    const response = await axios.get(url);
    console.log('Google Places API response:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching nearby places:',error);
    throw error;
  }
}

//* OpenAI API
async function openAIReq(ctx: AppContext, content: { text: string; image: string; coords: { latitude: number; longitude: number } | null }) {
  const { res } = ctx;
  let userContent = content.text;
  let nearbyPlaces = '';

  if (content.coords) {
    userContent += ` Coordinates: Latitude ${content.coords.latitude}, Longitude ${content.coords.longitude}`;
    try {
      const places = await fetchNearbyPlaces(content.coords.latitude, content.coords.longitude);
      nearbyPlaces = places.map((place: {name:string}) => place.name).join(', ');
      userContent += ` Nearby Places: ${nearbyPlaces}`;
    } catch (error) {
      console.error('Error including nearby places in OpenAI request:', error);
    }
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{
        role: 'user', content: [
          { type: 'text', text: userContent },
          {
            type: 'image_url', image_url: {
              url: content.image,
              detail: 'low',
            },
          },
        ],
      }],
      model: 'gpt-4o-mini-2024-07-18',
    });
    console.log('OpenAI API response:', chatCompletion);
    res.json({ data: chatCompletion.choices[0].message });
  } catch (e) {
    console.error('Error with OpenAI API request:', e);
    res.status(500).json({ error: 'Error processing your request' });
  }
}

//* OpenAI Audio API
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
// nunjucks.configure("dist", {
//   autoescape: true,
//   express: app,
// });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../dist')));
console.log(path.join(__dirname, '../dist'))


app.get('/', (_req: Request, res: Response) => {
  res.send(path.join(__dirname, '../dist'));
});

app.post('/text', (req: Request, res: Response) => {
  const { text, image, coords } = req.body;

  if (text !== '') {
    openAIReq({ req, res }, { text, image, coords });
  } else res.send("you didn't send me text");
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
