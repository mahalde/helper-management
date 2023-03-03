<script lang="ts">
	import { dev } from '$app/environment';
	import { enhance } from '$app/forms';
	import { notifications } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Icon from '$lib/ui/Icon.svelte';
	import { apple, facebook, google } from '$lib/ui/icons';
	import type { Provider } from '@supabase/supabase-js';
	import { _ } from 'svelte-i18n';
	import type { ActionData } from './$types';

	export let form: ActionData;

	const providers: Provider[] = ['google'];

	const iconMap: Record<string, { icon: string; viewBoxHeight: number; viewBoxWidth: number }> = {
		google: {
			icon: google,
			viewBoxWidth: 488,
			viewBoxHeight: 512
		},
		facebook: {
			icon: facebook,
			viewBoxWidth: 488,
			viewBoxHeight: 512
		},
		apple: {
			icon: apple,
			viewBoxWidth: 512,
			viewBoxHeight: 512
		}
	};

	let loading = false;
	let type: 'login' | 'register' = 'login';

	function toggleType() {
		type = type === 'login' ? 'register' : 'login';
	}

	async function handleProviderSignIn(provider: Provider) {
		loading = true;

		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: dev ? 'http://localhost:5173' : undefined }
		});
		if (error) {
			notifications.error(error.message, 5000);
		}

		loading = false;
	}
</script>
<div class="flex max-h-full items-center justify-center p-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<img class="mx-auto h-24 w-auto" src="logo.png" alt="Reiterverein Höven e.V." />
			<h2
				class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300"
			>
				{$_('page.auth.headline')}
			</h2>
			<p class="mt-2 text-center text-sm">
				<button type="button" on:click={toggleType} class="btn text-primary-500">
					{$_(`page.auth.${type === 'login' ? 'not_registered' : 'already_registered'}`)}
				</button>
			</p>
		</div>
		<div class="mt-8 space-y-6 bg-white dark:bg-gray-900 shadow-md p-8 rounded-lg">
			<form use:enhance method="POST" action="?/{type}" class="flex flex-col gap-6">
				<label class="label">
					<span>{$_('label.email')}</span>
					<input
						name="email"
						type="email"
						autocomplete="email"
						required
						class="input"
					/>
				</label>
				<label class="label">
					<span>{$_('label.password')}</span>
					<input
						name="password"
						type="password"
						autocomplete="current-password"
						class="input"
					/>
				</label>
				{#if type === 'register'}
					<label class="label">
						<span>{$_('label.confirm_password')}</span>
						<input
							name="confirm_password"
							type="password"
							autocomplete={null}
							required
							class="input"
						/>
					</label>
				{/if}
				<button
					type="submit"
					disabled={loading}
					class="btn variant-filled-primary w-full"
					color="primary"
				>
					{$_(`page.auth.${type === 'login' ? 'log_in' : 'register'}`)}
				</button>
			</form>
			<hr class="mt-2" />
			<div class="text-gray-400 text-center font-light text-sm">
				{$_('page.auth.alternative_login')}
			</div>
			<div class="flex justify-around gap-4">
				{#each providers as provider}
					<button
						type="button"
						color="alternative"
						disabled={loading}
						on:click={() => handleProviderSignIn(provider)}
						class="btn variant-ringed-primary gap-2 w-full"
					>
						<span>
							<Icon
								fill={true}
								icon={iconMap[provider].icon}
								viewBoxWidth={iconMap[provider].viewBoxWidth}
								viewBoxHeight={iconMap[provider].viewBoxHeight}
							/>
						</span>
						<span>{provider.toUpperCase()}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
