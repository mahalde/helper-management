<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
	export let errors: string[] | undefined;
</script>

{#if errors?.length}
	<div class="flex flex-col">
		{#each errors as error}
			<span class="text-error-500 text-sm" in:fly={{y: -16}}>
				{$_(error)}
			</span>
		{/each}
	</div>
{/if}
