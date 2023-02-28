<script lang="ts">
	import type { PageData } from './$types';
	import Auth from './Auth.svelte';
	import Dashboard from './Dashboard.svelte';

  export let data: PageData;
</script>

<svelte:head>
	<title>Helfereinteilung Turnier Höven 2023</title>
	<meta name='description' content='Helfereinteilung für das Turnier des Reitervereins Höven 2023' />
</svelte:head>

{#if !data.session}
  <Auth />
{:else}
  <Dashboard session={data.session} />
{/if}