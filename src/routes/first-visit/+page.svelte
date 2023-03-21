<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { notifications } from '$lib/stores';
	import InputError from '$lib/ui/InputError.svelte';
	import { _ } from 'svelte-i18n';
	import type { ActionData } from './$types';

	export let form: ActionData;

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
	<div class="w-full max-w-md">
		<div class="mt-4 space-y-6 bg-white dark:bg-gray-900 shadow-md p-8 rounded-lg">
			<h3>{$_('page.first_visit.header')}</h3>
			<p>{$_('page.first_visit.text')}</p>
			<form use:enhance={handleSubmit} method="POST" action="?/updateUserInfo" class="flex flex-col gap-6">
				<label class="label">
					<span>{$_('label.name')}</span>
					<input
						name="name"
						type="text"
						value={form?.values?.name ?? ''}
						autocomplete="name"
						class="input"
						class:input-error={form?.errors?.name}
					/>
					<InputError errors={form?.errors?.name} />
				</label>
				<label class="label">
					<span>{$_('label.phone')}</span>
					<input
						name="phone"
						type="text"
						value={form?.values?.phone ?? ''}
						autocomplete="tel"
						class="input"
						class:input-error={form?.errors?.phone}
					/>
					<InputError errors={form?.errors?.phone} />
				</label>
				<button
					type="submit"
					disabled={loading}
					class="btn variant-filled-primary w-full"
				>
					{$_('label.save')}
				</button>
		</div>
	</div>
</div>
