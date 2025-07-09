import axios from "axios";
import OpenAI from "openai";
import {textRequestBody, history, AIPrompt, AppContext, openAITools} from "../types";
import dotenv from "dotenv";
import {ChatCompletionContentPartImage, ChatCompletionContentPartText} from "openai/resources";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";
import { getPanoramaData } from "./doorfront";
import { getNearbyFeatures } from "./features";
import { treeInterface, sidewalkMaterialInterface, pedestrianRampInterface } from "../database/models/features";

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

const tools = openAITools

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
      // console.log(openAIHistory)
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
              relevantData = places.data.results.map(
                (place: { name: string, geometry:{location:{lat:number, lng: number}}, rating:number, vicinity:string }) => 
                  `\n{name: ${place.name}, location(lat,lng): ${place.geometry.location.lat},${place.geometry.location.lng}, address: ${place.vicinity}, rating: ${place.rating} stars}`).join(', ') ;
              //console.log(relevantData)
              systemContent += `\nNearby Places in order of nearest distance: ${relevantData}`;
              //console.log(systemContent)
            }
            //if its giving back a specific place link
            else if (places.data.candidates) {
              //console.log(places.data.candidates[0])
              //relevantData = `name: ${places.data.candidates[0].name}, address: ${places.data.candidates[0].formatted_address}`
              //console.log(relevantData)
              let operatingHours = '';
              if(places.data.candidates[0].opening_hours){
                //console.log("user wants operating hours")
                const placeInformation = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${places.data.candidates[0].place_id}&fields=opening_hours&key=${process.env.GOOGLE_API_KEY}`);
                operatingHours = placeInformation.data.result.opening_hours.weekday_text
              }
              systemContent += `Relevant Place Information: ${JSON.stringify(places.data.candidates[0], null, 2)}`
              systemContent += `Operating Hours: ${operatingHours.length > 0 ? operatingHours : 'Not available'}`;
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
          }
          //if its using doorfront api 
          else if (places.choices[0].message.tool_calls![0].function.name === "useDoorfrontAPI") {
            //use doorfront api
            const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments)
            //get link
            const {address} = parsedArgs;
            // console.log(address)
            const reqlink= `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?location=
            ${content.coords.latitude},${content.coords.longitude}&fields=formatted_address%2Cname&inputtype=textquery&input=${address.replace(/\s+/g, '%2C')}` + `&key=${process.env.GOOGLE_API_KEY}`;
            console.log(reqlink)
            const location: any = await axios.get(reqlink);
            // console.log(location)
            // console.log(geocodedCoords[0].formatted_address)
            const panoramaData = await getPanoramaData(ctx, location.data.candidates[0].formatted_address);
            if (panoramaData) {
              //console.log(panoramaData.human_labels[0].labels);
              relevantData = `Entrance Information and Features for ${location.data.candidates[0].formatted_address}:`
              relevantData += panoramaData.human_labels[0].labels.map(
                (label: { label: string, subtype: number, box: {x:number, y: number, width:number, height:number} }) => 
                  `\n${label.label} (${label.subtype ? label.subtype : 'exists'}), Bounding Box: x = ${label.box.x}, y = ${label.box.y}, width: ${label.box.width}, height: ${label.box.height}`
              ).join('; ');
              console.log(relevantData);
              systemContent += `\n${relevantData}`;
            } else {
              console.error('No panorama data found for this address.');
              relevantData = 'Data on this address has not been collected yet. Let the user know if they want detailed information on this address, they can visit doorfront.org and request it be added.';
            }
          }
          else if (places.choices[0].message.tool_calls![0].function.name === "getNearbyFeatures") {
            const parsedArgs = JSON.parse(places.choices[0].message.tool_calls![0].function.arguments);
            if (parsedArgs.address) {
              //console.log(parsedArgs.address);
              
            }
            const features = await getNearbyFeatures(content.coords.latitude, content.coords.longitude, 0.06);
            // console.log(features);
            const trees: treeInterface[] = features.trees;
            const sidewalkMaterials: sidewalkMaterialInterface[] = features.sidewalkMaterials;
            const pedestrianRamps: pedestrianRampInterface[] = features.pedestrianRamps;
            relevantData = `Nearby Features for location (${content.coords.latitude}, ${content.coords.longitude}):\n`;
            relevantData += `Trees: ${trees.length}, Sidewalk Materials: ${sidewalkMaterials.length}, Pedestrian Ramps: ${pedestrianRamps.length}`;
            systemContent += `\n${relevantData}`;
            let staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?&zoom=19&size=640x640&maptype=roadmap`;
            // Add user location marker
            staticMapUrl += `&markers=color:blue%7Clabel:U%7C${content.coords.latitude},${content.coords.longitude}`;
            staticMapUrl += `&markers=color:green%7Clabel:T%7C${trees.map(tree => `${tree.location.coordinates[1]},${tree.location.coordinates[0]}`).join('%7C')}`;
            // staticMapUrl += `&markers=color:yellow%7Clabel:S%7C${sidewalkMaterials.map(material => `${material.location.coordinates[1]},${material.location.coordinates[0]}`).join('%7C')}`;
            // Define colors for each sidewalk material type
            const materialColors: Record<string, string> = {
              tactile: "yellow",
              //concrete: "gray",
              manhole: "black",
              "cellar door": "brown",
              "subway grate": "orange",
              other: "white"
            };

            // Add a marker for each material type
            Object.entries(materialColors).forEach(([material, color]) => {
              const locations = sidewalkMaterials
                .filter(m => m.material.toLowerCase() === material)
                .map(m => `${m.location.coordinates[1]},${m.location.coordinates[0]}`);
              if (locations.length > 0) {
                staticMapUrl += `&markers=color:${color}%7Clabel:S%7C${locations.join('%7C')}`;
              }
            });
            staticMapUrl += `&markers=color:red%7Clabel:R%7C${pedestrianRamps.map(
              ramp => `${ramp.location.coordinates[1]},${ramp.location.coordinates[0]}`).join('%7C')}`;
            // Add the API key to the static map URL
            staticMapUrl += `&key=${process.env.GOOGLE_API_KEY}`;

            console.log(staticMapUrl);
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
      systemContent += `Current Date and Time: ${new Date().toLocaleString()}`;
      const combinedSystemMessage = AIPrompt 
        + "\n\nRelevant data: " 
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