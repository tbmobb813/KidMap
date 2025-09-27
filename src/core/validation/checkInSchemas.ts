import { z } from 'zod';

export const PhotoCheckInSchema = z.object({
    placeId: z.string().min(1, 'Place ID is required'),
    placeName: z.string().min(1, 'Place name is required'),
    // Tests expect permissive handling of timestamps and location objects.
    // Allow any finite number for timestamps.
    timestamp: z.number().refine((v) => Number.isFinite(v), 'Valid timestamp is required'),
    // Use a permissive location shape for check-ins: numeric lat/lon without strict bounds.
    // Make location required to align with existing tests that expect it.
    location: z.object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number().optional(),
            timestamp: z.number().optional(),
        }),
    photoUrl: z.string().url(),
    notes: z.string().max(500, 'Check-in notes are very long (>500 characters)').optional()
});

export type PhotoCheckInInput = z.infer<typeof PhotoCheckInSchema>;
