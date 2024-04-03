import { SlotCategory, TemporaryTimeslot } from '$lib/types';
import { valuesFromData } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { addDays } from 'date-fns';
import { z } from 'zod';

const slotSchema = z.object({
	name: z.string().trim().min(1, 'errors.required'),
	category: SlotCategory,
	timeslot: TemporaryTimeslot,
	contacts: z.array(z.string()),
	date: z
		.date({ invalid_type_error: 'errors.invalid_type', required_error: 'errors.required' })
		.min(new Date(), 'errors.time_in_past')
});

export const actions = {
	async createTemporarySlot({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		const values = {
			name: formData.get('name'),
			category: formData.get('category') ?? undefined,
			timeslot: formData.get('timeslot') ?? undefined,
			contacts: formData.getAll('contacts').filter((contact) => contact !== ''),
			openings: (formData.getAll('openings') as string[]) ?? [],
			date: formData.get('date') ? new Date(formData.get('date') as string) : undefined
		};

		if (values.date) {
			values.date = addDays(values.date, 1);
		}

		const result = slotSchema.safeParse(values);
		const formDataValues = valuesFromData(formData, slotSchema);
		formDataValues.date = (formDataValues.date as string).split('+')[0];

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

		const { data, error } = await supabase.from('temporary_slots').insert(result.data).select('id');

		if (error) {
			console.error(error);
			return fail(500, {
				generalError: 'errors.server_general',
				values: formDataValues
			});
		}

		const slotId = data[0].id;

		const openingRows = values.openings.map((opening) => ({
			name: opening,
			slot_id: slotId
		}));

		const { error: openingsError } = await supabase
			.from('temporary_slot_openings')
			.insert(openingRows);

		console.log(openingsError);
		if (openingsError) {
			console.error(openingsError);
			return fail(500, {
				generalError: 'errors.server_general',
				values: formDataValues
			});
		}

		throw redirect(303, '/?popup=false');
	}
};
