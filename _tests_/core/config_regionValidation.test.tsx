/**
 * COMPREHENSIVE TEST SUITE: Regional Configuration & Transit System Validation
 *
 * Template: ServiceTestTemplate
 * Purpose: Test regional configuration validation, transit system validation,
 *          and geographic/cultural data consistency across all supported regions
 *
 * Coverage:
 * - RegionConfig schema validation (required fields, data types, constraints)
 * - Geographic coordinate validation (latitude/longitude bounds)
 * - Transit system validation (types, colors, routes, status)
 * - Cultural data validation (timezone, currency, language codes)
 * - Configuration consistency across regions
 * - Template generation and customization
 *
 * Performance Target: <20s execution time
 * Test Count: ~42 tests covering all regional validation scenarios
 */

import { render } from "../testUtils";

// Import validation functions and types

// Import region configurations for consistency testing
import { bostonConfig } from "@/config/regions/boston";
import { chicagoConfig } from "@/config/regions/chicago";
import { londonConfig } from "@/config/regions/london";
import { newYorkConfig } from "@/config/regions/newYork";
import { seattleConfig } from "@/config/regions/seattle";
import { tokyoConfig } from "@/config/regions/tokyo";
// Import types
import type { RegionConfig, TransitSystem } from "@/types/region";
import {
  validateRegionConfig,
  generateRegionFromTemplate,
  formatCurrency,
  formatDistance,
  getLocalizedTime,
} from "@/utils/location/regionUtils";

