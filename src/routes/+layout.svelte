<script lang="ts">
	import { dev } from '$app/environment';
	import { notifications } from '$lib/stores';
	import Alert from '$lib/ui/Alert.svelte';
	import '@skeletonlabs/skeleton/styles/all.css';
	import { inject } from '@vercel/analytics';
	import { fly } from 'svelte/transition';
	import '../app.css';
	import '../theme.css';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<svelte:head>
	<title>Helfereinteilung Turnier Höven 2023</title>
	<meta
		name="description"
		content="Helfereinteilung für das Turnier des Reitervereins Höven 2023"
	/>
</svelte:head>

<slot />
<div class="fixed bottom-0 right-0 m-4 flex gap-2 flex-col">
	{#each $notifications as notification (notification.id)}
		<div transition:fly={{ y: 32 }}>
			<Alert {...notification} />
		</div>
	{/each}
</div>
