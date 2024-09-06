import {AppContext} from "../types";
import axios from "axios";
import OpenAI from "openai";
import {textRequestBody} from "../types";
import dotenv from "dotenv";
dotenv.config();


async function fetchNearbyPlaces(latitude: number, longitude: number) {
  // can add "Types" and "keywords" to the google query
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=convenience_store&key=${process.env.GOOGLE_API_KEY}`;
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

export class OpenAIService {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async textRequest(ctx: AppContext, content: textRequestBody) {
    const {res} = ctx;
    let userContent = content.text;
    let nearbyPlaces = '';

    if (content.coords) {
      userContent += ` Coordinates: Latitude ${content.coords.latitude}, Longitude ${content.coords.longitude}`;

      if (content.coords.heading !== undefined) {
        userContent += `, Heading: ${content.coords.heading}`;
      }

      if (content.coords.orientation) {
        userContent += `, Orientation - Alpha: ${content.coords.orientation.alpha}, Beta: ${content.coords.orientation.beta}, Gamma: ${content.coords.orientation.gamma}`;
      }

      try {
        const places = await fetchNearbyPlaces(content.coords.latitude, content.coords.longitude);
        nearbyPlaces = places.map((place: { name: string }) => place.name).join(', ');
        userContent += ` Nearby Places: ${nearbyPlaces}`;
      } catch (error) {
        console.error('Error including nearby places in OpenAI request:', error);
      }
    }

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [{
          role: 'user', content: [
            {type: 'text', text: userContent},
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
      res.status(200).json(chatCompletion.choices[0].message.content);
    } catch (e) {
      console.error('Error with OpenAI API request:', e);
      res.status(500).json({error: 'Error processing your request'});
    }
  }

//* OpenAI Audio API
  async audioRequest(ctx: AppContext, text: string) {
    const {res} = ctx
    // const speechFile = path.resolve("./speech.mp3");
    //console.log(text)
    try {
      const mp3 = await this.client.audio.speech.create({
        model: "tts-1",
        voice: "echo",
        input: text
      })
      const buffer = Buffer.from(await mp3.arrayBuffer());
      // await fs.promises.writeFile(speechFile, buffer);

      res.contentType("audio/mpeg")
      res.status(200).send(buffer)
    } catch (e) {
      console.error(e)
    }
  }

}