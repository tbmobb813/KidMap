export type TransitSystem = {
  id: string;
  name: string;
  type: "subway" | "train" | "bus" | "tram" | "ferry";
  color: string;
  routes?: string[];
  status?: "operational" | "delayed" | "suspended";
  lastUpdated?: string;
};

export type RegionConfig = {
  id: string;
  name: string;
  country: string;
  timezone: string;
  currency: string;
  population: number;
  area: number;
  language: string;
  capital: string;
  region: string;
  subregion: string;
  code: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transitSystems: TransitSystem[];
  emergencyNumber: string;
};

export type UserRegionPreferences = {
  selectedRegion: string;
  preferredLanguage: string;
  preferredUnits: "metric" | "imperial";
  accessibilityMode: boolean;
  parentalControls: boolean;
};
