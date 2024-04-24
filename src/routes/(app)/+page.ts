import type { Slot, TemporarySlot, TemporaryTimeslot } from '$lib/types';
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
		end_time: new Date(slot.end_time),
		temporary: false as const
	}));

	const { data: rawTempIds } = await supabase.from('slots').select('temp_slot_id');

	const tempIds = rawTempIds?.map((slot) => slot.temp_slot_id) ?? [];

	const { data: rawTemporarySlots } = await supabase
		.from('temporary_slots_with_openings')
		.select('*')
		.gte('date', new Date().toISOString());
	let temporarySlots: TemporarySlot[] | undefined = rawTemporarySlots?.map((slot) => ({
		...slot,
		temporary: true,
		date: new Date(slot.date)
	}));

	const helperMap = rawTemporarySlots?.map((slot) =>
		(slot.helpers as any[]).reduce((map, helper) => {
			if (!map[helper.id]) {
				map[helper.id] = {
					name: helper.name,
					openings: []
				};
			}
			map[helper.id].openings.push({ id: helper.opening_id, name: helper.opening });
			return map;
		}, {} as Record<string, any[]>)
	);

	const helpers = helperMap?.map((slot) => {
		return Object.entries<any>(slot).map(([helper_id, helper]) => {
			return {
				id: helper_id,
				...helper
			};
		});
	});

	if (temporarySlots && helpers) {
		for (let i = 0; i < temporarySlots?.length; i++) {
			temporarySlots[i].helpers = helpers?.[i];
		}
	}

	temporarySlots = temporarySlots?.filter((slot) => !tempIds.includes(slot.id));

	slots?.sort((slotA, slotB) => slotA.start_time.getTime() - slotB.start_time.getTime());
	temporarySlots?.sort((slotA, slotB) => {
		if (slotA.date.getTime() === slotB.date.getTime()) {
			if (slotA.timeslot === 'morning') {
				return -1;
			} else if (slotA.timeslot === 'evening') {
				return 1;
			} else {
				return 0;
			}
		}

		return slotA.date.getTime() - slotB.date.getTime();
	});
	const sortedTemporarySlots = temporarySlots?.reduce((all, slot) => {
		const date = slot.date.toISOString();
		if (!all[date]) {
			all[date] = {} as Record<TemporaryTimeslot, TemporarySlot[]>;
		}
		if (!all[date][slot.timeslot]) {
			all[date][slot.timeslot] = [];
		}
		all[date][slot.timeslot].push(slot);
		return all;
	}, {} as Record<string, Record<TemporaryTimeslot, TemporarySlot[]>>);

	return { slots, temporarySlots: sortedTemporarySlots, permissions };
};
