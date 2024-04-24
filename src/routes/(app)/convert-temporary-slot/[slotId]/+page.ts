import type { Organizer, TemporarySlot } from '$lib/types/index.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, params: { slotId } }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const slotPromise = supabase
		.from('temporary_slots_with_openings')
		.select<'*', TemporarySlot>('*')
		.eq('id', slotId)
		.maybeSingle();

	const [{ data: tempSlot }, { data: organizers }] = await Promise.all([
		slotPromise,
		supabase.from('organizers').select<'*', Organizer>('*')
	]);

	if (!tempSlot) {
		throw redirect(303, '/');
	}

	return { organizers, slot: tempSlot };
};
