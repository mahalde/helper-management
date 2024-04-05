import type { Organizer, TemporarySlot } from '$lib/types/index.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, depends, params: { slotId } }) => {
	depends('helpermanagement:slots');
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const { data: slot } = await supabase
		.from('temporary_slots_with_openings')
		.select<'*', TemporarySlot>('*')
		.eq('id', slotId)
		.maybeSingle();

	if (!slot) {
		throw redirect(303, '/');
	}

	const { data: organizers } = await supabase.from('organizers').select<'*', Organizer>('*');

	return {
		slot,
		organizers
	};
};
