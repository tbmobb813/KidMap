import { z } from 'zod';

export const IDSchema = z.string().min(1, 'ID is required');
export const TimestampSchema = z.number().positive('Timestamp must be positive');

export const LocationSchema = z.object({
    latitude: z.number().refine(v => v >= -90 && v <= 90, 'Latitude must be between -90 and 90 degrees'),
    longitude: z.number().refine(v => v >= -180 && v <= 180, 'Longitude must be between -180 and 180 degrees'),
    accuracy: z.number().optional(),
    timestamp: TimestampSchema.optional(),
});

export type LocationData = z.infer<typeof LocationSchema>;
