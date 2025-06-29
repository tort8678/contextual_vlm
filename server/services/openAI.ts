import axios from "axios";
import OpenAI from "openai";
import {textRequestBody, history, AIPrompt, AppContext} from "../types";
import dotenv from "dotenv";
import {ChatCompletionContentPartImage, ChatCompletionContentPartText} from "openai/resources";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";
import { getPanoramaData } from "./doorfront";

dotenv.config();

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

async function getTrainInfo(url:string){
  try {
    const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace"
    //   , {
    //   headers: {
    //     "x-api-key": "<redacted>",
    //     // replace with your GTFS-realtime source's auth token
    //     // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
    //   },
    // }
  );
    if (!response.ok) {
      const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
      throw error;
      process.exit(1);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    //console.log(feed.entity[0].tripUpdate)
    feed.entity.forEach((entity) => {
      // console.log(entity);  
      // if (entity.vehicle?.stopId) {
      //   console.log(entity.vehicle.stopId);
      // }
      // if(entity.tripUpdate?.trip) {
      //   // console.log(entity.tripUpdate.trip);
      //   if(entity.tripUpdate.trip.routeId === "A") {
      //     console.log(entity.tripUpdate.trip.routeId);
      //   }
      // }
    });
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const tools = [
  {
    type: "function" as "function",
    function: {
      name: "generateGoogleAPILinkNonSpecificLocation",
      description: "Generates a Google Nearby Places API link based on user location. Use when user wants to find areas based on type, not specific name. Also use if user asks about where they are so you can geolocate them better." +
      "Type only returns esthablishments that match(i.e. supermarket, library, restaurant, subway_station[use for subway, usually what people want if they say 'train' in New York City], transit_station[use for bus],"+
      +"train_station[use for railroad trains], food, pharmacy), keyword is the relevant search term (i.e. mexican vs japanese food when type is restaurant, pizza,)"+
      "Format: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=${type}&keyword=${keyword}",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Distance Matrix API link."
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
      description: "Generates a Google Place From Text API link using user's current location as a starting point and the user's input as the destination."+
        "Use when a user wants details on a specific location (not when asking about a buildings entrance). If there are spaces in user request, replace with {%20}" +
        "Link Format: https://maps.googleapis.com/maps/api/place/findplacefromtext/json?location=${latitude},${longitude}&fields=formatted_address%2Cname%2Ctype%2Copening_hours%2Crating&inputtype=textquery&input={USER_REQUEST}",
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
      description: "Generates a Google Directions API link based on user location. Use when a user asks for a direction to a location. If there are spaces in user request, replace with {%20}" +
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
        + "If there are spaces in user request, replace with {%20}. USE LAT and LNG over the name of the place is both provided" +
        "Link Format: https://maps.googleapis.com/maps/api/distancematrix/json?departure_time=now&destinations={USER_REQUEST}&origins={LAT,LNG}&mode=walking",
      parameters: {
        type: "object",
        properties: {
          link: {
            type: "string",
            description: "The completed Google Distance Matrix API link."
          }
        },
        required: ["link"]
      }
    }
  },
  {
    type: "function" as "function",
    function: {
      name: "useDoorfrontAPI",
      description: "Fetches panorama data from the Doorfront API based on user location. Use when a user asks where is a locations entrance or wants to know what to expect when they arrive at a location.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The provided address the user is asking about."
          }
        },
        required: ["address"]
      }
    }
  },
  // {
  //   type: "function" as "function",
  //   function: {
  //     name: "generateTrainInformation",
  //     description: "Returns the link to the GTFS API for the MTA subway system. Use when a user asks about train information." +
  //       "Link Format: https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
  //     parameters: {
  //       type: "object",
  //       properties: {
  //         link: {
  //           type: "string",
  //           description: "The completed API link for the MTA subway system, as provided in the description. Include as an argument in the output"
  //         }
  //       },
  //       required: ["link"]
  //     }
  //   }
  // },


]

