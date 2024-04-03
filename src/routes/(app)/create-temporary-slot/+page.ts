import type { Organizer, TemporarySlot } from '$lib/types/index.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const duplicateSlotId = url.searchParams.get('duplicateSlotId');

	const duplicateSlotPromise = duplicateSlotId
		? supabase
				.from('temporary_slots_with_openings')
				.select<'*', TemporarySlot>('*')
				.eq('id', duplicateSlotId)
				.maybeSingle()
		: Promise.resolve({ data: null });

	const [{ data: duplicateSlot }, { data: organizers }] = await Promise.all([
		duplicateSlotPromise,
		supabase.from('organizers').select<'*', Organizer>('*')
	]);

	return { organizers, duplicateSlot };
};
