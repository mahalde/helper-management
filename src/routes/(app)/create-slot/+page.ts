import type { Organizer } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const { data: organizers } = await supabase
		.from('organizers')
		.select<'*', Organizer>('*');

	return { organizers };
}