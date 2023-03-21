import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { session, supabase } = await parent();

	if (!session) {
		throw redirect(303, '/auth');
	}

	const { data: user } = await supabase
		.from('profiles')
		.select('full_name, phone')
		.eq('id', session.user.id)
		.single();

	return { user };
};
