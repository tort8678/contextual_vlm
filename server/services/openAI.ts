import {AppContext} from "../types";
import axios from "axios";
import OpenAI from "openai";
import {textRequestBody} from "../types";
import dotenv from "dotenv";
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
      name: "generateGoogleAPILinkNonSpecificLocation",
      description: "Generates a Google Nearby Places API link based on user location. Use when user wants to find areas based on type, not specific name. Also use if user asks about where they are so you can geolocate them better. Format: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=${type}",
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
  {
    type: "function" as "function",
    function: {
      name: "generateGooglePlacesApiLinkSpecificLocation",
      description: "Generates a Google Place From Text API link based on user location. Use when a user names a specific place. If there are spaces in user request, replace with {%20}" +
        "Link Format: https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address%2Cname&inputtype=textquery&input={USER_REQUEST}",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Places From Text API link."
          }
        },
        required: ["link"]
      }
    }
  },
  {
    type: "function" as "function",
    function: {
      name: "generateGoogleDirectionAPILink",
      description: "Generates a Google Directions API link based on user location. Use when a user names a specific place. If there are spaces in user request, replace with {%20}" +
        "Link Format: https://maps.googleapis.com/maps/api/directions/json?destination={USER_REQUEST}&mode=walking&origin={LAT,LNG}",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Directions API link."
          }
        },
        required: ["link"]
      }
    }
  },
  {
    type: "function" as "function",
    function: {
      name: "generateGoogleDistanceMatrixAPILink",
      description: "Generates a Google Distance Matrix API link based on user location. Use when a user asks to know how far they are from a specific location."
        + "If there are spaces in user request, replace with {%20}" +
        "Link Format: https://maps.googleapis.com/maps/api/distancematrix/json?departure_time=now&destinations={USER_REQUEST}&origins={LAT,LNG}&mode=walking",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Directions API link."
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

  async parseUserRequest(ctx: AppContext, text: string, lat: number, lng: number) {
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
        ],
        tools: tools,
        tool_choice: "auto"
      });
      // console.log(openAiResponse)
      return openAiResponse
      // res.status(200).json(openAiResponse);
    } catch (e) {
      console.log(e)
      res.status(500).json({error: 'Error processing your request'});
    }
  }

  async textRequest(ctx: AppContext, content: textRequestBody) {
    const {res} = ctx;
    // console.log("hello world!!!")
    let systemContent = `You are a assistant to a Blind or Low Vision person, be quick and to the point answering what the user asks.
                                Additional geolocation data is here to orient your systems. Try your best to give a coherent response using a synthesis of image data and location data.
                                If provided data is lacking to give a sufficient answer, respond with "I do not have enough data".
                                Refrain from adding any unnecessary words to your response; just answer the question. If giving directions, list them out. If an image is attached, always try to
                                utilize its content in your response if it is relevant. Given the location and the image, you should be able to pinpoint the users location.
                                If a user requests transportation, prioritize identifying the nearest train stations or relevant transport services.`
                
    systemContent += ` Always strive to give consistent answers for the same questions, unless the user asks for a different answer, particularly regarding transport services.`;
    let nearbyPlaces = '';
    const userContent: [ChatCompletionContentPartText | ChatCompletionContentPartImage] = [
      {type: 'text', text: content.text}
    ]
    if (content.image) {
      userContent.push({
        type: 'image_url', image_url: {
          url: content.image,
          detail: 'low',
        },
      })
    }
    // console.log(userContent)
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
        console.log(places!.choices[0].message)
        //determine if chat gpt is returning an api link
        if (places && places.choices.length > 0 && places.choices[0].message.tool_calls && places.choices[0].message.tool_calls!.length > 0) {
          console.log(places.choices[0].message.tool_calls![0].function)
          const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments)
          //get link
          const {link} = parsedArgs;
          console.log(link + `&key=${process.env.GOOGLE_API_KEY}`)
          if (link !== undefined) {
            //use link
            const places: any = await axios.get(link + `&key=${process.env.GOOGLE_API_KEY}`);
            //if its giving back a nearby places link
            if (places.data.results) {
              // console.log(places.data.results)
              nearbyPlaces = places.data.results.map((place: { name: string }) => place.name).join(', ');
              console.log(nearbyPlaces)
              systemContent += ` Nearby Places: ${nearbyPlaces}`;
            }
            //if its giving back a specific place link
            else if (places.data.candidates) {
              console.log(places.data.candidates[0])
              const placeInfo = `name: ${places.data.candidates[0].name}, address: ${places.data.candidates[0].formatted_address}`
              console.log(placeInfo)
              systemContent += `Relevant Place Information: ${placeInfo}`
            }
            //if its giving back directions link
            else if (places.data.routes) {
              console.log(places.data.routes[0].legs[0])
              let directions = "Directions:\n"
              for (let i = 0; i < places.data.routes[0].legs[0].steps.length; i++) {
                directions += `Step ${i + 1}) ${places.data.routes[0].legs[0].steps[i].html_instructions} \n`
              }
              systemContent += directions
              console.log(systemContent)
            }
            //if its giving back distance matrix link
            else if(places.data.rows){
              systemContent += `Distance in miles: ${places.data.rows[0].elements[0].distance.value * 0.00062137}, How long it will take to walk: ${places.data.rows[0].elements[0].duration.text}`
              console.log(systemContent)
            }
          }
        }
        // const places = await fetchNearbyPlaces(content.coords.latitude, content.coords.longitude);
        // nearbyPlaces = places.map((place: { name: string }) => place.name).join(', ');
        // systemContent += ` Nearby Places: ${nearbyPlaces}`;
      } catch (error) {
        console.error('Error including api information in OpenAI request:', error);
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