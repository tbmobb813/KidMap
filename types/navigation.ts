export type Place = {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isFavorite?: boolean;
};

export type PlaceCategory = 
  | "home" 
  | "school" 
  | "park" 
  | "library" 
  | "store" 
  | "restaurant" 
  | "friend" 
  | "family" 
  | "other";

export type TransitMode = "subway" | "train" | "bus" | "walk";

export type TransitStep = {
  id: string;
  type: TransitMode;
  name?: string;
  line?: string;
  color?: string;
  from: string;
  to: string;
  duration: number; // in minutes
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
};

export type Route = {
  id: string;
  steps: TransitStep[];
  totalDuration: number;
  departureTime: string;
  arrivalTime: string;
};
