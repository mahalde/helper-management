import { SlotCategory } from '$lib/types';
import { valuesFromData } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const slotSchema = z
	.object({
		name: z.string().trim().min(1, 'errors.required'),
		category: SlotCategory,
		start_time: z
			.date({ invalid_type_error: 'errors.invalid_type', required_error: 'errors.required' })
			.min(new Date(), 'errors.time_in_past'),
		end_time: z
			.date({ invalid_type_error: 'errors.invalid_type', required_error: 'errors.required' })
			.min(new Date(), 'errors.time_in_past'),
		min_helpers: z.number().min(1, 'errors.min_helpers'),
		max_helpers: z.number().positive().nullable(),
		contacts: z.array(z.string()).optional()
	})
	.superRefine((data, ctx) => {
		if (data.start_time > data.end_time) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'errors.end_time_before_start_time',
				path: ['end_time']
			});
		}
	});

export const actions = {
	async createSlot({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		console.log(formData);
		const startTime = formData.get('start_time');
		const endTime = formData.get('end_time');
		const values = {
			name: formData.get('name'),
			category: formData.get('category') ?? undefined,
			start_time: startTime ? new Date(startTime as string) : undefined,
			end_time: endTime ? new Date(endTime as string) : undefined,
			min_helpers: Number(formData.get('min_helpers')),
			max_helpers: Number(formData.get('max_helpers')) || null,
			contacts: formData.getAll('contacts').filter((contact) => contact !== '')
		};
		const result = slotSchema.safeParse(values);
		const formDataValues = valuesFromData(formData, slotSchema);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors,
				values: formDataValues
			});
		}

		const session = await getSession();
		if (!session) {
			return fail(401, {
				generalError: 'errors.unauthorized',
				values: formDataValues
			});
		}

		const { error } = await supabase.from('slots').insert(result.data);

		if (error) {
			console.error(error);
			return fail(500, {
				generalError: 'errors.server_general',
				values: formDataValues
			});
		}

		throw redirect(303, '/');
	}
};
