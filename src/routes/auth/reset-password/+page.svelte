<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import InputError from '$lib/ui/InputError.svelte';
	import { notifications } from '$lib/stores.js';

	export let form;
	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};
	};
</script>

<div class="flex max-h-full items-center justify-center p-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<img class="mx-auto h-24 w-auto" src="/logo.png" alt="Reiterverein Höven e.V." />
			<h2
				class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300"
			>
				{$_('page.auth.headline')}
			</h2>
		</div>
		<div class="mt-4 space-y-6 bg-white dark:bg-gray-900 shadow-md p-8 rounded-lg">
			<h3>{$_('page.reset_password.reset')}</h3>
			<form use:enhance={handleSubmit} method="POST" class="flex flex-col gap-6">
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
				<button type="submit" disabled={loading} class="btn variant-filled-primary w-full"
					>{$_('page.reset_password.reset')}
				</button>
			</form>
		</div>
	</div>
</div>
