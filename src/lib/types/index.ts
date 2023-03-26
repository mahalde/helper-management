import { z } from 'zod';

export const NotificationType = z.enum(['info', 'success', 'warning', 'error']);
export type NotificationType = z.infer<typeof NotificationType>;

export const SlotCategory = z.enum(['catering', 'dressage', 'showjumping'], {
	invalid_type_error: 'errors.invalid_type',
	required_error: 'errors.required'
});
export type SlotCategory = z.infer<typeof SlotCategory>;

export const Helper = z.object({
	id: z.string(),
	name: z.string()
});
export type Helper = z.infer<typeof Helper>;

export const Organizer = z.object({
	id: z.string(),
	name: z.string(),
	phone: z.string(),
});
export type Organizer = z.infer<typeof Organizer>;

export const Slot = z.object({
	id: z.string(),
	name: z.string(),
	category: SlotCategory,
	start_time: z.date(),
	end_time: z.date(),
	min_helpers: z.number(),
	max_helpers: z.number().nullable(),
	helpers: z.array(Helper),
	contacts: z.array(Organizer),
});
export type Slot = z.infer<typeof Slot>;

export type SortOption =
	| {
			type: 'date';
			label: string;
			sort?: string;
	  }
	| {
			type: 'category' | 'helpers_needed';
			label: string;
	  };

export enum PERMISSIONS {
	SLOT_CREATE = 'slots.create',
	SLOT_DELETE = 'slots.delete',
};