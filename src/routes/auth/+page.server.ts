import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().trim().email('errors.email'),
	password: z.string().min(6, 'errors.password')
});

const registerSchema = loginSchema.extend({
	confirm_password: z.string().min(6, 'errors.password')
}).superRefine((data, ctx) => {
	if (data.password !== data.confirm_password) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'errors.password_mismatch',
			path: ['confirm_password']
		});
	}
})

export const actions: Actions = {
	async login({ request, locals: { supabase } }) {
		const formData = await request.formData();
		const result = loginSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors, values: { email: formData.get('email') } });
		}


		const { error } = await supabase.auth.signInWithPassword({
			email: result.data.email,
			password: result.data.password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					generalError: 'errors.invalid_credentials',
					values: {
						email: result.data.email
					}
				});
			}
			return fail(500, {
				generalError: 'errors.server_general',
				values: {
					email: result.data.email
				}
			});
		}

		throw redirect(303, '/');
	},
	async register({ request, locals: { supabase } }) {
		const formData = await request.formData();
		const result = registerSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors, values: { email: formData.get('email') } });
		}

		const { error } = await supabase.auth.signUp({
			email: result.data.email,
			password: result.data.password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					generalError: 'errors.email_taken',
					values: {
						email: result.data.email
					}
				});
			}
			console.error(error);
			return fail(500, {
				generalError: 'errors.server_general',
				values: {
					email: result.data.email
				}
			});
		}

		throw redirect(303, '/');
	}
};
