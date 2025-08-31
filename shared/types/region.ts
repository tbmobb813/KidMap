export type TransitSystem = {
  id: string;
  name: string;
  routes: string[];
};

export type RegionConfig = {
  id: string;
  name: string;
  transitSystems: TransitSystem[];
  lastUpdated?: string;
  // Add other region-specific fields as needed
};
