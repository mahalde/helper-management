<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { notifications } from '$lib/stores';
	import type { Slot, SlotCategory } from '$lib/types';
	import { getDateFormatter, getTimeFormatter } from '$lib/utils';
	import { isSameDay } from 'date-fns';
	import { locale, _ } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import { catering, dressage, minus, obstacle, plus } from './icons';

	export let slot: Slot;
	export let withHelpers = true;

	const iconMap: Record<SlotCategory, string> = {
		catering,
		dressage,
		showjumping: obstacle
	};

	const dateFormatter = getDateFormatter($locale, true);
	const timeFormatter = getTimeFormatter($locale);

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'failure' && result.data?.generalError) {
				notifications.error($_(result.data.generalError));
			} else if (result.type === 'success') {
				invalidate('helpermanagement:slots');
			}
			await applyAction(result);
			loading = false;
		};
	};

	let endDate: string;
	$: startDate = dateFormatter.format(slot.start_time);
	$: if (isSameDay(slot.start_time, slot.end_time)) {
		endDate = timeFormatter.format(slot.end_time);
	} else {
		endDate = dateFormatter.format(slot.end_time);
	}
	$: alreadyHelper = slot.helpers.some((helper) => helper.id === $page.data.session?.user.id);
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
		<div class="text-sm">
			{$_(`label.${slot.category}`)} &centerdot; {startDate} &ndash; {endDate}
		</div>
	</div>
	<span class="text-lg dark:text-white">
		{slot.name}
	</span>
	<form
		class="self-end"
		method="POST"
		action={`/api?/${alreadyHelper ? 'remove_helper' : 'add_helper'}`}
		use:enhance={handleSubmit}
	>
		<input type="hidden" name="slot_id" value={slot.id} />
		{#if alreadyHelper}
			<button disabled={loading} class="btn btn-sm variant-glass-secondary w-fit gap-2 mt-2">
				<span><Icon icon={minus} viewBoxHeight={24} viewBoxWidth={24} /></span>
				{$_('label.remove_helper')}
			</button>
		{:else}
			<button disabled={loading} class="btn btn-sm variant-glass-primary w-fit gap-2 self-end mt-2">
				<span><Icon icon={plus} viewBoxHeight={24} viewBoxWidth={24} /></span>
				{$_('label.add_helper')}
			</button>
		{/if}
	</form>
	{#if slot.contacts.length}
		<hr class="my-2" />
		<span class="text-gray-500 dark:text-gray-300 mb-2">
			{$_('label.contacts')}
		</span>
		<div class="grid grid-cols-[auto_1fr] gap-x-4 text-gray-500 dark:text-gray-300">
			{#each slot.contacts as contact (contact.id)}
				<span>{contact.name}</span>
				<span>(<a href="tel:{contact.phone}">{contact.phone}</a>)</span>
			{/each}
		</div>
	{/if}
	{#if withHelpers && slot.helpers.length}
		<hr class="my-2" />
		<span class="text-gray-500 dark:text-gray-300 mb-2">
			{$_('label.assigned_helpers')}
			{#if slot.helpers.length < slot.min_helpers}
				({$_('label.num_of_helpers_needed', {
					values: { num: slot.min_helpers - slot.helpers.length }
				})})
			{:else if slot.max_helpers}
				({slot.helpers.length}/{slot.max_helpers})
			{/if}
		</span>
		{#each slot.helpers as helper (helper.id)}
			<p class="text-gray-500 dark:text-gray-300">{helper.name}</p>
		{/each}
	{/if}
</div>

<!-- Contacts popup-->
<div
	data-popup="contacts-popup-{slot.id}"
	class="w-fit border border-gray-300 rounded-md p-2 z-10 bg-gray-50 dark:bg-gray-700"
>
	<p>{$_('label.contacts')}</p>
	<div class="mt-2 grid grid-cols-2 text-sm">
		{#each slot.contacts as contact (contact.id)}
			<span>{contact.name}</span>
			<span>(<a href="tel:{contact.phone}">{contact.phone}</a>)</span>
		{/each}
	</div>
</div>