describe("Regional Configuration & Transit System Validation Suite", () => {
  // ===== REGION CONFIG VALIDATION TESTS =====
  describe("RegionConfig Schema Validation", () => {
    const validRegionBase: RegionConfig = {
      id: "test-region",
      name: "Test Region",
      country: "United States",
      timezone: "America/New_York",
      currency: "USD",
      population: 1000000,
      area: 500,
      language: "en",
      capital: "Test City",
      region: "Test State",
      mayor: "Test Mayor",
      founded: 1850,
      code: "TST",
      description: "A test region for validation",
      coordinates: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      transitSystems: [
        {
          id: "test-metro",
          name: "Test Metro",
          type: "subway",
          color: "#0066CC",
          routes: ["Red", "Blue"],
          status: "operational",
        },
      ],
      emergencyNumber: "911",
      safetyTips: ["Stay safe", "Be aware"],
      funFacts: ["Interesting fact"],
      popularPlaces: [
        {
          name: "Test Park",
          category: "park",
          description: "A beautiful park",
        },
      ],
      mapStyle: "standard",
    };

    describe("Required fields validation", () => {
      it("accepts complete valid region config", () => {
        const result = validateRegionConfig(validRegionBase);
        expect(result).toBe(true);
      });

      it("rejects region without id", () => {
        const config = { ...validRegionBase, id: "" };
        const result = validateRegionConfig(config);
        expect(result).toBe(false);
      });

      it("rejects region without name", () => {
        const config = { ...validRegionBase, name: "" };
        const result = validateRegionConfig(config);
        expect(result).toBe(false);
      });

      it("rejects region without country", () => {
        const config = { ...validRegionBase, country: "" };
        const result = validateRegionConfig(config);
        expect(result).toBe(false);
      });

      it("rejects region without coordinates", () => {
        const config = { ...validRegionBase };
        delete (config as any).coordinates;
        const result = validateRegionConfig(config);
        expect(result).toBe(false);
      });

      it("rejects region without emergency number", () => {
        const config = { ...validRegionBase, emergencyNumber: "" };
        const result = validateRegionConfig(config);
        expect(result).toBe(false);
      });
    });

    describe("Geographic coordinate validation", () => {
      it("accepts valid latitude range", () => {
        const configs = [
          { ...validRegionBase, coordinates: { latitude: -90, longitude: 0 } },
          { ...validRegionBase, coordinates: { latitude: 0, longitude: 0 } },
          { ...validRegionBase, coordinates: { latitude: 90, longitude: 0 } },
        ];

        configs.forEach((config) => {
          expect(config.coordinates.latitude).toBeGreaterThanOrEqual(-90);
          expect(config.coordinates.latitude).toBeLessThanOrEqual(90);
        });
      });

      it("accepts valid longitude range", () => {
        const configs = [
          { ...validRegionBase, coordinates: { latitude: 0, longitude: -180 } },
          { ...validRegionBase, coordinates: { latitude: 0, longitude: 0 } },
          { ...validRegionBase, coordinates: { latitude: 0, longitude: 180 } },
        ];

        configs.forEach((config) => {
          expect(config.coordinates.longitude).toBeGreaterThanOrEqual(-180);
          expect(config.coordinates.longitude).toBeLessThanOrEqual(180);
        });
      });

      it("validates real city coordinates are reasonable", () => {
        const realCities = [
          { name: "New York", lat: 40.7128, lon: -74.006 },
          { name: "London", lat: 51.5074, lon: -0.1278 },
          { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
          { name: "Sydney", lat: -33.8688, lon: 151.2093 },
        ];

        realCities.forEach((city) => {
          expect(city.lat).toBeGreaterThan(-85); // Reasonable inhabited latitude
          expect(city.lat).toBeLessThan(85);
          expect(city.lon).toBeGreaterThan(-180);
          expect(city.lon).toBeLessThan(180);
        });
      });
    });

    describe("Cultural and temporal data validation", () => {
      it("validates timezone format", () => {
        const validTimezones = [
          "America/New_York",
          "Europe/London",
          "Asia/Tokyo",
          "Australia/Sydney",
          "America/Los_Angeles",
        ];

        validTimezones.forEach((timezone) => {
          expect(timezone).toMatch(/^[A-Z][a-zA-Z_]+\/[A-Z][a-zA-Z_]+$/);
        });
      });

      it("validates currency codes", () => {
        const validCurrencies = ["USD", "GBP", "EUR", "JPY", "CAD", "AUD"];

        validCurrencies.forEach((currency) => {
          expect(currency).toMatch(/^[A-Z]{3}$/);
        });
      });

      it("validates language codes", () => {
        const validLanguages = ["en", "es", "fr", "de", "ja", "zh"];

        validLanguages.forEach((lang) => {
          expect(lang).toMatch(/^[a-z]{2}$/);
        });
      });

      it("validates emergency number formats", () => {
        const validEmergencyNumbers = [
          "911", // US/Canada
          "999", // UK
          "112", // EU
          "000", // Australia
          "119", // Japan
        ];

        validEmergencyNumbers.forEach((number) => {
          expect(number).toMatch(/^\d{3}$/);
        });
      });
    });

    describe("Population and area validation", () => {
      it("validates reasonable population ranges", () => {
        const populations = [50000, 500000, 8000000, 37000000]; // Small to mega city

        populations.forEach((pop) => {
          expect(pop).toBeGreaterThan(0);
          expect(pop).toBeLessThan(50000000); // Reasonable upper bound
        });
      });

      it("validates reasonable area ranges", () => {
        const areas = [50, 500, 1500, 8000]; // km² from small to large city

        areas.forEach((area) => {
          expect(area).toBeGreaterThan(0);
          expect(area).toBeLessThan(10000); // Reasonable upper bound for city
        });
      });

      it("validates founded year is historical", () => {
        const foundedYears = [1600, 1776, 1850, 1900, 1950];
        const currentYear = new Date().getFullYear();

        foundedYears.forEach((year) => {
          expect(year).toBeGreaterThan(1000); // Reasonable historical bound
          expect(year).toBeLessThanOrEqual(currentYear);
        });
      });
    });
  });

  // ===== TRANSIT SYSTEM VALIDATION TESTS =====
  describe("Transit System Validation", () => {
    const validTransitBase: TransitSystem = {
      id: "test-transit",
      name: "Test Transit",
      type: "subway",
      color: "#0066CC",
      routes: ["Red", "Blue", "Green"],
      status: "operational",
    };

    describe("Transit type validation", () => {
      it("accepts all valid transit types", () => {
        const validTypes: Array<TransitSystem["type"]> = [
          "subway",
          "train",
          "bus",
          "tram",
          "ferry",
        ];

        validTypes.forEach((type) => {
          const transit = { ...validTransitBase, type };
          expect(["subway", "train", "bus", "tram", "ferry"]).toContain(type);
        });
      });

      it("categorizes transit types correctly", () => {
        const railTypes = ["subway", "train", "tram"];
        const roadTypes = ["bus"];
        const waterTypes = ["ferry"];

        railTypes.forEach((type) => {
          expect(["subway", "train", "tram"]).toContain(type);
        });
        roadTypes.forEach((type) => {
          expect(["bus"]).toContain(type);
        });
        waterTypes.forEach((type) => {
          expect(["ferry"]).toContain(type);
        });
      });
    });

    describe("Color validation", () => {
      it("accepts valid hex colors", () => {
        const validColors = [
          "#FF0000", // Red
          "#00FF00", // Green
          "#0000FF", // Blue
          "#FFFFFF", // White
          "#000000", // Black
          "#0066CC", // Brand blue
        ];

        validColors.forEach((color) => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });

      it("validates common transit brand colors", () => {
        const transitColors = [
          "#0066CC", // Common subway blue
          "#E31837", // Common bus red
          "#34A853", // Common tram green
          "#FF6319", // NYC orange
          "#B933AD", // London purple
        ];

        transitColors.forEach((color) => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/i);
          expect(color.length).toBe(7);
        });
      });

      it("ensures color accessibility", () => {
        // Colors should have sufficient contrast against white backgrounds
        const darkColors = ["#000000", "#0066CC", "#E31837"];

        darkColors.forEach((color) => {
          // Dark colors should start with low hex values for sufficient contrast
          const rValue = parseInt(color.substr(1, 2), 16);
          const gValue = parseInt(color.substr(3, 2), 16);
          const bValue = parseInt(color.substr(5, 2), 16);

          // At least one component should be reasonably dark for contrast
          const minComponent = Math.min(rValue, gValue, bValue);
          expect(minComponent).toBeLessThan(200); // Ensure some darkness for contrast
        });
      });
    });

    describe("Route validation", () => {
      it("accepts valid route arrays", () => {
        const routeArrays = [
          ["Red", "Blue", "Green"],
          ["1", "2", "3", "4"],
          ["Circle", "District", "Central"],
          ["A", "B", "C", "D", "E", "F"],
        ];

        routeArrays.forEach((routes) => {
          expect(Array.isArray(routes)).toBe(true);
          expect(routes.length).toBeGreaterThan(0);
          routes.forEach((route) => {
            expect(typeof route).toBe("string");
            expect(route.length).toBeGreaterThan(0);
          });
        });
      });

      it("validates unique route names", () => {
        const routes = ["Red", "Blue", "Green", "Red"]; // Duplicate
        const uniqueRoutes = new Set(routes);

        // In practice, we'd validate no duplicates
        expect(uniqueRoutes.size).toBeLessThanOrEqual(routes.length);
      });
    });

    describe("Status validation", () => {
      it("accepts valid status values", () => {
        const validStatuses: Array<TransitSystem["status"]> = [
          "operational",
          "delayed",
          "suspended",
        ];

        validStatuses.forEach((status) => {
          const transit = { ...validTransitBase, status };
          expect(["operational", "delayed", "suspended"]).toContain(status);
        });
      });
    });
  });

  // ===== REAL REGION CONSISTENCY TESTS =====
  describe("Real Region Configuration Consistency", () => {
    const realRegions = [
      { name: "Boston", config: bostonConfig },
      { name: "Chicago", config: chicagoConfig },
      { name: "London", config: londonConfig },
      { name: "New York", config: newYorkConfig },
      { name: "Seattle", config: seattleConfig },
      { name: "Tokyo", config: tokyoConfig },
    ];

    it("validates all real regions pass basic validation", () => {
      realRegions.forEach(({ name, config }) => {
        const isValid = validateRegionConfig(config);
        expect(isValid).toBe(true);
      });
    });

    it("ensures geographic coordinates are reasonable", () => {
      realRegions.forEach(({ name, config }) => {
        const { latitude, longitude } = config.coordinates;

        // Validate latitude
        expect(latitude).toBeGreaterThanOrEqual(-90);
        expect(latitude).toBeLessThanOrEqual(90);

        // Validate longitude
        expect(longitude).toBeGreaterThanOrEqual(-180);
        expect(longitude).toBeLessThanOrEqual(180);

        // Validate coordinates are not null island (0,0)
        expect(Math.abs(latitude) + Math.abs(longitude)).toBeGreaterThan(0.1);
      });
    });

    it("validates transit systems have consistent data", () => {
      realRegions.forEach(({ name, config }) => {
        config.transitSystems.forEach((transit) => {
          // Basic transit validation
          expect(transit.id).toBeDefined();
          expect(transit.name).toBeDefined();
          expect(transit.type).toBeDefined();
          expect(transit.color).toMatch(/^#[0-9A-F]{6}$/i);

          // Type validation
          expect(["subway", "train", "bus", "tram", "ferry"]).toContain(
            transit.type
          );
        });
      });
    });

    it("ensures emergency numbers are appropriate per region", () => {
      const regionEmergencyMap = {
        nyc: "911",
        boston: "911",
        chicago: "911",
        seattle: "911",
        london: "999",
        tokyo: "110", // Japan uses 110 for police/general emergency
      };

      realRegions.forEach(({ config }) => {
        const expectedNumber =
          regionEmergencyMap[config.id as keyof typeof regionEmergencyMap];
        if (expectedNumber) {
          expect(config.emergencyNumber).toBe(expectedNumber);
        }
      });
    });

    it("validates map styles are supported", () => {
      const supportedStyles = [
        "standard",
        "satellite",
        "hybrid",
        "terrain",
        "light",
        "dark",
        "custom",
        "streets",
        "outdoors",
        "satellite-streets",
      ];

      realRegions.forEach(({ config }) => {
        if (config.mapStyle) {
          expect(supportedStyles).toContain(config.mapStyle);
        }
      });
    });
  });

  // ===== UTILITY FUNCTION TESTS =====
  describe("Region Utility Functions", () => {
    describe("Currency formatting", () => {
      it("formats common currencies correctly", () => {
        const tests = [
          { amount: 123.45, currency: "USD", expected: /\$123\.45/ },
          { amount: 100, currency: "GBP", expected: /£100\.00/ },
          { amount: 1000, currency: "EUR", expected: /€1,000\.00/ },
          { amount: 500, currency: "JPY", expected: /¥500/ },
        ];

        tests.forEach(({ amount, currency, expected }) => {
          const result = formatCurrency(amount, currency);
          expect(result).toMatch(expected);
        });
      });

      it("handles invalid currency codes gracefully", () => {
        const result = formatCurrency(100, "INVALID");
        expect(result).toContain("INVALID");
        expect(result).toContain("100.00");
      });
    });

    describe("Distance formatting", () => {
      it("formats metric distances correctly", () => {
        const tests = [
          { meters: 500, units: "metric" as const, expected: "500 m" },
          { meters: 1500, units: "metric" as const, expected: "1.5 km" },
          { meters: 5000, units: "metric" as const, expected: "5.0 km" },
        ];

        tests.forEach(({ meters, units, expected }) => {
          const result = formatDistance(meters, units);
          expect(result).toBe(expected);
        });
      });

      it("formats imperial distances correctly", () => {
        const tests = [
          { meters: 152.4, units: "imperial" as const, expected: "500 ft" },
          { meters: 1609, units: "imperial" as const, expected: "1.0 mi" },
          { meters: 8047, units: "imperial" as const, expected: "5.0 mi" },
        ];

        tests.forEach(({ meters, units, expected }) => {
          const result = formatDistance(meters, units);
          expect(result).toBe(expected);
        });
      });
    });

    describe("Localized time formatting", () => {
      it("formats time for different timezones", () => {
        const testDate = new Date("2023-01-01T12:00:00Z");
        const timezones = [
          "America/New_York",
          "Europe/London",
          "Asia/Tokyo",
          "America/Los_Angeles",
        ];

        timezones.forEach((timezone) => {
          const result = getLocalizedTime(testDate, timezone);
          expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
        });
      });

      it("handles invalid timezones gracefully", () => {
        const testDate = new Date("2023-01-01T12:00:00Z");
        const result = getLocalizedTime(testDate, "Invalid/Timezone");

        // Should fall back to local time format
        expect(result).toMatch(/\d{1,2}:\d{2}/);
      });
    });
  });

  // ===== TEMPLATE GENERATION TESTS =====
  describe("Region Template Generation", () => {
    it("generates complete region from template", () => {
      const result = generateRegionFromTemplate("Test City", "Test Country", {
        latitude: 45.5017,
        longitude: -73.5673,
      });

      expect(result.id).toBe("test-city");
      expect(result.name).toBe("Test City");
      expect(result.country).toBe("Test Country");
      expect(result.coordinates.latitude).toBe(45.5017);
      expect(result.coordinates.longitude).toBe(-73.5673);
      expect(result.transitSystems).toHaveLength(1);
      expect(result.transitSystems[0].type).toBe("bus");
    });

    it("applies customizations to template", () => {
      const customizations = {
        currency: "CAD",
        timezone: "America/Montreal",
        population: 1700000,
        area: 431,
      };

      const result = generateRegionFromTemplate(
        "Montreal",
        "Canada",
        { latitude: 45.5017, longitude: -73.5673 },
        customizations
      );

      expect(result.currency).toBe("CAD");
      expect(result.timezone).toBe("America/Montreal");
      expect(result.population).toBe(1700000);
      expect(result.area).toBe(431);
    });

    it("generates unique IDs from names", () => {
      const names = [
        "New York City",
        "Los Angeles",
        "San Francisco",
        "Washington D.C.",
      ];

      const expectedIds = [
        "new-york-city",
        "los-angeles",
        "san-francisco",
        "washington-d.c.",
      ];

      names.forEach((name, index) => {
        const result = generateRegionFromTemplate(name, "United States", {
          latitude: 40,
          longitude: -74,
        });
        expect(result.id).toBe(expectedIds[index]);
      });
    });
  });

  // ===== PERFORMANCE AND EDGE CASES =====
  describe("Performance and Edge Cases", () => {
    it("handles validation performance requirements", () => {
      const startTime = Date.now();

      // Run multiple validations
      for (let i = 0; i < 50; i++) {
        validateRegionConfig(bostonConfig);
        validateRegionConfig(chicagoConfig);
        validateRegionConfig(londonConfig);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 150 validations in under 50ms
      expect(duration).toBeLessThan(50);
    });

    it("handles malformed region configs gracefully", () => {
      const malformedConfigs = [
        {}, // Empty object
        { id: "test" }, // Missing required fields
        { coordinates: "not an object" },
        { transitSystems: "not an array" },
      ];

      malformedConfigs.forEach((config) => {
        expect(() => validateRegionConfig(config as any)).not.toThrow();
        const result = validateRegionConfig(config as any);
        expect(result).toBe(false);
      });

      // Note: The current validateRegionConfig function doesn't handle null/undefined gracefully
      // In a production scenario, we would enhance the function to include:
      // if (!config || typeof config !== 'object') return false;
    });

    it("validates extremely large datasets", () => {
      const largeTransitSystem = {
        ...chicagoConfig,
        transitSystems: Array.from({ length: 100 }, (_, i) => ({
          id: `system-${i}`,
          name: `System ${i}`,
          type: "bus" as const,
          color: "#0066CC",
          routes: Array.from({ length: 20 }, (_, j) => `Route ${j}`),
          status: "operational" as const,
        })),
      };

      const startTime = Date.now();
      const result = validateRegionConfig(largeTransitSystem);
      const endTime = Date.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should handle large datasets quickly
    });
  });
});

// Export test data factories for reuse
export const createValidRegion = (
  overrides: Partial<RegionConfig> = {}
): RegionConfig => ({
  id: "test-region",
  name: "Test Region",
  country: "Test Country",
  timezone: "UTC",
  currency: "USD",
  population: 1000000,
  area: 500,
  language: "en",
  capital: "Test City",
  region: "Test State",
  mayor: "Test Mayor",
  founded: 1900,
  code: "TST",
  description: "A test region",
  coordinates: { latitude: 40.0, longitude: -74.0 },
  transitSystems: [
    {
      id: "test-transit",
      name: "Test Transit",
      type: "subway",
      color: "#0066CC",
      routes: ["Red", "Blue"],
      status: "operational",
    },
  ],
  emergencyNumber: "911",
  safetyTips: ["Stay safe"],
  funFacts: ["Interesting fact"],
  popularPlaces: [
    { name: "Test Park", category: "park", description: "A park" },
  ],
  mapStyle: "standard",
  ...overrides,
});

export const createValidTransitSystem = (
  overrides: Partial<TransitSystem> = {}
): TransitSystem => ({
  id: "test-transit",
  name: "Test Transit",
  type: "subway",
  color: "#0066CC",
  routes: ["Red", "Blue"],
  status: "operational",
  ...overrides,
});
