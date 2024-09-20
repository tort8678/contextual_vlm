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

