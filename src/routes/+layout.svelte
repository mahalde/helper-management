<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { notifications } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Alert from '$lib/ui/Alert.svelte';
	import '@skeletonlabs/skeleton/styles/all.css';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import '../app.css';
	import '../theme.css';

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(() => {
      invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<slot />
<div class="fixed bottom-0 right-0 m-4 flex gap-2 flex-col">
	{#each $notifications as notification (notification.id)}
		<div transition:fly={{ y: 32 }}>
			<Alert {...notification} />
		</div>
	{/each}
</div>
