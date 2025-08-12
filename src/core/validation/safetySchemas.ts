import { z } from 'zod';
import { LocationSchema } from './baseSchemas';

export const SafeZoneSchema = z.object({
    id: z.string().min(1, 'Safe zone ID is required'),
    name: z.string().min(1, 'Safe zone name is required').max(100, 'Safe zone name exceeds 100 characters'),
    center: LocationSchema,
    radius: z.number().positive('Safe zone radius must be positive'),
    isActive: z.boolean(),
});

export const EmergencyContactSchema = z.object({
    id: z.string().min(1, 'Contact ID is required'),
    name: z.string().min(1, 'Contact name is required').max(150, 'Contact name exceeds 150 characters'),
    phone: z.string().min(1, 'Contact phone number is required').refine(v => {
        const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
        return phoneRegex.test(v.replace(/\s/g, ''));
    }, 'Phone number format is invalid'),
    relationship: z.string().min(1, 'Contact relationship is required'),
    isPrimary: z.boolean(),
});

export const PinSchema = z.string()
    .min(4, 'PIN must be at least 4 digits')
    .max(8, 'PIN must be no more than 8 digits')
    .regex(/^\d+$/, 'PIN must contain only numbers');

export type SafeZoneData = z.infer<typeof SafeZoneSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
