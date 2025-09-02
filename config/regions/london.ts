import { RegionConfig } from "@/types/region";

export const londonConfig: RegionConfig = {
  id: "london",
  name: "London",
  country: "United Kingdom",
  timezone: "Europe/London",
  currency: "GBP",
  language: "en",
  coordinates: {
    latitude: 51.5074,
    longitude: -0.1278,
  },
  transitSystems: [
    {
      id: "tfl-underground",
      name: "London Underground",
      type: "subway",
      color: "#E32017",
      routes: [
        "Bakerloo",
        "Central",
        "Circle",
        "District",
        "Hammersmith & City",
        "Jubilee",
        "Metropolitan",
        "Northern",
        "Piccadilly",
        "Victoria",
        "Waterloo & City",
      ],
    },
    {
      id: "tfl-bus",
      name: "London Buses",
      type: "bus",
      color: "#DC241F",
    },
    {
      id: "tfl-overground",
      name: "London Overground",
      type: "train",
      color: "#EE7C0E",
    },
  ],
  emergencyNumber: "999",
  safetyTips: [
    "Always stay with a trusted adult when using public transport",
    "Keep your Oyster card or contactless payment safe",
    "Mind the gap between the train and platform",
    "Stand on the right side of escalators",
    "Let passengers off before boarding",
  ],
  funFacts: [
    "The London Underground is the world's first underground railway!",
    "The Tube map design is used as a model for transit maps worldwide.",
    "Some Underground stations are over 150 years old.",
    "The deepest station is Hampstead at 58.5 meters below ground.",
    "Hyde Park is one of the largest parks in London with over 4,000 trees!",
  ],
  popularPlaces: [
    {
      name: "Hyde Park",
      category: "park",
      description:
        "Large royal park with Speaker's Corner, Serpentine Lake, and playgrounds",
    },
    {
      name: "Tower Bridge",
      category: "landmark",
      description: "Famous bascule bridge over the River Thames",
    },
    {
      name: "British Museum",
      category: "museum",
      description: "World-famous museum with artifacts from around the globe",
    },
  ],
  transitApiEndpoint: "https://api.tfl.gov.uk/",
  population: 8982000,
  area: 1572,
  capital: "London",
  region: "England",
  mayor: "Sadiq Khan",
  founded: 43,
  code: "LON",
  description:
    "London is the capital and largest city of England and the United Kingdom.",
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
  mapStyle: "standard",
};
