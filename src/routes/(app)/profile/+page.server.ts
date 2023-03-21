import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const userDataSchema = z.object({
	name: z.string().trim().min(1, 'errors.required'),
	phone: z.string().trim().min(1, 'errors.required')
});

export const actions = {
	async updateUserInfo({ request, locals: { supabase, getSession } }) {
		const formData = await request.formData();
		const result = userDataSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors,
				values: { name: formData.get('name'), phone: formData.get('phone') }
			});
		}

		const session = await getSession();
		if (!session) {
			return fail(401, {
				generalError: 'errors.unauthorized',
				values: {
					name: result.data.name,
					phone: result.data.phone
				}
			});
		}

		const { error } = await supabase
			.from('profiles')
			.update({
				full_name: result.data.name,
				phone: result.data.phone,
			})
			.eq('id', session.user.id);

		if (error) {
			return fail(500, {
				generalError: 'errors.server_general',
				values: {
					name: result.data.name,
					phone: result.data.phone
				}
			});
		}
	}
}