import {AppContext} from "../types";
import axios from "axios";
import OpenAI from "openai";
import {textRequestBody} from "../types";
import dotenv from "dotenv";
import openAI from "../routes/openAI";
import {ChatCompletionContentPartImage, ChatCompletionContentPartText} from "openai/resources";

dotenv.config();


async function fetchNearbyPlaces(latitude: number, longitude: number) {
  // can add "Types" and "keywords" to the google query
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&key=${process.env.GOOGLE_API_KEY}`;
  console.log(`Fetching nearby places with URL: ${url}`);

  try {
    const response = await axios.get(url);
    console.log('Google Places API response:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}

async function geocodeCoordinates(latitude: number, longitude: number) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(url);
    //console.log('Google Geocoding API response:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}

const tools = [
  {
    type: "function" as "function",
    function: {
      name: "generateGooglePlacesApiLink",
      description: "Generates a Google Places API link based on user location. Format: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=${type}",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Places API link."
          }
        },
        required: ["link"]
      }
    }
  },

  ]


export class OpenAIService {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async parseUserRequest(ctx:AppContext, text: string, lat:number, lng:number) {
    const {res} = ctx
    //try function?
    try {
      const openAiResponse = await this.client.chat.completions.create({
        model: "gpt-4-0613",
        messages: [
          {role: "user", content: text},
          {
            role: "system",
            content: `decide the appropriate link to return from function options. If none fit the user query, return 'none'. The latitude is ${lat} and the longitude is ${lng}.  If no type is specified, leave this part out: &type=type`
          },
          // {
          //   role: "system", content: "possible types in places request: accounting\n" +
          //     "airport\n" +
          //     "amusement_park\n" +
          //     "aquarium\n" +
          //     "art_gallery\n" +
          //     "atm\n" +
          //     "bakery\n" +
          //     "bank\n" +
          //     "bar\n" +
          //     "beauty_salon\n" +
          //     "bicycle_store\n" +
          //     "book_store\n" +
          //     "bowling_alley\n" +
          //     "bus_station\n" +
          //     "cafe\n" +
          //     "campground\n" +
          //     "car_dealer\n" +
          //     "car_rental\n" +
          //     "car_repair\n" +
          //     "car_wash\n" +
          //     "casino\n" +
          //     "cemetery\n" +
          //     "church\n" +
          //     "city_hall\n" +
          //     "clothing_store\n" +
          //     "convenience_store\n" +
          //     "courthouse\n" +
          //     "dentist\n" +
          //     "department_store\n" +
          //     "doctor\n" +
          //     "drugstore\n" +
          //     "electrician\n" +
          //     "electronics_store\n" +
          //     "embassy\n" +
          //     "fire_station\n" +
          //     "florist\n" +
          //     "funeral_home\n" +
          //     "furniture_store\n" +
          //     "gas_station\n" +
          //     "gym\n" +
          //     "hair_care\n" +
          //     "hardware_store\n" +
          //     "hindu_temple\n" +
          //     "home_goods_store\n" +
          //     "hospital\n" +
          //     "insurance_agency\n" +
          //     "jewelry_store\n" +
          //     "laundry\n" +
          //     "lawyer\n" +
          //     "library\n" +
          //     "light_rail_station\n" +
          //     "liquor_store\n" +
          //     "local_government_office\n" +
          //     "locksmith\n" +
          //     "lodging\n" +
          //     "meal_delivery\n" +
          //     "meal_takeaway\n" +
          //     "mosque\n" +
          //     "movie_rental\n" +
          //     "movie_theater\n" +
          //     "moving_company\n" +
          //     "museum\n" +
          //     "night_club\n" +
          //     "painter\n" +
          //     "park\n" +
          //     "parking\n" +
          //     "pet_store\n" +
          //     "pharmacy\n" +
          //     "physiotherapist\n" +
          //     "plumber\n" +
          //     "police\n" +
          //     "post_office\n" +
          //     "primary_school\n" +
          //     "real_estate_agency\n" +
          //     "restaurant\n" +
          //     "roofing_contractor\n" +
          //     "rv_park\n" +
          //     "school\n" +
          //     "secondary_school\n" +
          //     "shoe_store\n" +
          //     "shopping_mall\n" +
          //     "spa\n" +
          //     "stadium\n" +
          //     "storage\n" +
          //     "store\n" +
          //     "subway_station\n" +
          //     "supermarket\n" +
          //     "synagogue\n" +
          //     "taxi_stand\n" +
          //     "tourist_attraction\n" +
          //     "train_station\n" +
          //     "transit_station\n" +
          //     "travel_agency\n" +
          //     "university\n" +
          //     "veterinary_care\n" +
          //     "zoo"
          // }
        ],
        tools: tools,
        tool_choice: "auto"
      });
      // console.log(openAiResponse)
      return openAiResponse
      // res.status(200).json(openAiResponse);
    } catch(e){
      console.log(e)
      res.status(500).json({error: 'Error processing your request'});
    }
  }

  async textRequest(ctx: AppContext, content: textRequestBody) {
    const {res} = ctx;
    console.log("hello world!!!")
    let systemContent = `You are a assistant to a Blind or Low Vision person, be quick and to the point answering what the user asks.
                                Additional information is provided here. Use it only if needed. `
    let nearbyPlaces = '';
    const userContent: [ChatCompletionContentPartText | ChatCompletionContentPartImage] = [
      {type: 'text', text: content.text}
    ]
    if(content.image){
      userContent.push({
        type: 'image_url', image_url: {
          url: content.image,
          detail: 'low',
        },
      })
    }
    console.log(userContent)
    if (content.coords) {
      const geocodedCoords = await geocodeCoordinates(content.coords.latitude, content.coords.longitude)
      systemContent += `Current Address: ${geocodedCoords[0].formatted_address} `;

      if (content.coords.heading !== undefined) {
        systemContent += `, Heading: ${content.coords.heading}`;
      }

      if (content.coords.orientation) {
        systemContent += `, Orientation - Alpha: ${content.coords.orientation.alpha}, Beta: ${content.coords.orientation.beta}, Gamma: ${content.coords.orientation.gamma}`;
      }

      try {
        const places = await this.parseUserRequest(ctx, content.text, content.coords.latitude, content.coords.longitude)
        console.log(places)
        if(places && places.choices.length > 0 && places.choices[0].message.tool_calls!.length > 0) {
          const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments)
          const {link} = parsedArgs;
          console.log(link + `&key=${process.env.GOOGLE_API_KEY}`)
          if(link){
            const places:any =  await axios.get(link + `&key=${process.env.GOOGLE_API_KEY}`);
            console.log(places.data.results)
            nearbyPlaces = places.data.results.map((place: { name: string }) => place.name).join(', ');
            console.log(nearbyPlaces)
            systemContent += ` Nearby Places: ${nearbyPlaces}`;
          }
        }
        // const places = await fetchNearbyPlaces(content.coords.latitude, content.coords.longitude);
        // nearbyPlaces = places.map((place: { name: string }) => place.name).join(', ');
        // systemContent += ` Nearby Places: ${nearbyPlaces}`;
      } catch (error) {
        console.error('Error including nearby places in OpenAI request:', error);
      }
    }
    // console.log(systemContent)
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [{
          role: 'user', content: userContent,
        },
          {role: 'system', content: systemContent}],
        model: 'gpt-4o-mini-2024-07-18',
      });
      // console.log('OpenAI API response:', chatCompletion);
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