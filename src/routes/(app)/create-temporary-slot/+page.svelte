<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { notifications } from '$lib/stores';
	import { SlotCategory, type AdditionalCategoryField, TemporaryTimeslot } from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import { minus, plus } from '$lib/ui/icons';
	import InputError from '$lib/ui/InputError.svelte';
	import { InputChip } from '@skeletonlabs/skeleton';
	import { formatISO, lightFormat, parseISO } from 'date-fns';
	import { _ } from 'svelte-i18n';

	export let data;
	export let form;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let selectedCategory: SlotCategory | '' =
		(form?.values?.category as SlotCategory) ?? data.duplicateSlot?.category ?? '';

	let selectedTimeslot: TemporaryTimeslot | '' =
		(form?.values?.timeslot as TemporaryTimeslot) ?? data.duplicateSlot?.timeslot ?? '';

	let contacts: (string | null)[] = (form?.values?.contacts as string[] | undefined) ??
		data.duplicateSlot?.contacts.map((contact) => contact.id) ?? [null];

	let loading = false;
	const handleSubmit: SubmitFunction = ({ data }) => {
		loading = true;
		const date = updateDateField();
		data.set('date', date);
		return async ({ result }) => {
			if (result.type === 'redirect') {
				notifications.success($_('notification.success.changes_saved'));
			}
			await applyAction(result);
			loading = false;
		};
	};

	let dateEl: HTMLInputElement;
	function updateDateField() {
		let date = dateEl.value;
		if (date) {
			date = formatISO(parseISO(date));
		}
		return date;
	}

	function formatDate(date: Date | undefined) {
		if (!date) return undefined;

		return lightFormat(parseISO(date as unknown as string), "yyyy-MM-dd'T'HH:mm");
	}
</script>

<div class="flex flex-col w-full items-center">
	<a href="/create-slot" class="btn variant-filled-primary m-4">
		{$_('page.create_temporary_slot.create_slot_link')}
	</a>
	<div
		class="w-full max-w-xl m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8"
	>
		<h3>{$_('page.create_temporary_slot.headline')}</h3>
		<form
			use:enhance={handleSubmit}
			method="POST"
			action="?/createTemporarySlot"
			class="flex flex-col gap-6"
		>
			<div class="flex flex-col sm:flex-row gap-4 justify-between">
				<label class="label grow">
					<span>{$_('label.name')}</span>
					<input
						name="name"
						type="text"
						value={form?.values?.name ?? data.duplicateSlot?.name ?? ''}
						class="input"
						class:input-error={form?.errors?.name}
					/>
					<InputError errors={form?.errors?.name} />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row justify-between gap-4">
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
				<label class="label">
					<span>{$_('label.date')}</span>
					<input
						bind:this={dateEl}
						name="date"
						type="date"
						value={form?.values?.start_time ?? formatDate(data.duplicateSlot?.date) ?? ''}
						class="input"
						class:input-error={form?.errors?.date}
					/>
					<InputError errors={form?.errors?.date} />
				</label>
				<label class="label">
					<span>{$_('label.timeslot')}</span>
					<select
						name="timeslot"
						bind:value={selectedTimeslot}
						class="input"
						class:input-error={form?.errors?.timeslot}
					>
						{#each Object.keys(TemporaryTimeslot.enum) as timeslot}
							<option value={timeslot}>{$_(`label.${timeslot}`)}</option>
						{/each}
					</select></label
				>
			</div>
			<label class="label">
				<span>{$_('label.openings')}</span>
				<InputChip
					name="openings"
					required
					value={data.duplicateSlot?.openings.map((opening) => opening.name) ?? []}
					allowUpperCase
				/>
			</label>
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
			<button type="submit" disabled={loading} class="btn variant-filled-primary w-full">
				{$_('label.save')}
			</button>
		</form>
	</div>
</div>
