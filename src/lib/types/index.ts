import { z } from 'zod';

export const NotificationType = z.enum(['info', 'success', 'warning', 'error']);
export type NotificationType = z.infer<typeof NotificationType>;

export const SlotCategory = z.enum(['catering', 'dressage', 'showjumping']);
export type SlotCategory = z.infer<typeof SlotCategory>;

export const Helper = z.object({
	id: z.string(),
	name: z.string(),
});
export type Helper = z.infer<typeof Helper>;

export const Slot = z.object({
	id: z.string(),
	name: z.string(),
	category: SlotCategory,
	start_time: z.date(),
	end_time: z.date(),
	min_helpers: z.number(),
	max_helpers: z.number().nullable(),
	helpers: z.array(Helper),
});
export type Slot = z.infer<typeof Slot>;

export type SortOption = {
	type: 'date',
	label: string
	sort?: string,
} | {
	type: 'category' | 'helpers_needed',
	label: string
};