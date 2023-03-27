import type { Organizer, Slot } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, params: { slotId } }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const { data: slot } = await supabase
		.from('slots_with_helpers')
		.select<'*', Slot>('*')
		.eq('id', slotId)
		.maybeSingle();

	if (!slot) {
		throw redirect(303, '/');
	}

	const { data: organizers } = await supabase
		.from('organizers')
		.select<'*', Organizer>('*');

	return {
		slot,
		organizers,
	};
};
