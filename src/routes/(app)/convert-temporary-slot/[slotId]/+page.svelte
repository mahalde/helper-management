<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { notifications } from '$lib/stores';
	import { SlotCategory, type AdditionalCategoryField, TemporaryTimeslot } from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import InputError from '$lib/ui/InputError.svelte';
	import { minus, plus } from '$lib/ui/icons';
	import { getDateFormatter } from '$lib/utils';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { formatISO, lightFormat, parseISO } from 'date-fns';
	import { _, locale } from 'svelte-i18n';

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

	const startTimeMap: Record<TemporaryTimeslot, number> = {
		morning: 8,
		afternoon: 12,
		evening: 16
	};

	const endTimeMap: Record<TemporaryTimeslot, number> = {
		morning: 12,
		afternoon: 16,
		evening: 20
	};

	function getTempStartTime() {
		const startDate = new Date(data.slot.date);
		startDate.setHours(startTimeMap[data.slot.timeslot]);

		return lightFormat(startDate, "yyyy-MM-dd'T'HH:mm");
	}

	function getTempEndTime() {
		const endDate = new Date(data.slot.date);
		endDate.setHours(endTimeMap[data.slot.timeslot]);

		return lightFormat(endDate, "yyyy-MM-dd'T'HH:mm");
	}

	let helperMap: Record<
		string,
		{
			name: string;
			helpers: {
				id: string;
				name: string;
				opening: string;
				opening_id: string;
				selected_on: string;
			}[];
		}
	>;
	$: {
		helperMap = data.slot.helpers.reduce((acc, helper) => {
			if (acc[helper.opening_id]) {
				acc[helper.opening_id].helpers.push(helper);
			} else {
				acc[helper.opening_id] = { name: helper.opening, helpers: [helper] };
			}

			return acc;
		}, {});

		Object.values(helperMap).forEach((opening) => {
			opening.helpers.sort(
				(a, b) => new Date(a.selected_on).getTime() - new Date(b.selected_on).getTime()
			);
		});
	}

	const dateFormatter = getDateFormatter($locale, true);

	const hoverPopup: PopupSettings = {
		event: 'hover',
		placement: 'top',
		target: 'popup'
	};
</script>

<div class="card p-4 variant-filled-secondary" data-popup="popup">
	<p>{$_('page.convert_temp_slot.popup')}</p>
</div>

<div class="flex flex-col w-full items-center">
	<div class="flex gap-4 m-4">
		<a href="/create-slot" class="btn variant-filled-primary">
			{$_('page.create_temporary_slot.create_slot_link')}
		</a>
		<a href="/create-temporary-slot" class="btn variant-filled-primary">
			{$_('page.create_slot.create_temporary_slot_link')}
		</a>
	</div>
	<div
		class="w-full max-w-xl m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8"
	>
		<h3>{$_('page.convert_temp_slot.headline')}</h3>
		<form
			use:enhance={handleSubmit}
			method="POST"
			action="?/createSlot"
			class="flex flex-col gap-6"
		>
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
						value={form?.values?.start_time ?? getTempStartTime() ?? ''}
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
						value={form?.values?.end_time ?? getTempEndTime() ?? ''}
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
							checked={form?.values.additional_fields.some((formField) => formField === field.id)}
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
			<hr />
			<p class="unstyled text-lg">{$_('label.temporary_helpers')}</p>
			<p>{$_('page.convert_temp_slot.temporary_helpers')}</p>
			<ul>
				{#each Object.entries(helperMap) as [openingId, opening] (openingId)}
					<li>{opening.name}</li>
					<ul>
						{#each opening.helpers as helper (helper.id)}
							<li class="last:mb-4">
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										name="helper_{helper.id}_opening_{openingId}"
										checked={form?.values.helpers.some((id) => helper.id === id)}
										class="checkbox variant-ringed-primary"
									/>
									<!-- TODO: use popup?-->
									<span>
										{helper.name} (angemeldet am {dateFormatter.format(
											parseISO(helper.selected_on)
										)})
									</span>
								</label>
							</li>
						{/each}
					</ul>
				{/each}
			</ul>
			<button type="submit" disabled={loading} class="btn variant-filled-primary w-full">
				{$_('label.save')}
			</button>
		</form>
	</div>
</div>
