<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { notifications } from '$lib/stores';
	import InputError from '$lib/ui/InputError.svelte';
	import { _ } from 'svelte-i18n';

	export let data;
	export let form;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			if (result.type === 'success') {
				notifications.success($_('notification.success.changes_saved'));
			}
			loading = false;
		};
	};
</script>

<div class="flex w-full justify-center">
	<div class="w-full max-w-md m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8">
		<h3>{$_('page.profile.headline')}</h3>
		<form use:enhance={handleSubmit} method="POST" action="?/updateUserInfo" class="flex flex-col gap-6">
			<label class="label">
				<span>{$_('label.name')}</span>
				<input
					name="name"
					type="text"
					value={data.user?.full_name ?? form?.values?.name ?? ''}
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
					value={data.user?.phone ?? form?.values?.phone ?? ''}
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