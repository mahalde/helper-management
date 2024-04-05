<script lang="ts">
	import type { TemporarySlot } from '$lib/types';
	import UITempSlot from './TemporarySlot.svelte';

	export let slots: TemporarySlot[];
</script>

<div class="flex flex-col gap-4">
	{#each slots as slot (slot.id)}
		<UITempSlot {slot} />
	{/each}
</div>
