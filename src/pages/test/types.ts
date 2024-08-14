export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
}

export interface RequestData {
  text: string;
  image: string | null;
  coords: GeolocationCoords | null;
}
