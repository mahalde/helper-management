import type { Organizer } from '$lib/types';

export const load = async ({ parent }) => {
	const { supabase } = await parent();

	const { data: organizers } = await supabase
		.from('organizers')
		.select<'*', Organizer>('*');

	return { organizers };
}