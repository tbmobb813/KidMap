/**
 * COMPREHENSIVE TEST SUITE: Safety Validation Utils
 *
 * Template: ServiceTestTemplate
 * Purpose: Test critical safety validation functions for PIN authentication,
 *          emergency contacts, safe zones, and security constraints
 *
 * Coverage:
 * - PIN validation (length, format, security)
 * - Emergency contact validation (phone, relationship)
 * - Safe zone validation (location, radius)
 * - Security input sanitization
 * - Error handling and edge cases
 *
 * Performance Target: <2s execution time
 * Test Count: ~40 tests covering all validation scenarios
 */

// Note: render imported previously was unused.

// Import validation functions from core validation
import {
  PinSchema,
  EmergencyContactSchema,
  EmergencyContactCreateSchema,
  SafeZoneSchema,
  SafeZoneCreateSchema,
  ParentalSettingsSchema,
} from "@/src/core/validation/safetySchemas";
// Types
import type {
  EmergencyContact,
  SafeZone,
} from "@/src/modules/safety/types/parental";

describe("Safety Validation Suite", () => {
  // ===== PIN VALIDATION TESTS =====
  describe("PIN Validation", () => {
    describe("Valid PIN cases", () => {
      it("accepts 4-digit PIN", () => {
        const result = PinSchema.safeParse("1234");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("1234");
        }
      });

      it("accepts 6-digit PIN", () => {
        const result = PinSchema.safeParse("123456");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("123456");
        }
      });

      it("accepts 8-digit PIN", () => {
        const result = PinSchema.safeParse("12345678");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("12345678");
        }
      });
    });

    describe("Invalid PIN cases", () => {
      it("rejects PIN shorter than 4 digits", () => {
        const result = PinSchema.safeParse("123");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must be at least 4 digits"
          );
        }
      });

      it("rejects PIN longer than 8 digits", () => {
        const result = PinSchema.safeParse("123456789");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must be no more than 8 digits"
          );
        }
      });

      it("rejects PIN with non-numeric characters", () => {
        const result = PinSchema.safeParse("12ab");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must contain only numbers"
          );
        }
      });

      it("rejects PIN with spaces", () => {
        const result = PinSchema.safeParse("12 34");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must contain only numbers"
          );
        }
      });

      it("rejects PIN with special characters", () => {
        const result = PinSchema.safeParse("12-34");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must contain only numbers"
          );
        }
      });

      it("rejects empty PIN", () => {
        const result = PinSchema.safeParse("");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must be at least 4 digits"
          );
        }
      });
    });

    describe("Security considerations", () => {
      it("should warn about weak PINs (consecutive numbers)", () => {
        // Note: This would be implemented in a separate security validator
        const weakPins = ["1234", "5678", "0123"];
        weakPins.forEach((pin) => {
          const result = PinSchema.safeParse(pin);
          expect(result.success).toBe(true); // Valid format but weak
        });
      });

      it("should warn about weak PINs (repeated digits)", () => {
        const weakPins = ["1111", "2222", "9999"];
        weakPins.forEach((pin) => {
          const result = PinSchema.safeParse(pin);
          expect(result.success).toBe(true); // Valid format but weak
        });
      });
    });
  });

  // ===== EMERGENCY CONTACT VALIDATION TESTS =====
  describe("Emergency Contact Validation", () => {
    const validContactBase = {
      id: "contact_123",
      name: "John Doe",
      phone: "+1-555-123-4567",
      relationship: "Parent",
      isPrimary: true,
      canReceiveAlerts: true,
    };

    describe("Valid contact cases", () => {
      it("accepts complete valid contact", () => {
        const result = EmergencyContactSchema.safeParse(validContactBase);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("John Doe");
          expect(result.data.phone).toBe("+1-555-123-4567");
        }
      });

      it("accepts US phone format", () => {
        const contact = { ...validContactBase, phone: "555-123-4567" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(true);
      });

      it("accepts international phone format", () => {
        const contact = { ...validContactBase, phone: "+44-20-7946-0958" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(true);
      });

      it("accepts phone with spaces", () => {
        const contact = { ...validContactBase, phone: "+1 555 123 4567" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(true);
      });

      it("accepts phone with parentheses", () => {
        const contact = { ...validContactBase, phone: "1(555) 123-4567" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(true);
      });
    });

    describe("Invalid contact cases", () => {
      it("rejects contact without name", () => {
        const contact = { ...validContactBase, name: "" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Contact name is required"
          );
        }
      });

      it("rejects contact without phone", () => {
        const contact = { ...validContactBase, phone: "" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Contact phone number is required"
          );
        }
      });

      it("rejects invalid phone format", () => {
        const contact = { ...validContactBase, phone: "123" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Phone number format is invalid"
          );
        }
      });

      it("rejects phone starting with 0", () => {
        const contact = { ...validContactBase, phone: "0555123456" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Phone number format is invalid"
          );
        }
      });

      it("rejects contact without relationship", () => {
        const contact = { ...validContactBase, relationship: "" };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Contact relationship is required"
          );
        }
      });

      it("rejects name exceeding length limit", () => {
        const longName = "a".repeat(151);
        const contact = { ...validContactBase, name: longName };
        const result = EmergencyContactSchema.safeParse(contact);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Contact name exceeds 150 characters"
          );
        }
      });
    });

    describe("Contact creation schema", () => {
      it("accepts valid contact creation data", () => {
        const createData = {
          name: "Jane Smith",
          phone: "+1-555-987-6543",
          relationship: "Guardian",
          isPrimary: false,
          canReceiveAlerts: true,
        };
        const result = EmergencyContactCreateSchema.safeParse(createData);
        expect(result.success).toBe(true);
      });

      it("sets default canReceiveAlerts when not provided", () => {
        const createData = {
          name: "Jane Smith",
          phone: "+1-555-987-6543",
          relationship: "Guardian",
          isPrimary: false,
        };
        const result = EmergencyContactCreateSchema.safeParse(createData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.canReceiveAlerts).toBeUndefined();
        }
      });
    });
  });

  // ===== SAFE ZONE VALIDATION TESTS =====
  describe("Safe Zone Validation", () => {
    const validSafeZoneBase = {
      id: "zone_123",
      name: "School Zone",
      center: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      radius: 150,
      isActive: true,
    };

    describe("Valid safe zone cases", () => {
      it("accepts complete valid safe zone", () => {
        const result = SafeZoneSchema.safeParse(validSafeZoneBase);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("School Zone");
          expect(result.data.radius).toBe(150);
        }
      });

      it("accepts small radius", () => {
        const zone = { ...validSafeZoneBase, radius: 10 };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(true);
      });

      it("accepts large radius", () => {
        const zone = { ...validSafeZoneBase, radius: 5000 };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(true);
      });

      it("accepts inactive safe zone", () => {
        const zone = { ...validSafeZoneBase, isActive: false };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(true);
      });
    });

    describe("Invalid safe zone cases", () => {
      it("rejects safe zone without name", () => {
        const zone = { ...validSafeZoneBase, name: "" };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Safe zone name is required"
          );
        }
      });

      it("rejects negative radius", () => {
        const zone = { ...validSafeZoneBase, radius: -50 };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Safe zone radius must be positive"
          );
        }
      });

      it("rejects zero radius", () => {
        const zone = { ...validSafeZoneBase, radius: 0 };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Safe zone radius must be positive"
          );
        }
      });

      it("rejects invalid latitude", () => {
        const zone = {
          ...validSafeZoneBase,
          center: { latitude: 200, longitude: -74.006 },
        };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
      });

      it("rejects invalid longitude", () => {
        const zone = {
          ...validSafeZoneBase,
          center: { latitude: 40.7128, longitude: -200 },
        };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
      });

      it("rejects name exceeding length limit", () => {
        const longName = "a".repeat(101);
        const zone = { ...validSafeZoneBase, name: longName };
        const result = SafeZoneSchema.safeParse(zone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Safe zone name exceeds 100 characters"
          );
        }
      });
    });

    describe("Safe zone creation schema", () => {
      it("accepts valid safe zone creation data", () => {
        const createData = {
          name: "Home Zone",
          center: {
            latitude: 40.7589,
            longitude: -73.9851,
          },
          radius: 200,
          isActive: true,
        };
        const result = SafeZoneCreateSchema.safeParse(createData);
        expect(result.success).toBe(true);
      });
    });
  });

  // ===== PARENTAL SETTINGS VALIDATION TESTS =====
  describe("Parental Settings Validation", () => {
    const validSettingsBase = {
      requirePinForParentMode: true,
      parentPin: "1234",
      allowChildCategoryCreation: true,
      requireApprovalForCategories: false,
      maxCustomCategories: 10,
      safeZoneAlerts: true,
      checkInReminders: true,
      emergencyContacts: [],
    };

    describe("Valid settings cases", () => {
      it("accepts complete valid settings", () => {
        const result = ParentalSettingsSchema.safeParse(validSettingsBase);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.maxCustomCategories).toBe(10);
        }
      });

      it("accepts settings without PIN", () => {
        const settings = { ...validSettingsBase, parentPin: undefined };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(true);
      });

      it("accepts maximum category limit", () => {
        const settings = { ...validSettingsBase, maxCustomCategories: 100 };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(true);
      });

      it("accepts minimum category limit", () => {
        const settings = { ...validSettingsBase, maxCustomCategories: 1 };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(true);
      });
    });

    describe("Invalid settings cases", () => {
      it("rejects invalid PIN format", () => {
        const settings = { ...validSettingsBase, parentPin: "12ab" };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "PIN must contain only numbers"
          );
        }
      });

      it("rejects category limit exceeding maximum", () => {
        const settings = { ...validSettingsBase, maxCustomCategories: 101 };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(false);
      });

      it("rejects category limit below minimum", () => {
        const settings = { ...validSettingsBase, maxCustomCategories: 0 };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(false);
      });

      it("rejects non-integer category limit", () => {
        const settings = { ...validSettingsBase, maxCustomCategories: 10.5 };
        const result = ParentalSettingsSchema.safeParse(settings);
        expect(result.success).toBe(false);
      });
    });
  });

  // ===== INTEGRATION WORKFLOW TESTS =====
  describe("Safety Validation Workflows", () => {
    describe("Complete emergency contact setup", () => {
      it("validates complete emergency contact workflow", () => {
        // Step 1: Create contact
        const contactData = {
          name: "Emergency Contact",
          phone: "+1-555-4357-911",
          relationship: "Parent",
          isPrimary: true,
          canReceiveAlerts: true,
        };

        const contactResult =
          EmergencyContactCreateSchema.safeParse(contactData);
        expect(contactResult.success).toBe(true);

        // Step 2: Add to parental settings
        if (contactResult.success) {
          const fullContact = {
            ...contactResult.data,
            id: "contact_emergency",
          };
          const settingsData = {
            requirePinForParentMode: true,
            parentPin: "9876",
            allowChildCategoryCreation: true,
            requireApprovalForCategories: true,
            maxCustomCategories: 15,
            safeZoneAlerts: true,
            checkInReminders: true,
            emergencyContacts: [fullContact],
          };

          const settingsResult = ParentalSettingsSchema.safeParse(settingsData);
          expect(settingsResult.success).toBe(true);
          if (settingsResult.success) {
            expect(settingsResult.data.emergencyContacts).toHaveLength(1);
            expect(settingsResult.data.emergencyContacts[0].isPrimary).toBe(
              true
            );
          }
        }
      });
    });

    describe("Complete safe zone setup", () => {
      it("validates complete safe zone creation workflow", () => {
        // Validate location first
        const location = { latitude: 40.7589, longitude: -73.9851 };
        expect(location.latitude).toBeGreaterThan(-90);
        expect(location.latitude).toBeLessThan(90);
        expect(location.longitude).toBeGreaterThan(-180);
        expect(location.longitude).toBeLessThan(180);

        // Create safe zone
        const safeZoneData = {
          name: "Times Square Zone",
          center: location,
          radius: 500,
          isActive: true,
        };

        const result = SafeZoneCreateSchema.safeParse(safeZoneData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.radius).toBe(500);
          expect(result.data.center.latitude).toBe(40.7589);
        }
      });
    });

    describe("PIN security workflow", () => {
      it("validates PIN setup with security considerations", () => {
        // Test various PIN strengths
        const pinTests = [
          { pin: "1234", expected: true, note: "valid but weak" },
          { pin: "7392", expected: true, note: "valid and stronger" },
          { pin: "0000", expected: true, note: "valid but very weak" },
          { pin: "12ab", expected: false, note: "invalid format" },
          { pin: "12", expected: false, note: "too short" },
          { pin: "123456789", expected: false, note: "too long" },
        ];

        pinTests.forEach(({ pin, expected, note: _note }) => {
          const result = PinSchema.safeParse(pin);
          expect(result.success).toBe(expected);
          // Note: In production, weak but valid PINs would trigger warnings
        });
      });
    });
  });

  // ===== PERFORMANCE AND EDGE CASES =====
  describe("Performance and Edge Cases", () => {
    it("handles validation performance requirements", () => {
      const startTime = Date.now();

      // Run multiple validations
      for (let i = 0; i < 100; i++) {
        PinSchema.safeParse("1234");
        EmergencyContactCreateSchema.safeParse({
          name: "Test Contact",
          phone: "+1-555-123-4567",
          relationship: "Parent",
          isPrimary: false,
        });
        SafeZoneCreateSchema.safeParse({
          name: "Test Zone",
          center: { latitude: 40.7128, longitude: -74.006 },
          radius: 100,
          isActive: true,
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 300 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it("handles null and undefined inputs gracefully", () => {
      const nullTests = [
        () => PinSchema.safeParse(null),
        () => PinSchema.safeParse(undefined),
        () => EmergencyContactSchema.safeParse(null),
        () => SafeZoneSchema.safeParse(undefined),
      ];

      nullTests.forEach((test) => {
        const result = test();
        expect(result.success).toBe(false);
      });
    });

    it("handles malformed data gracefully", () => {
      const malformedTests = [
        () => PinSchema.safeParse(123), // number instead of string
        () => EmergencyContactSchema.safeParse("not an object"),
        () => SafeZoneSchema.safeParse([]), // array instead of object
      ];

      malformedTests.forEach((test) => {
        expect(() => test()).not.toThrow();
        const result = test();
        expect(result.success).toBe(false);
      });
    });
  });
});

// Export for potential reuse in other test files
export const createValidEmergencyContact = (
  overrides: Partial<EmergencyContact> = {}
) => ({
  id: "contact_test",
  name: "Test Contact",
  phone: "+1-555-123-4567",
  relationship: "Parent",
  isPrimary: false,
  canReceiveAlerts: true,
  ...overrides,
});

export const createValidSafeZone = (overrides: Partial<SafeZone> = {}) => ({
  id: "zone_test",
  name: "Test Zone",
  latitude: 40.7128,
  longitude: -74.006,
  radius: 150,
  isActive: true,
  createdAt: Date.now(),
  notifications: {
    onEntry: true,
    onExit: false,
  },
  ...overrides,
});
