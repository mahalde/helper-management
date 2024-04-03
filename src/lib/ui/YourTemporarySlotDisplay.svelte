<script lang="ts">
	import type { TemporarySlot } from '$lib/types';
	import { getDateFormatter } from '$lib/utils';
	import { locale } from 'svelte-i18n';
	import UITempSlot from './TemporarySlot.svelte';

	export let slots: TemporarySlot[];

	const dateFormatter = getDateFormatter($locale);
</script>

<div class="flex flex-col gap-4">
	{#each slots as slot (slot.id)}
		<UITempSlot {slot} withHelpers={false} />
	{/each}
</div>
