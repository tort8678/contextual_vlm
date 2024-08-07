import axios from 'axios';
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cors from 'cors';

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
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=point_of_interest&key=${googleApiKey}`;
  console.log(`Fetching nearby places with URL: ${url}`);

  try {
    const response = await axios.get(url);
    console.log('Google Places API response:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching nearby places:', error.response ? error.response.data : error.message);
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
      nearbyPlaces = places.map((place: any) => place.name).join(', ');
      userContent += ` Nearby Places: ${nearbyPlaces}`;
    } catch (error) {
      console.error('Error including nearby places in OpenAI request:', error.message);
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
app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.post('/testing', (req: Request, res: Response) => {
  const { text, image, coords } = req.body;

  if (text !== '') {
    openAIReq({ req, res }, { text, image, coords });
  } else res.send("you didn't send me text");
});

app.listen(port, () => {
  console.log(`Server is live at http://localhost:${port}`);
});
