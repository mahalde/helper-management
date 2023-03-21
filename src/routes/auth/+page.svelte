<script lang="ts">
	import { dev } from '$app/environment';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { notifications } from '$lib/stores';
	import Icon from '$lib/ui/Icon.svelte';
	import { apple, facebook, google } from '$lib/ui/icons';
	import InputError from '$lib/ui/InputError.svelte';
	import type { Provider } from '@supabase/supabase-js';
	import { _ } from 'svelte-i18n';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

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

	const handleSubmit: SubmitFunction = () => {
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

	async function handleProviderSignIn(provider: Provider) {
		loading = true;

		const { error } = await data.supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: dev ? 'http://localhost:5173' : undefined }
		});
		if (error) {
			notifications.error(error.message);
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
		<div class="mt-4 space-y-6 bg-white dark:bg-gray-900 shadow-md p-8 rounded-lg">
			<form use:enhance={handleSubmit} method="POST" action="?/{type}" class="flex flex-col gap-6">
				<label class="label">
					<span>{$_('label.email')}</span>
					<input
						name="email"
						type="email"
						value={form?.values?.email ?? ''}
						autocomplete="email"
						required
						class="input"
						class:input-error={form?.errors?.email}
					/>
					<InputError errors={form?.errors?.email} />
				</label>
				<label class="label">
					<span>{$_('label.password')}</span>
					<input
						name="password"
						type="password"
						autocomplete="current-password"
						class="input"
						class:input-error={form?.errors?.password}
					/>
					<InputError errors={form?.errors?.password} />
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
							class:input-error={form?.errors?.confirm_password}
						/>
						<InputError errors={form?.errors?.confirm_password} />
					</label>
				{/if}
				<button
					type="submit"
					disabled={loading}
					class="btn variant-filled-primary w-full"
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
						on:click={() => handleProviderSignIn(provider)}
						disabled={loading}
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
