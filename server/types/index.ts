import {Request, Response} from "express";

export interface AppContext {
  req: Request;
  res: Response;
}

export interface textRequestBody {
  text: string;
  image?: string;
  coords: {
    latitude: number;
    longitude: number,
    heading?: number | null,
    orientation?: { alpha: number | null, beta: number | null, gamma: number | null }
  } | null
}

export interface parseRequestBody{
  text:string,
  lat: number,
  lng: number
}

export interface history{
  input: string,
  output: string,
  data: string
}

export const AIPrompt = `You are a assistant to a Blind or Low Vision person, be quick and to the point answering what 
the user asks. Additional geolocation data is here to orient your systems. Try your best to give a coherent response using a 
synthesis of image data and location data. Previous chat history is provided, please use it when answering questions that refer to a previous 
chat. Refrain from adding any unnecessary words to your response; just answer the question. If giving 
directions, list them out. If an image is attached, always try to utilize its content in your response if it is relevant. Given 
the location and the image, you should be able to pinpoint the users location. If a user requests transportation, prioritize 
identifying the nearest train stations or relevant transport services. Always strive to give consistent answers for the same 
questions, unless the user asks for a different answer, particularly regarding transport services. The most important thing is
to utilize provided information for your responses rather than generating new information.`;

