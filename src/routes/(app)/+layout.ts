import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { session, supabase } = await parent();
	if (!session) {
		throw redirect(303, '/auth');
	}
	const { data: user } = await supabase
		.from('profiles')
		.select('first_visit')
		.eq('id', session.user.id)
		.single();

	if (user?.first_visit) {
		throw redirect(303, '/first-visit');
	}
};
