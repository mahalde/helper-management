<script>
  import Account from './Account.svelte';
	import Auth from './Auth.svelte';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
	<title>Supabase + SvelteKit</title>
	<meta name="description" content="SvelteKit using supabase-js v2" />
</svelte:head>

{#if !data.session}
	<Auth />
{:else}
	<Account session={data.session} />
{/if}
