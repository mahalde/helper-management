import { z } from 'zod';

export const NotificationType = z.enum(['info', 'success', 'warning', 'error']);
export type NotificationType = z.infer<typeof NotificationType>;

export const AdditionalCategoryFieldType = z.enum(['text']);
export type AdditionalCategoryFieldType = z.infer<typeof AdditionalCategoryFieldType>;

export const SlotCategory = z.enum(['catering', 'dressage', 'showjumping'], {
	invalid_type_error: 'errors.invalid_type',
	required_error: 'errors.required'
});
export type SlotCategory = z.infer<typeof SlotCategory>;

export const TemporaryTimeslot = z.enum(['morning', 'afternoon', 'evening'], {
	invalid_type_error: 'errors.invalid_type',
	required_error: 'errors.required'
});
export type TemporaryTimeslot = z.infer<typeof TemporaryTimeslot>;

export const Helper = z.object({
	id: z.string(),
	name: z.string()
});
export type Helper = z.infer<typeof Helper>;

export const TemporaryHelper = Helper.extend({
	openings: z.array(
		z.object({
			id: z.string(),
			name: z.string()
		})
	)
});
export type TemporaryHelper = z.infer<typeof TemporaryHelper>;

export const Organizer = z.object({
	id: z.string(),
	name: z.string(),
	phone: z.string()
});
export type Organizer = z.infer<typeof Organizer>;

export const AdditionalCategoryField = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	type: AdditionalCategoryFieldType,
	optional: z.boolean()
});
export type AdditionalCategoryField = z.infer<typeof AdditionalCategoryField>;

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
	additional_fields: z.array(AdditionalCategoryField)
});
export type Slot = z.infer<typeof Slot> & { temporary: false };

export const SlotForOrganizer = Slot.extend({
	contacts: z.array(z.string()),
	helpers: z.array(
		Helper.extend({
			phone: z.string(),
			additional_field_data: z.array(
				z.object({
					key: z.number(),
					value: z.string()
				})
			)
		})
	)
});
export type SlotForOrganizer = z.infer<typeof SlotForOrganizer>;

export const TemporarySlot = z.object({
	id: z.string(),
	name: z.string(),
	timeslot: TemporaryTimeslot,
	category: SlotCategory,
	contacts: z.array(Organizer),
	date: z.date(),
	openings: z.array(
		z.object({
			id: z.string(),
			name: z.string()
		})
	),
	helpers: z.array(TemporaryHelper)
});
export type TemporarySlot = z.infer<typeof TemporarySlot> & { temporary: true };

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
	SLOT_DELETE = 'slots.delete'
}

export interface Modal {
	show(data?: unknown): void;
	hide(): void;
}
