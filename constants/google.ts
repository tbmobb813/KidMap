import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY =
  Constants.manifest?.extra?.googleMapsApiKey ||
  Constants.manifest?.android?.config?.googleMaps?.apiKey ||
  Constants.manifest?.ios?.config?.googleMapsApiKey;

// Now use GOOGLE_MAPS_API_KEY as needed