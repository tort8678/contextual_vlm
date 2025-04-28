
interface CustomCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  orientation?: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  } | null;
}

export interface RequestData {
  text: string;
  image: string | null | (string | null)[];
  coords: CustomCoords | null;
}
