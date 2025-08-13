import { z } from 'zod';

// Sanitizes a string input by trimming, truncating, and escaping basic HTML entities.
export function sanitizeInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>"'&]/g, (match) => {
            const entities: Record<string, string> = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;',
            };
            return entities[match] || match;
        });
}

export type ToastFn = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

// Parses data with a zod schema and surfaces errors via a toast helper.
export function safeParseWithToast<T>(schema: z.ZodSchema<T>, data: unknown, toast?: ToastFn): T | null {
    const result = schema.safeParse(data);
    if (!result.success) {
        const msg = result.error.issues.map(i => i.message).join('\n');
        toast?.(msg, 'error');
        return null;
    }
    return result.data;
}

// Validation result shape reused for distance validator feedback.
export type ValidationResult = {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
};

// Basic distance sanity validation (meters) with warning thresholds.
export function validateDistance(distance: number, context: string = 'location'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof distance !== 'number' || isNaN(distance)) {
        errors.push(`${context} distance must be a valid number`);
    } else if (distance < 0) {
        errors.push(`${context} distance cannot be negative`);
    } else if (distance > 20_000_000) { // ~20,000 km (half Earth circumference)
        errors.push(`${context} distance is unrealistically large`);
    } else if (distance > 1_000_000) { // 1000 km
        warnings.push(`${context} distance is very large (>1000km)`);
    }

    return { isValid: errors.length === 0, errors, warnings };
}

// Form data validation + sanitization using a lightweight rule map (legacy support scenario).
export function validateAndSanitizeFormData(
    data: Record<string, any>,
    schema: Record<string, any>
): { isValid: boolean; sanitizedData: Record<string, any>; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${key} is required`);
            continue;
        }
        if (!rules.required && (value === undefined || value === null || value === '')) continue;
        if (rules.type && typeof value !== rules.type) {
            errors.push(`${key} must be of type ${rules.type}`);
            continue;
        }
        if (typeof value === 'string') {
            const sanitized = sanitizeInput(value, rules.maxLength);
            if (rules.minLength && sanitized.length < rules.minLength) errors.push(`${key} must be at least ${rules.minLength} characters`);
            if (rules.maxLength && sanitized.length > rules.maxLength) warnings.push(`${key} was truncated to ${rules.maxLength} characters`);
            if (rules.pattern && !rules.pattern.test(sanitized)) errors.push(`${key} format is invalid`);
            sanitizedData[key] = sanitized;
        } else {
            sanitizedData[key] = value;
        }
    }

    return { isValid: errors.length === 0, sanitizedData, errors, warnings };
}

/**
 * Deprecated: Prefer structured logging wrappers elsewhere.
 */
export interface ValidationLogger {
    warn?: (message: string, meta?: any) => void;
    debug?: (message: string, meta?: any) => void;
}

export function logValidationResult(context: string, result: ValidationResult, log: ValidationLogger) {
    if (!result.isValid) log.warn?.(`Validation failed for ${context}`, { errors: result.errors });
    if (result.warnings?.length) log.warn?.(`Validation warnings for ${context}`, { warnings: result.warnings });
    if (result.isValid && !result.warnings?.length) log.debug?.(`Validation passed for ${context}`);
}
