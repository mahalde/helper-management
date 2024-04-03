<script lang="ts">
	import type { TemporarySlot, TemporaryTimeslot } from '$lib/types';
	import { getDateFormatter } from '$lib/utils';
	import { locale, _ } from 'svelte-i18n';
	import UITempSlot from './TemporarySlot.svelte';

	export let slots: Record<string, Record<TemporaryTimeslot, TemporarySlot[]>>;
	export let withHelpers = true;

	const dateFormatter = getDateFormatter($locale);
</script>

<div class="flex flex-col gap-4">
	{#each Object.entries(slots) as [date, timeslotObj] (date)}
		{#each Object.entries(timeslotObj) as [timeslot, tempSlots] (timeslot)}
			<h2 class="mt-32 first:mt-8 mb-2">
				{dateFormatter.format(new Date(date))} &centerdot; {$_(`label.${timeslot}`)}
			</h2>
			{#each tempSlots as slot (slot.id)}
				<UITempSlot {slot} {withHelpers} />
			{/each}
		{/each}
	{/each}
</div>
