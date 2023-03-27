import type { Organizer, Slot } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('slots.create')) {
		throw redirect(303, '/');
	}

	const duplicateSlotId = url.searchParams.get('duplicateSlotId');

	const duplicateSlotPromise = duplicateSlotId
		? supabase
				.from('slots_with_helpers')
				.select<'*', Slot>('*')
				.eq('id', duplicateSlotId)
				.maybeSingle()
		: Promise.resolve({ data: null});

	const [{ data: duplicateSlot}, { data: organizers }] = await Promise.all([
		duplicateSlotPromise,
		supabase.from('organizers').select<'*', Organizer>('*')
	]);


	return { organizers, duplicateSlot };
}