const openAIHistory: history[] = []

export class OpenAIService {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async parseUserRequest(ctx: AppContext, text: string, lat: number, lng: number) {
    //console.log(openAIHistory[openAIHistory.length - 1].data)
    const {res} = ctx
    //try function?
    try {
      const openAiResponse = await this.client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {role: "user", content: text},
          {
            role: "system",
            content: `decide the appropriate link to return from function options. If none fit the user query, return 'none'. The latitude is ${lat} and the longitude is ${lng}.  If no type is specified, leave this part out: &type=type.
            Use the chat history to find names of locations, types of locations that the user has asked about, the ratings of locations user has asked about, or the latitude and longitude of relevant locations.
            If no tool is appropriate, do not return any link. If the user asks about a location or building, return nearby places by default.`
          },
        ],
        tools: tools,
        tool_choice: "auto"
      });
      console.log(openAIHistory)
      console.log("token usage " + openAiResponse.usage?.total_tokens)
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
    let systemContent = AIPrompt;
    let relevantData = '';
    const userContent: [ChatCompletionContentPartText | ChatCompletionContentPartImage]= [
      {type: 'text', text: content.text}
    ]
    //updated userContent to take array of images instead of a singe string image
    if (Array.isArray(content.image) && content.image.length > 0 && content.image[0] !== null) {
      // console.log(content)
      content.image.forEach(image => {
      userContent.push({
        type: 'image_url', 
        image_url: {
          url: image,
          detail: 'low',
        },
      });
    });
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
          //console.log(places.choices[0].message.tool_calls![0].function)
          const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments)
          //get link
          const {link} = parsedArgs;
          console.log(link + `&key=${process.env.GOOGLE_API_KEY}`)
          if (link !== undefined && places.choices[0].message.tool_calls![0].function.name !== "generateTrainInformation") {
            //use link
            const places: any = await axios.get(link + `&key=${process.env.GOOGLE_API_KEY}`);
            //if its giving back a nearby places link
            if (places.data.results) {
              // console.log(places.data.results)
              relevantData = places.data.results.map((place: { name: string, geometry:{location:{lat:number, lng: number}}, rating:number, vicinity:string }) => `\n{name: ${place.name}, location(lat,lng): ${place.geometry.location.lat},${place.geometry.location.lng}, address: ${place.vicinity}, rating: ${place.rating} stars}`).join(', ') ;
              //console.log(relevantData)
              systemContent += `\nNearby Places in order of nearest distance: ${relevantData}`;
              //console.log(systemContent)
            }
            //if its giving back a specific place link
            else if (places.data.candidates) {
              //console.log(places.data.candidates[0])
              //relevantData = `name: ${places.data.candidates[0].name}, address: ${places.data.candidates[0].formatted_address}`
              //console.log(relevantData)
              systemContent += `Relevant Place Information: ${JSON.stringify(places.data.candidates[0], null, 2)}`
            }
            //if its giving back directions link
            else if (places.data.routes) {
              //console.log(places.data.routes[0].legs[0])
              relevantData = "Directions:\n"
              for (let i = 0; i < places.data.routes[0].legs[0].steps.length; i++) {
                relevantData += `Step ${i + 1}) ${places.data.routes[0].legs[0].steps[i].html_instructions} \n`
              }
              systemContent += relevantData
              //console.log(systemContent)
            }
            //if its giving back distance matrix link
            else if(places.data.rows){
              relevantData = "distance: " + places.data.rows[0].elements[0].distance.value + ", duration: " + places.data.rows[0].elements[0].duration.text
              systemContent += `Distance in miles: ${places.data.rows[0].elements[0].distance.value * 0.00062137}, How long it will take to walk: ${places.data.rows[0].elements[0].duration.text}`
              //console.log(systemContent)
            }
          } else if (places.choices[0].message.tool_calls![0].function.name === "useDoorfrontAPI") {
            //use doorfront api
            const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments)
            //get link
            const {address} = parsedArgs;
            // console.log(address)
            const reqlink= `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?location=${content.coords.latitude},${content.coords.longitude}&fields=formatted_address%2Cname&inputtype=textquery&input=${address.replace(/\s+/g, '%2C')}` + `&key=${process.env.GOOGLE_API_KEY}`;
            console.log(reqlink)
            const location: any = await axios.get(reqlink);
            // console.log(location)
            //console.log(geocodedCoords[0].formatted_address)
            const panoramaData = await getPanoramaData(ctx, location.data.candidates[0].formatted_address);
            if (panoramaData) {
              //console.log(panoramaData.human_labels[0].labels);
              relevantData = `Entrance Information and Features for ${location.data.candidates[0].formatted_address}:`
              relevantData += panoramaData.human_labels[0].labels.map((label: { label: string, subtype: number }) => `\n${label.label} (${label.subtype ? label.subtype : 'exists'})`).join(', ');
              console.log(relevantData);
              systemContent += `\n${relevantData}`;
            } else {
              console.error('No panorama data found for this address.');
              relevantData = 'Data on this address has not been collected yet. Let the user know if they want detailed information on this address, they can visit doorfront.org and request it be added.';
            }
          }
        } else console.log("No tool calls found in OpenAI response");
        // const places = await fetchNearbyPlaces(content.coords.latitude, content.coords.longitude);
        // nearbyPlaces = places.map((place: { name: string }) => place.name).join(', ');
        // systemContent += ` Nearby Places: ${nearbyPlaces}`;
      } catch (error) {
        console.error('Error including api information in OpenAI request:', error);
      }
    }
    // console.log(systemContent)
    // openAI separate text request
    try{
      //  console.log("user prompt: ", userContent)
      //  console.log("system prompt: ", systemContent)
      // console.log("openAI history: ", openAIHistory)
      const combinedSystemMessage = AIPrompt 
        + "\n\n" 
        + systemContent 
        + "\n\nChat history: " 
        + openAIHistory.map(history => `User Input: ${history.input}, Open AI Output: ${history.output}, Data Used: ${history.data}`).join('\n');
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          {role: 'system', content: combinedSystemMessage},
          {role: 'user', content: userContent}
          ],
        model: 'gpt-4.1-mini',
        temperature: 0.0
      });
      console.log('OpenAI API response:', chatCompletion.usage?.total_tokens);
      openAIHistory.push({input: content.text, output: chatCompletion.choices[0].message.content as string, data: relevantData});
      res.status(200).json({output: chatCompletion.choices[0].message.content, history: openAIHistory});
    }
    // try {
    //   // console.log("user prompt: ", userContent)
    //   // console.log("system prompt: ", systemContent)
    //   // console.log("openAI history: ", openAIHistory)
    //   const chatCompletion = await this.client.chat.completions.create({
    //     messages: [
    //       {role: 'user', content: userContent},
    //       {role: 'system', content: systemContent},
    //       {role: 'system', content: "chat history: " 
    //         + openAIHistory.map((history: history) => `\nInput: ${history.input}, Output: ${history.output}, Data: ${history.data}`).join(', ')}
    //       ],
    //     model: 'gpt-4o-audio-preview',
    //     modalities: ["text", "audio"],
    //     audio: { voice: "alloy", format: "mp3" },
    //   });
    //   console.log('OpenAI API response:', chatCompletion);
    //   console.log('OpenAI API response:', chatCompletion.choices[0].message.audio);
    //   openAIHistory.push({input: content.text, output: chatCompletion.choices[0].message.content as string, data: relevantData});
    //   res.status(200).json({output: chatCompletion.choices[0].message.audio?.transcript, history: openAIHistory, audio: chatCompletion.choices[0].message.audio?.data});
    // } 
    catch (e) {
      console.error('Error with OpenAI API request:', e);
      res.status(500).json({error: 'Error processing your request'});
    }
  }
// ----------------------------------------------------------------------------------------------------------------
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