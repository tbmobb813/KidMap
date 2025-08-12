import { z } from 'zod';
import { LocationSchema } from './baseSchemas';

export const PhotoCheckInSchema = z.object({
    placeId: z.string().min(1, 'Place ID is required'),
    placeName: z.string().min(1, 'Place name is required'),
    photoUrl: z.string().min(1, 'Photo URL is required'),
    timestamp: z.number().positive('Valid timestamp is required'),
    location: LocationSchema.optional(),
    notes: z.string().max(500, 'Check-in notes are very long (>500 characters)').optional()
});

export type PhotoCheckInInput = z.infer<typeof PhotoCheckInSchema>;
