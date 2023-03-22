<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { notifications } from '$lib/stores';
	import { SlotCategory } from '$lib/types';
	import InputError from '$lib/ui/InputError.svelte';
	import { _ } from 'svelte-i18n';

	export let form;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				notifications.success($_('notification.success.changes_saved'));
			}
			await applyAction(result);
			loading = false;
		};
	};
</script>

<div class="flex w-full justify-center">
	<div class="w-full max-w-xl m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8">
		<h3>{$_('page.create_slot.headline')}</h3>
		<form use:enhance={handleSubmit} method="POST" action="?/createSlot" class="flex flex-col gap-6">
			<div class="flex flex-col sm:flex-row gap-4 justify-between">
				<label class="label grow">
					<span>{$_('label.name')}</span>
					<input
						name="name"
						type="text"
						value={form?.values?.name ?? ''}
						class="input"
						class:input-error={form?.errors?.name}
					/>
					<InputError errors={form?.errors?.name} />
				</label>
				<label class="label">
					<span>{$_('label.category')}</span>
					<select
						name="category"
						value={form?.values?.category ?? ''}
						class="input"
						class:input-error={form?.errors?.category}
					>
					{#each Object.keys(SlotCategory.enum) as category}
						<option value={category}>{$_(`label.${category}`)}</option>
					{/each}
				</select>
					<InputError errors={form?.errors?.category} />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row justify-between gap-4">
				<label class="label">
					<span>{$_('label.start_time')}</span>
					<input
						name="start_time"
						type="datetime-local"
						value={form?.values?.start_time ?? ''}
						class="input"
						class:input-error={form?.errors?.start_time}
					/>
					<InputError errors={form?.errors?.start_time} />
				</label>
				<label class="label">
					<span>{$_('label.end_time')}</span>
					<input
						name="end_time"
						type="datetime-local"
						value={form?.values?.end_time ?? ''}
						class="input"
						class:input-error={form?.errors?.end_time}
					/>
					<InputError errors={form?.errors?.end_time} />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row justify-between gap-4">
				<label class="label">
					<span>{$_('label.min_helpers')}</span>
					<input
						name="min_helpers"
						type="number"
						value={form?.values?.min_helpers ?? 0}
						class="input"
						min={0}
						class:input-error={form?.errors?.min_helpers}
					/>
					<InputError errors={form?.errors?.min_helpers} />
				</label>
				<label class="label">
					<span>{$_('label.max_helpers')}</span>
					<input
						name="max_helpers"
						type="number"
						value={form?.values?.max_helpers ?? null}
						class="input"
						min={0}
						class:input-error={form?.errors?.max_helpers}
					/>
					<InputError errors={form?.errors?.max_helpers} />
				</label>
			</div>
			<button
				type="submit"
				disabled={loading}
				class="btn variant-filled-primary w-full"
			>
				{$_('label.save')}
			</button>
	</div>
</div>