import { z } from 'zod';

export const PhotoCheckInSchema = z.object({
    placeId: z.string().min(1, 'Place ID is required'),
    placeName: z.string().min(1, 'Place name is required'),
    // Timestamp must be a finite, non-negative number (unix ms).
    // Tests expect negative timestamps to be invalid while zero and positive
    // values are ok.
    timestamp: z.number().refine((v) => Number.isFinite(v) && v >= 0, 'Valid timestamp is required'),
    // Use a permissive location shape for check-ins: numeric lat/lon without
    // strict bounds. Location is required for photo check-ins in tests.
    location: z
        .object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number().optional(),
            timestamp: z.number().optional(),
        })
        ,
    photoUrl: z.string().url(),
    notes: z.string().max(500, 'Check-in notes are very long (>500 characters)').optional()
});

export type PhotoCheckInInput = z.infer<typeof PhotoCheckInSchema>;
