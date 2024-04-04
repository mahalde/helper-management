import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const sendMailSchema = z.object({
	email: z.string().trim().email('errors.email')
});

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const result = sendMailSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors, values: { email: formData.get('email') } });
		}

		const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
			redirectTo: 'https://helfereinteilung.rv-hoeven.de/auth/reset-password'
		});

		if (error) {
			console.error(error);
			return fail(500, {
				generalError: 'errors.server_general',
				values: {
					email: result.data.email
				}
			});
		}
	}
};
