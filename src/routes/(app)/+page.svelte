<script lang="ts">
	import type { Slot } from '$lib/types';
	import UISlot from '$lib/ui/Slot.svelte';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	export let data: PageData;

	let yourSlots: Slot[] = [];

	$: yourSlots = data.slots?.filter((slot) =>
		slot.helpers.some((helper) => helper.id === data.session?.user.id)
	) ?? [];
</script>

<div class="m-4">
	<h4 class="dark:text-white">{$_('page.dashboard.your_times')}</h4>
	{#if yourSlots.length}
		<div class="flex flex-col max-w-fit gap-4">
			{#each yourSlots as slot (slot.id)}
				<UISlot {slot} withHelpers={false} />
			{/each}
		</div>
	{:else}
		<p class="dark:text-white">{$_('page.dashboard.no_times')}</p>
	{/if}
	<h4 class="mt-4 mb-2 dark:text-white">{$_('page.dashboard.all_times')}</h4>
	<div class="flex flex-col max-w-fit gap-4">
		{#if data.slots}
			{#each data.slots as slot (slot.id)}
				<UISlot {slot} />
			{/each}
		{/if}
	</div>
</div>
