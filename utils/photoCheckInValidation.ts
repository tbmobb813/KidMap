// utils/photoCheckInValidation.ts

import { z } from "zod";

export const PhotoCheckInSchema = z.object({
  placeId: z.string(),
  placeName: z.string(),
  photoUrl: z.string().url(),
  timestamp: z.number(),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export type PhotoCheckIn = z.infer<typeof PhotoCheckInSchema>;

export function validatePhotoCheckIn(data: any) {
  const result = PhotoCheckInSchema.safeParse(data);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues,
    warnings: [], // Add custom warning logic if needed
    value: result.success ? result.data : null,
  };
}
