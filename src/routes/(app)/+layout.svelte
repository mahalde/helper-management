<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import Icon from '$lib/ui/Icon.svelte';
	import { log_out, user_circle } from '$lib/ui/icons';
	import { AppBar } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { _ } from 'svelte-i18n';

	let loading = false;

	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidate('supabase:auth');
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};
</script>

<AppBar slotTrail="justify-end" background="bg-secondary-500" shadow="shadow-md">
	<h2 class="text-white">Helfereinteilung</h2>
	<div slot="trail" class="flex gap-2">
		<Icon
			class="cursor-pointer"
			color="white"
			icon={user_circle}
			viewBoxHeight={24}
			viewBoxWidth={24}
			size={36}
		/>
		<form action="/logout" method="POST" use:enhance={handleLogout}>
			<button class="btn btn-sm variant-ghost-primary justify-between text-white" type="submit">
				<Icon
					class="cursor-pointer"
					icon={log_out}
					viewBoxHeight={24}
					viewBoxWidth={24}
				/>
				<span>{$_('label.log_out')}</span>
			</button>
		</form>
	</div>
</AppBar>
<div class="overflow-auto">
	<slot />
</div>
