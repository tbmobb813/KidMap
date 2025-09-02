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
  mayor: string;
  founded: number;
  code: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transitSystems: TransitSystem[];
  emergencyNumber: string;
  safetyTips: string[];
  funFacts: string[];
  popularPlaces: {
    name: string;
    category: string;
    description: string;
  }[];
  mapStyleUrl?: string;
  transitApiEndpoint?: string;
  /**
   * Supported map styles:
   * - "standard"
   * - "satellite"
   * - "hybrid"
   * - "terrain"
   * - "light"
   * - "dark"
   * - "custom"
   * - "streets"
   * - "outdoors"
   * - "satellite-streets"
   */
  mapStyle?:
    | "standard"
    | "satellite"
    | "hybrid"
    | "terrain"
    | "light"
    | "dark"
    | "custom"
    | "streets"
    | "outdoors"
    | "satellite-streets";
};

export type UserRegionPreferences = {
  selectedRegion: string;
  preferredLanguage: string;
  preferredUnits: "metric" | "imperial";
  accessibilityMode: boolean;
  parentalControls: boolean;
};
