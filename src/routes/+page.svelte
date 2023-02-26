<script lang="ts">
	import type { PageData } from './$types';
	import Account from './Account.svelte';
	import Auth from './Auth.svelte';

  export let data: PageData;
</script>

<svelte:head>
	<title>Helfereinteilung Turnier Höven 2023</title>
	<meta name='description' content='Helfereinteilung für das Turnier des Reitervereins Höven 2023' />
</svelte:head>

{#if !data.session}
  <Auth />
{:else}
  <Account session={data.session} />
{/if}