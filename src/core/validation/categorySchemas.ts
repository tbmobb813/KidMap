import { z } from 'zod';

export const CategoryCreateSchema = z.object({
    name: z.string().trim().min(1, 'Category name is required').max(30, 'Category name too long'),
    icon: z.string().trim().min(1, 'Icon is required'),
    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be a hex value'),
    isDefault: z.literal(false),
    createdBy: z.enum(['parent', 'child']),
    isApproved: z.boolean(),
});

export const CategoryUpdateSchema = z.object({
    name: z.string().trim().min(1, 'Category name is required').max(30, 'Category name too long').optional(),
    icon: z.string().trim().min(1, 'Icon is required').optional(),
    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be a hex value').optional(),
});

export const CategorySettingsSchema = z.object({
    allowChildToCreateCategories: z.boolean(),
    requireParentApproval: z.boolean(),
    maxCustomCategories: z.number().int().positive().max(100, 'Max custom categories too large'),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
export type CategorySettingsData = z.infer<typeof CategorySettingsSchema>;
