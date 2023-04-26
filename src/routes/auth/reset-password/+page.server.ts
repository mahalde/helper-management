import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const resetPasswordSchema = z
	.object({
		password: z.string().min(6, 'errors.password'),
		confirm_password: z.string().min(6, 'errors.password')
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirm_password) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'errors.password_mismatch',
				path: ['confirm_password']
			});
		}
	});

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const result = resetPasswordSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { errors });
		}

		const { error } = await supabase.auth.updateUser({
			password: result.data.password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					generalError: 'errors.invalid_credentials'
				});
			}
			return fail(500, {
				generalError: 'errors.server_general'
			});
		}

		throw redirect(303, '/');
	}
};
