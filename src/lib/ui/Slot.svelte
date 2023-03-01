<script lang="ts">
	import type { Slot, SlotCategory } from '$lib/types';
	import { _, locale } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import { catering, dressage, obstacle } from './icons';
	import { isSameDay } from 'date-fns';

	export let slot: Slot;
  export let withHelpers = true;

	const iconMap: Record<SlotCategory, string> = {
		catering,
		dressage,
		showjumping: obstacle
	};

	const dateFormatter = new Intl.DateTimeFormat($locale ?? 'de-DE', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
    weekday: 'long',

	});
	const timeFormatter = new Intl.DateTimeFormat($locale ?? 'de-DE', {
		hour: '2-digit',
		minute: '2-digit'
	});

	let endDate: string;
	$: startDate = dateFormatter.format(slot.start_time);
	$: if (isSameDay(slot.start_time, slot.end_time)) {
		endDate = timeFormatter.format(slot.end_time);
	} else {
		endDate = dateFormatter.format(slot.end_time);
	}
</script>

<div class="border border-gray-300 rounded-md flex flex-col p-2 shadow-sm">
	<div class="flex items-center text-gray-500 dark:text-gray-300 gap-2">
		<Icon
			icon={iconMap[slot.category]}
			viewBoxHeight={512}
			viewBoxWidth={512}
			size={32}
			fill={true}
		/>
		<div class="uppercase text-sm tracking-wider">
			{$_(`label.${slot.category}`)} &centerdot; {startDate} &ndash; {endDate}
		</div>
	</div>
  <span class="text-lg dark:text-white">
    {slot.name}
  </span>
  {#if withHelpers && slot.helpers.length}
    <hr class="m-2"/>
    <span class="text-gray-500 dark:text-gray-300 text-sm uppercase tracking-wide">{$_('label.assigned_helpers')} ({slot.helpers.length}/{slot.min_helpers})</span>
    {#each slot.helpers as helper (helper.id)}
      <p class="text-gray-500 dark:text-gray-300">{helper.name}</p>
    {/each}
  {/if}
</div>
