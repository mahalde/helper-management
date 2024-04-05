<script lang="ts">
	import {
		PERMISSIONS,
		type Modal as ModalType,
		type Slot,
		type SortOption,
		TemporarySlot
	} from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import { adjustments_horizontal, funnel } from '$lib/ui/icons';
	import Modal from '$lib/ui/Modal.svelte';
	import SlotDisplay from '$lib/ui/SlotDisplay.svelte';
	import { getDateFormatter } from '$lib/utils';
	import { locale, _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import TemporarySlotDisplay from '$lib/ui/TemporarySlotDisplay.svelte';
	import YourTemporarySlotDisplay from '$lib/ui/YourTemporarySlotDisplay.svelte';

	export let data: PageData;

	let yourSlots: Slot[] = [];
	let yourTemporarySlots: TemporarySlot[] = [];
	let filteredSlots: Slot[] = [];

	const slotMetadata = {
		dates: new Set<string>(),
		categories: new Set<string>(),
		names: new Set<string>()
	};
	let filters: Record<keyof typeof slotMetadata, Set<string>> = {
		dates: new Set<string>(),
		categories: new Set<string>(),
		names: new Set<string>()
	};
	const filterEntry: {
		key: keyof typeof slotMetadata;
		label: string;
		displayFn: (entry: string) => string;
	}[] = [
		{
			key: 'dates',
			label: 'date',
			displayFn: (date) => dateFormatter.format(new Date(date as string))
		},
		{
			key: 'categories',
			label: 'category',
			displayFn: (category) => $_(`label.${category}`)
		},
		{
			key: 'names',
			label: 'name',
			displayFn: (name) => name as string
		}
	];
	let filtered = false;
	let showFullSlots = true;

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

		if (data.temporarySlots) {
			yourTemporarySlots = Object.values(data.temporarySlots)
				.map((record) => Object.values(record))
				.flat(2)
				.filter((slot) => slot.helpers.some((helper) => helper.id === data.session?.user.id));
			console.log(yourTemporarySlots);
		}
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
					(showFullSlots ? true : slot.helpers.length < (slot.max_helpers ?? Infinity)) &&
					filters.dates.has(slot.start_time.toISOString().split('T')[0]) &&
					filters.categories.has(slot.category) &&
					filters.names.has(slot.name)
			) ?? [];
	}

	let filterModal: ModalType;

	function filterSlots(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		for (const key of Object.keys(slotMetadata)) {
			const entries = formData.getAll(key) as string[];
			filters[key as keyof typeof slotMetadata] = new Set(entries);
		}

		filtered = true;
		filterModal.hide();
	}

	function toggleFilter(event: Event, key: keyof typeof filters) {
		const checkbox = event.target as HTMLInputElement;
		if (checkbox.checked) {
			filters[key] = new Set(slotMetadata[key] as Set<string>);
		} else {
			filters[key] = new Set();
		}

		filtered = true;
	}

	let previewModal: ModalType;

	onMount(() => {
		if ($page.url.searchParams.get('popup') === 'false') return;
		previewModal.show();
	});
</script>

<div class="my-4 w-fit mx-2 md:mx-auto">
	{#if data.permissions.includes(PERMISSIONS.SLOT_CREATE)}
		<div class="flex flex-wrap gap-4 mb-8">
			<a href="/create-slot" class="btn variant-filled-primary"
				>{$_('page.dashboard.create_slot')}</a
			>
			<a href="/download-data" class="btn variant-ringed-secondary"
				>{$_('page.dashboard.download_slots')}
			</a>
		</div>
	{/if}
	<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
		{$_('page.dashboard.your_times')}
	</h4>
	{#if yourTemporarySlots.length}
		<YourTemporarySlotDisplay slots={yourTemporarySlots} />
	{/if}
	{#if yourSlots.length}
		<SlotDisplay slots={yourSlots} sortOption={sortOptions[0]} />
	{/if}
	{#if !yourSlots.length && !yourTemporarySlots.length}
		<p class="dark:text-white">{$_('page.dashboard.no_times_chosen')}</p>
	{/if}
	<hr class="my-12" />
	<div class="mb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-24">
		<h4 class="dark:text-gray-200 uppercase tracking-wide text-gray-500">
			{$_('page.dashboard.all_times')}
		</h4>
		{#if data.slots?.length}
			<label class="flex sm:flex-col">
				<div class="flex gap-1">
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
			<button type="button" on:click={filterModal.show} class="btn btn-sm variant-filled-primary">
				<Icon icon={funnel} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('page.dashboard.show_filter')}</span>
			</button>
			<div class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					bind:checked={showFullSlots}
					class="checkbox variant-ringed-primary"
				/>
				<p>{$_('page.dashboard.show_full_slots')}</p>
			</div>
		{/if}
	</div>
	{#if data.temporarySlots && Object.keys(data.temporarySlots).length !== 0}
		<h1 class="mt-8 mb-4 text-center">Vorläufige Arbeitszeiten</h1>
		<TemporarySlotDisplay slots={data.temporarySlots} />
	{/if}
	{#if filteredSlots?.length || !data.temporarySlots || Object.keys(data.temporarySlots).length}
		<h1 class="mt-8 mb-4 text-center">Feste Arbeitszeiten</h1>
		<SlotDisplay slots={filteredSlots} sortOption={selectedSortOption} />
	{:else}
		<p class="dark:text-white">{$_('page.dashboard.no_times')}</p>
	{/if}
</div>

<Modal bind:modal={filterModal}>
	<form on:submit|preventDefault={filterSlots} class="p-4 space-y-2 flex flex-col">
		{#each filterEntry as entry (entry.key)}
			<p class="unstyled text-xl">{$_(`label.${entry.label}`)}</p>
			<div class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					checked={true}
					class="checkbox variant-ringed-primary"
					on:change={(event) => toggleFilter(event, entry.key)}
				/>
				<p>{$_('label.toggle_all')}</p>
			</div>
			<div>
				{#each [...slotMetadata[entry.key]] as metadata (metadata)}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name={entry.key}
							value={metadata}
							class="checkbox variant-ringed-primary"
							checked={filters[entry.key].has(metadata)}
						/>
						<p>{entry.displayFn(metadata)}</p>
					</label>
				{/each}
			</div>
			<hr />
		{/each}
		<button type="submit" class="btn btn-sm variant-filled-primary">
			<Icon icon={funnel} viewBoxHeight={24} viewBoxWidth={24} />
			<span>{$_('page.dashboard.apply_filter')}</span>
		</button>
	</form>
</Modal>

<Modal bind:modal={previewModal}>
	<div class="p-4 space-y-4 flex flex-col">
		<h2>{$_('page.dashboard.preview_modal.header')}</h2>
		<p>{$_('page.dashboard.preview_modal.paragraph_1')}</p>
		<p>{$_('page.dashboard.preview_modal.paragraph_2')}</p>
		<p>{$_('page.dashboard.preview_modal.paragraph_3')}</p>
		<button type="button" class="btn variant-filled-primary" on:click={previewModal.hide}>
			{$_('page.dashboard.preview_modal.button')}
		</button>
	</div>
</Modal>
