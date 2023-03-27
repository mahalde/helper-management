<script lang="ts">
	import {
		PERMISSIONS,
		SlotCategory,
		type Modal as ModalType,
		type Slot,
		type SortOption
	} from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import { adjustments_horizontal, funnel } from '$lib/ui/icons';
	import Modal from '$lib/ui/Modal.svelte';
	import SlotDisplay from '$lib/ui/SlotDisplay.svelte';
	import { getDateFormatter } from '$lib/utils';
	import { locale, _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	let yourSlots: Slot[] = [];
	let filteredSlots: Slot[] = [];

	const slotMetadata = {
		dates: new Set<string>(),
		categories: new Set<string>(),
		names: new Set<string>()
	};
	let filters = {
		dates: new Set<string>(),
		categories: new Set<string>(),
		names: new Set<string>()
	};
	let filtered = false;

	const dateFormatter = getDateFormatter($locale);

	const sortOptions: SortOption[] = [
		{ type: 'date', sort: 'asc', label: 'label.date.asc' },
		{ type: 'date', sort: 'desc', label: 'label.date.desc' },
		{ type: 'category', label: 'label.category' },
		{ type: 'helpers_needed', label: 'label.helpers_needed' }
	];
	let selectedSortOption = sortOptions[0];

	$: {
		data.slots?.forEach((slot) => {
			slotMetadata.dates.add(slot.start_time.toISOString().split('T')[0]);
			slotMetadata.categories.add(slot.category);
			slotMetadata.names.add(slot.name);
		});

		slotMetadata.names = new Set([...slotMetadata.names].sort());

		yourSlots =
			data.slots?.filter((slot) =>
				slot.helpers.some((helper) => helper.id === data.session?.user.id)
			) ?? [];
	}

	$: {
		if (!filtered) {
			filters.dates = new Set(slotMetadata.dates);
			filters.categories = new Set(slotMetadata.categories);
			filters.names = new Set(slotMetadata.names);
		}

		filteredSlots =
			data.slots?.filter(
				(slot) =>
					filters.dates.has(slot.start_time.toISOString().split('T')[0]) &&
					filters.categories.has(slot.category) &&
					filters.names.has(slot.name)
			) ?? [];
	}

	let filterModal: ModalType;

	function filterSlots(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);

		const dates = formData.getAll('dates') as string[];
		filters.dates = new Set(dates);

		const categories = formData.getAll('categories') as SlotCategory[];
		filters.categories = new Set(categories);

		const names = formData.getAll('names') as string[];
		filters.names = new Set(names);

		filtered = true;
		filterModal.hide();
	}

	function toggleFilter(event: Event, key: keyof typeof filters) {
		const checkbox = event.target as HTMLInputElement;
		if (checkbox.checked) {
			filters[key] = new Set(slotMetadata[key]);
		} else {
			filters[key] = new Set();
		}

		filtered = true;
	}
</script>

<div class="my-4 w-fit mx-2 sm:mx-auto">
	{#if data.permissions.includes(PERMISSIONS.SLOT_CREATE)}
		<a href="/create-slot" class="btn variant-filled-primary mb-8"
			>{$_('page.dashboard.create_slot')}</a
		>
	{/if}
	<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
		{$_('page.dashboard.your_times')}
	</h4>
	{#if yourSlots.length}
		<SlotDisplay slots={yourSlots} withHelpers={false} sortOption={sortOptions[0]} />
	{:else}
		<p class="dark:text-white">{$_('page.dashboard.no_times_chosen')}</p>
	{/if}
	<hr class="my-12" />
	<div class="mb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-24">
		<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
			{$_('page.dashboard.all_times')}
		</h4>
		{#if data.slots?.length}
			<label class="label">
				<div class="flex text-gray-500 dark:text-gray-200 gap-1">
					<Icon icon={adjustments_horizontal} viewBoxHeight={24} viewBoxWidth={24} />
					{$_('label.sort_by')}
				</div>
				<select
					bind:value={selectedSortOption}
					class="select bg-transparent cursor-pointer py-0 border-none w-auto"
				>
					{#each sortOptions as sortOption}
						<option value={sortOption}>{$_(sortOption.label)}</option>
					{/each}
				</select>
			</label>
			<button
				type="button"
				on:click={filterModal.show}
				class="btn btn-sm variant-ringed-secondary w-fit"
			>
				<Icon icon={funnel} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('page.dashboard.show_filter')}</span>
			</button>
		{/if}
	</div>
	{#if filteredSlots?.length}
		<SlotDisplay slots={filteredSlots} sortOption={selectedSortOption} />
	{:else}
		<p class="dark:text-white">{$_('page.dashboard.no_times')}</p>
	{/if}
</div>

<Modal bind:modal={filterModal}>
	<form on:submit|preventDefault={filterSlots} class="p-4 space-y-2 flex flex-col">
		<p class="unstyled text-xl">{$_('label.date')}</p>
		<div>
			<label class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					checked={true}
					class="checkbox variant-ringed-primary"
					on:change={(event) => toggleFilter(event, 'dates')}
				/>
				<p>{$_('label.toggle_all')}</p>
			</label>
			{#each [...slotMetadata.dates] as date (date)}
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						name="dates"
						value={date}
						class="checkbox variant-ringed-primary"
						checked={filters.dates.has(date)}
					/>
					<p>{dateFormatter.format(new Date(date))}</p>
				</label>
			{/each}
		</div>
		<hr />
		<p class="unstyled text-xl">{$_('label.category')}</p>
		<div>
			<label class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					checked={true}
					class="checkbox variant-ringed-primary"
					on:change={(event) => toggleFilter(event, 'categories')}
				/>
				<p>{$_('label.toggle_all')}</p>
			</label>
			{#each [...slotMetadata.categories] as category (category)}
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						name="categories"
						value={category}
						class="checkbox variant-ringed-primary"
						checked={filters.categories.has(category)}
					/>
					<p>{$_(`label.${category}`)}</p>
				</label>
			{/each}
		</div>
		<hr />
		<p class="unstyled text-xl">{$_('label.name')}</p>
		<div>
			<label class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					checked={true}
					class="checkbox variant-ringed-primary"
					on:change={(event) => toggleFilter(event, 'names')}
				/>
				<p>{$_('label.toggle_all')}</p>
			</label>
			{#each [...slotMetadata.names] as name (name)}
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						name="names"
						value={name}
						class="checkbox variant-ringed-primary"
						checked={filters.names.has(name)}
					/>
					<p>{name}</p>
				</label>
			{/each}
		</div>
		<button type="submit" class="btn btn-sm variant-filled-primary">
			<Icon icon={funnel} viewBoxHeight={24} viewBoxWidth={24} />
			<span>{$_('page.dashboard.apply_filter')}</span>
		</button>
	</form>
</Modal>
