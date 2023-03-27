<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { notifications } from '$lib/stores';
	import { SlotCategory, type AdditionalCategoryField } from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import { minus, plus } from '$lib/ui/icons';
	import InputError from '$lib/ui/InputError.svelte';
	import { formatISO, lightFormat, parseISO } from 'date-fns';
	import { _ } from 'svelte-i18n';

	export let data;
	export let form;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let selectedCategory: SlotCategory | '' =
		(form?.values?.category as SlotCategory) ?? data.slot.category ?? '';
	let additionalCategoryFields: AdditionalCategoryField[] = [];
	$: if (selectedCategory) {
		getAdditionalCategoryFields(selectedCategory);
	}

	async function getAdditionalCategoryFields(category: SlotCategory) {
		const { data: additionalFields } = await data.supabase
			.from('additional_category_fields')
			.select<'*', AdditionalCategoryField>('*')
			.eq('category', category);

		additionalCategoryFields = additionalFields ?? [];
	}

	let contacts: (string | null)[] = (form?.values?.contacts as string[] | undefined) ??
		data.slot.contacts.map((contact) => contact.id) ?? [null];

	let loading = false;
	const handleSubmit: SubmitFunction = ({ data }) => {
		loading = true;
		const [startTime, endTime] = updateDateFields();
		data.set('start_time', startTime);
		data.set('end_time', endTime);
		return async ({ result }) => {
			if (result.type === 'redirect') {
				notifications.success($_('notification.success.changes_saved'));
			}
			await applyAction(result);
			loading = false;
		};
	};

	let startTimeEl: HTMLInputElement;
	let endTimeEl: HTMLInputElement;
	function updateDateFields() {
		let startTime = startTimeEl.value;
		if (startTime) {
			startTime = formatISO(parseISO(startTime));
		}

		let endTime = endTimeEl.value;
		if (endTime) {
			endTime = formatISO(parseISO(endTime));
		}

		return [startTime, endTime] as const;
	}

	function formatDate(date: Date) {
		return lightFormat(parseISO(date as unknown as string), "yyyy-MM-dd'T'HH:mm");
	}
</script>

<div class="flex w-full justify-center">
	<div
		class="w-full max-w-xl m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8"
	>
		<h3>{$_('page.edit_slot.headline')}</h3>
		<form use:enhance={handleSubmit} method="POST" action="?/editSlot" class="flex flex-col gap-6">
			<div class="flex flex-col sm:flex-row gap-4 justify-between">
				<label class="label grow">
					<span>{$_('label.name')}</span>
					<input
						name="name"
						type="text"
						value={form?.values?.name ?? data.slot.name ?? ''}
						class="input"
						class:input-error={form?.errors?.name}
					/>
					<InputError errors={form?.errors?.name} />
				</label>
				<label class="label">
					<span>{$_('label.category')}</span>
					<select
						name="category"
						bind:value={selectedCategory}
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
						bind:this={startTimeEl}
						name="start_time"
						type="datetime-local"
						value={form?.values?.start_time ?? formatDate(data.slot.start_time) ?? ''}
						class="input"
						class:input-error={form?.errors?.start_time}
					/>
					<InputError errors={form?.errors?.start_time} />
				</label>
				<label class="label">
					<span>{$_('label.end_time')}</span>
					<input
						bind:this={endTimeEl}
						name="end_time"
						type="datetime-local"
						value={form?.values?.end_time ?? formatDate(data.slot.end_time) ?? ''}
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
						value={form?.values?.min_helpers ?? data.slot.min_helpers ?? 0}
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
						value={form?.values?.max_helpers ?? data.slot.max_helpers ?? null}
						class="input"
						min={0}
						class:input-error={form?.errors?.max_helpers}
					/>
					<InputError errors={form?.errors?.max_helpers} />
				</label>
			</div>
			{#if data.organizers?.length}
				<label class="label">
					<span>{$_('label.contacts')}</span>
					{#each contacts as _, i (i)}
						<div class="flex gap-4">
							<select
								name="contacts"
								bind:value={contacts[i]}
								class="input"
								class:input-error={form?.errors?.contacts}
							>
								<option value={''} />
								{#each data.organizers as organizer (organizer.id)}
									<option value={organizer.id}>{organizer.name}</option>
								{/each}
							</select>
							{#if i + 1 === contacts.length}
								<button
									type="button"
									class="btn btn-icon rounded-lg variant-ringed-primary"
									on:click={() => (contacts = [...contacts, null])}
								>
									<Icon viewBoxHeight={24} viewBoxWidth={24} icon={plus} />
								</button>
							{:else}
								<button
									type="button"
									class="btn btn-icon rounded-lg variant-ringed-error"
									on:click={() => (contacts = [...contacts.slice(0, i), ...contacts.slice(i + 1)])}
								>
									<Icon viewBoxHeight={24} viewBoxWidth={24} icon={minus} />
								</button>
							{/if}
						</div>
						<InputError errors={form?.errors?.contacts} />
					{/each}
				</label>
			{/if}
			{#if additionalCategoryFields.length}
				<hr />
				<p class="unstyled text-lg">{$_('label.additional_fields')}</p>
				<p>{$_('page.create_slot.additional_fields')}</p>
				{#each additionalCategoryFields as field (field.id)}
					<label class="flex items-center gap-2">
						<input
							name="additional_field_{field.id}"
							type="checkbox"
							checked={form?.values.additional_fields.some((formField) => formField === field.id) ??
								data.slot.additional_fields.some((slotField) => slotField.id === field.id)}
							class="checkbox variant-ringed-primary"
						/>
						<p>
							{field.name}
							{#if field.description}
								({field.description})
							{/if}
						</p>
					</label>
				{/each}
			{/if}
			<button type="submit" disabled={loading} class="btn variant-filled-primary w-full">
				{$_('label.save')}
			</button>
		</form>
	</div>
</div>
