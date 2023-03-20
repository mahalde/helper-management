<script lang="ts">
	import type { Slot, SortOption } from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import { adjustments_horizontal } from '$lib/ui/icons';
	import SlotDisplay from '$lib/ui/SlotDisplay.svelte';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	let yourSlots: Slot[] = [];

	const sortOptions: SortOption[] = [
		{ type: 'date', sort: 'asc', label: 'label.date.asc' },
		{ type: 'date', sort: 'desc', label: 'label.date.desc' },
		{ type: 'category', label: 'label.category' },
		{ type: 'helpers_needed', label: 'label.helpers_needed' }
	];
	let selectedSortOption = sortOptions[0];

	$: yourSlots =
		data.slots?.filter((slot) =>
			slot.helpers.some((helper) => helper.id === data.session?.user.id)
		) ?? [];
</script>

<div class="my-4 w-fit mx-2 sm:mx-auto">
	<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
		{$_('page.dashboard.your_times')}
	</h4>
	{#if yourSlots.length}
		<SlotDisplay slots={yourSlots} withHelpers={false} sortOption={sortOptions[0]} />
	{:else}
		<p class="dark:text-white">{$_('page.dashboard.no_times')}</p>
	{/if}
	<hr class="my-12" />
	<div class="mb-2 flex justify-between items-center gap-24">
		<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
			{$_('page.dashboard.all_times')}
		</h4>
		<label class="label">
			<div class="flex text-gray-500 dark:text-gray-200 gap-1">
				<Icon icon={adjustments_horizontal} viewBoxHeight={24} viewBoxWidth={24} />
				{$_('label.sort_by')}
			</div>
			<select bind:value={selectedSortOption} class="select bg-transparent cursor-pointer py-0 border-none">
				{#each sortOptions as sortOption}
					<option value={sortOption}>{$_(sortOption.label)}</option>
				{/each}
			</select>
		</label>
	</div>
	<SlotDisplay slots={data.slots} sortOption={selectedSortOption} />
</div>
