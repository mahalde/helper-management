import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async add_helper({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		const slot_id = formData.get('slot_id') as string;
		let user_id = (await getSession())?.user.id;

		const additionalFields = [...formData.keys()]
			.filter((key) => key.startsWith('additional_field_'))
			.map((key) => ({
				key: Number(key.replace('additional_field_', '')),
				value: formData.get(key) as string
			}));

		if (!user_id) {
			return fail(401, { generalError: 'errors.unauthorized' });
		}

		const additionalHelperName = formData.get('additional_helper_name') as string;
		const additionalHelperPhone = formData.get('additional_helper_phone') as string;

		if (additionalHelperName) {
			const { data: additionalHelper } = await supabase
				.from('profiles')
				.select('id')
				.eq('full_name', additionalHelperName)
				.maybeSingle();

			if (additionalHelper) {
				user_id = additionalHelper.id;
			} else {
				const { data: additionalHelper, error } = await supabase
					.from('profiles')
					.upsert(
						{
							full_name: additionalHelperName,
							phone: additionalHelperPhone,
							is_additional_helper: true
						},
						{
							onConflict: 'full_name',
							ignoreDuplicates: true
						}
					)
					.select('id')
					.maybeSingle();

				if (error) {
					console.error(error);
					return fail(500, { generalError: 'errors.server_general' });
				}

				if (additionalHelper) {
					user_id = additionalHelper.id;
				}
			}
		}

		const { error } = await supabase.from('selected_slots').insert({
			slot_id,
			user_id,
			selected_on: new Date(),
			additional_field_data: additionalFields
		});

		if (error) {
			console.error(error);
			return fail(500, { generalError: 'errors.server_general' });
		}
	},
	async remove_helper({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		const slot_id = formData.get('slot_id') as string;
		const user_id = (await getSession())?.user.id;

		if (!user_id) {
			return fail(401, { generalError: 'errors.unauthorized' });
		}

		const { error } = await supabase.from('selected_slots').delete().match({
			slot_id,
			user_id
		});

		if (error) {
			console.error(error);
			return fail(500, { generalError: 'errors.server_general' });
		}
	},
	async delete_slot({ request, locals: { supabase } }) {
		const formData = await request.formData();
		const slot_id = formData.get('slot_id') as string;

		const { error } = await supabase.from('slots').delete().eq('id', slot_id);

		if (error) {
			console.error(error);
			return fail(500, { generalError: 'errors.server_general' });
		}
	}
};
