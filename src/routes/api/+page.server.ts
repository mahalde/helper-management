import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async add_helper({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		const slot_id = formData.get('slot_id') as string;
		const user_id = (await getSession())?.user.id;

		if (!user_id) {
			return fail(401, { generalError: 'errors.unauthorized' });
		}

		const { error } = await supabase.from('selected_slots').insert({
			slot_id,
			user_id,
			selected_on: new Date()
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
	}
};
