import type { Slot } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
	depends('helpermanagement:slots');
	const { supabase, session, permissions } = await parent();

	if (!session) {
		throw redirect(303, '/auth');
	}

	const { data: rawSlots } = await supabase
		.from('slots_with_helpers')
		.select<'*', Slot>('*')
		.gte('start_time', new Date().toISOString());
	const slots = rawSlots?.map((slot) => ({
		...slot,
		start_time: new Date(slot.start_time),
		end_time: new Date(slot.end_time)
	}));

	slots?.sort((slotA, slotB) => slotA.start_time.getTime() - slotB.start_time.getTime());

	return { slots, permissions };
};
