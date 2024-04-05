<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { notifications } from '$lib/stores';
	import { SlotCategory, TemporaryTimeslot, type Modal as ModalType } from '$lib/types';
	import Icon from '$lib/ui/Icon.svelte';
	import InputError from '$lib/ui/InputError.svelte';
	import Modal from '$lib/ui/Modal.svelte';
	import { minus, plus, trash, x_mark } from '$lib/ui/icons';
	import { InputChip } from '@skeletonlabs/skeleton';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { formatISO, parseISO } from 'date-fns';
	import { _ } from 'svelte-i18n';

	export let data;
	export let form;

	$: if (form?.generalError) {
		notifications.error($_(form.generalError));
	}

	let selectedCategory: SlotCategory | '' =
		(form?.values?.category as SlotCategory) ?? data.slot.category ?? '';

	let selectedTimeslot: TemporaryTimeslot | '' =
		(form?.values?.timeslot as TemporaryTimeslot) ?? data.slot.timeslot ?? '';

	let contacts: (string | null)[] = (form?.values?.contacts as string[] | undefined) ??
		data.slot.contacts.map((contact) => contact.id) ?? [null];

	let removeHelperModals: (ModalType | undefined)[] = [];

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

	const handleRemoveHelper: (index: number) => SubmitFunction = (index) => {
		return () => {
			loading = true;
			return async ({ result }) => {
				if (result.type === 'failure') {
					notifications.error($_(result.data?.generalError));
				} else {
					invalidate('helpermanagement:slots');
					removeHelperModals[index]?.hide();
				}
				await applyAction(result);
				loading = false;
			};
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
</script>

<div class="flex w-full justify-center">
	<div
		class="w-full max-w-xl m-4 sm:mx-6 lg:mx-8 p-4 border border-gray-300 rounded-lg shadow-sm space-y-8"
	>
		<h3>{$_('page.edit_temporary_slot.headline')}</h3>
		<form
			use:enhance={handleSubmit}
			method="POST"
			action="?/editTemporarySlot"
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
						value={form?.values?.date ?? data.slot.date ?? ''}
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
					</select>
				</label>
			</div>
			<label class="label">
				<span>{$_('label.openings')}</span>
				<InputChip
					name="openings"
					required
					value={data.slot.openings.map((opening) => opening.name) ?? []}
					allowUpperCase
					on:click={(e) => e.preventDefault()}
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
			{#if data.slot.helpers.length}
				<hr />
				<p class="unstyled text-lg">{$_('label.assigned_helpers')}</p>
				<div class="flex flex-col">
					{#each data.slot.helpers as helper, i (helper.id)}
						<form method="POST" action="/api?/remove_helper" use:enhance={handleRemoveHelper(i)}>
							<input type="hidden" name="slot_id" value={data.slot.id} />
							<input type="hidden" name="user_id" value={helper.id} />
							<div class="grid grid-cols-[auto_1fr] gap-x-4 items-center">
								<span
									>{helper.name} ({helper.openings.map((opening) => opening.name).join(', ')})</span
								>
								<button
									type="button"
									class="btn btn-icon-sm"
									on:click={removeHelperModals[i]?.show}
								>
									<Icon icon={x_mark} viewBoxHeight={24} viewBoxWidth={24} size={24} />
								</button>
							</div>
							<Modal bind:modal={removeHelperModals[i]}>
								<div class="p-8 space-y-4 flex flex-col">
									<p class="unstyled text-xl pr-4">
										{$_('page.edit_slot.confirm_delete_helper', { values: { name: helper.name } })}
									</p>
									<button type="submit" class="btn variant-filled-error">
										<Icon icon={trash} viewBoxHeight={24} viewBoxWidth={24} />
										<span>{$_('label.delete')}</span>
									</button>
								</div>
							</Modal>
						</form>
					{/each}
				</div>
			{/if}
			<button type="submit" disabled={loading} class="btn variant-filled-primary w-full">
				{$_('label.save')}
			</button>
		</form>
	</div>
</div>
