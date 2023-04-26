<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import InputError from '$lib/ui/InputError.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import { arrow_left } from '$lib/ui/icons';
	import { notifications } from '$lib/stores.js';

	export let form;
	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				notifications.success($_('page.send_password_reset.success'));
			}
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
			<a href="/auth" class="!text-primary-500 flex !no-underline">
				<Icon icon={arrow_left} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('label.go_back')}</span>
			</a>
			<p>{$_('page.send_password_reset.description')}</p>
			<form use:enhance={handleSubmit} method="POST" class="flex flex-col gap-6">
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
				<button type="submit" disabled={loading} class="btn variant-filled-primary w-full"
					>{$_('page.send_password_reset.send_mail')}
				</button>
			</form>
		</div>
	</div>
</div>
