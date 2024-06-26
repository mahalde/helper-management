<script lang="ts">
	import type { Slot, SortOption } from '$lib/types';
	import { getDateFormatter } from '$lib/utils';
	import { locale, _ } from 'svelte-i18n';
	import UISlot from './Slot.svelte';

	export let slots: Slot[] | undefined;
	export let withHelpers = true;
	export let sortOption: SortOption;

	const dateFormatter = getDateFormatter($locale);

	let sortedSlots: Map<string | number, Slot[]> = new Map();

	function assignToSortedSlots(key: string | number, slot: Slot) {
		if (!sortedSlots.get(key)) {
			sortedSlots.set(key, []);
		}
		sortedSlots.get(key)?.push(slot);
	}

	function showLabel(label: string | number) {
		if (sortOption.type === 'date') {
			return dateFormatter.format(label as number);
		} else if (sortOption.type === 'helpers_needed') {
			return $_('label.num_of_helpers_needed', { values: { num: label } });
		}
		return $_(label as string);
	}

	$: {
		sortedSlots.clear();

		slots?.forEach((slot) => {
			if (sortOption.type === 'category') {
				const key = `label.${slot.category}`;
				assignToSortedSlots(key, slot);
			} else if (sortOption.type === 'helpers_needed') {
				assignToSortedSlots(slot.min_helpers - slot.helpers.length, slot);
			} else if (sortOption.type === 'date') {
				const date = new Date(
					slot.start_time.getFullYear(),
					slot.start_time.getMonth(),
					slot.start_time.getDate()
				);
				assignToSortedSlots(date.valueOf(), slot);
			}
		});

		for (const slots of sortedSlots.values()) {
			slots.sort((slotA, slotB) => {
				if (
					slotA.start_time.getHours() === slotB.start_time.getHours() &&
					slotA.start_time.getMinutes() === slotB.start_time.getMinutes()
				) {
					return slotA.name.localeCompare(slotB.name);
				}
				return 0;
			});
		}

		sortedSlots = new Map(
			[...sortedSlots].sort(([aKey], [bKey]) => {
				if (typeof aKey === 'string') {
					return aKey.localeCompare(bKey as string);
				}
				if (sortOption.type === 'date' && sortOption.sort === 'asc') {
					return aKey - (bKey as number);
				}
				return (bKey as number) - aKey;
			})
		);
	}
</script>

<div class="flex flex-col gap-4">
	{#if slots}
		{#each [...sortedSlots] as [label, mapSlots] (label)}
			<h2 class="mt-64 first:mt-8 mb-2">{showLabel(label)}</h2>
			{#each mapSlots as slot (slot.id)}
				<UISlot {slot} {withHelpers} />
			{/each}
		{/each}
	{/if}
</div>
