import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().trim().email('errors.email'),
	password: z.string().min(5, 'errors.password'),
});

export const actions: Actions = {
	async login({request}) {
		const formData = await request.formData();
		const result = loginSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors });
		}
	}
}

