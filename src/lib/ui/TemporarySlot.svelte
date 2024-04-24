<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { notifications } from '$lib/stores';
	import {
		PERMISSIONS,
		type Modal as ModalType,
		type SlotCategory,
		type TemporarySlot
	} from '$lib/types';
	import { getDateFormatter } from '$lib/utils';
	import { _, locale } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';
	import {
		catering,
		document_check,
		document_duplicate,
		dressage,
		exclamation_triangle,
		information_circle,
		minus,
		obstacle,
		pencil_square,
		plus,
		trash
	} from './icons';

	export let slot: TemporarySlot;
	export let withHelpers = true;

	const iconMap: Record<SlotCategory, string> = {
		catering,
		dressage,
		showjumping: obstacle
	};

	const borderColorMap: Record<SlotCategory, string> = {
		catering: 'border-l-primary-500',
		dressage: 'border-l-secondary-500',
		showjumping: 'border-l-success-500'
	};

	const dateFormatter = getDateFormatter($locale, false);

	let confirmDeleteModal: ModalType | undefined;
	let signUpModal: ModalType | undefined;
	let checkedOpenings = [];

	$: isContact = slot.contacts.some((contact) => contact.id === $page.data.session?.user.id);

	$: date = dateFormatter.format(slot.date);

	$: alreadyHelper = slot.helpers.some((helper) => helper.id === $page.data.session?.user.id);

	let additionalHelperInfoModal: ModalType | undefined;
	async function fetchAdditionalHelperInfo() {
		const { data } = await $page.data.supabase
			.from('selected_temporary_slot_openings')
			.select('user_id,selected_on,opening_id')
			.in(
				'opening_id',
				slot.openings.map((opening) => opening.id)
			);

		const information = data?.map((row) => ({
			helper: slot.helpers
				.filter((helper) => helper.id === row.user_id)
				.map((helper) => ({
					id: helper.id,
					name: helper.name,
					openings: slot.openings.find((opening) => opening.id === helper.opening_id)?.name ?? ''
				})),
			selected_on: new Date(row.selected_on)
		}));
		additionalHelperInfoModal?.show(information);
	}

	let loading = false;
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'failure' && result.data?.generalError) {
				notifications.error($_(result.data.generalError));
			} else if (result.type === 'success') {
				invalidate('helpermanagement:slots');
			}
			await applyAction(result);
			loading = false;
			confirmDeleteModal?.hide();
			signUpModal?.hide();
		};
	};
</script>

<div
	class="border border-gray-300 {borderColorMap[
		slot.category
	]} border-l-8 rounded-md flex flex-col p-2 shadow-sm"
>
	<div class="flex items-center text-gray-500 dark:text-gray-300 gap-2">
		<Icon
			icon={iconMap[slot.category]}
			viewBoxHeight={512}
			viewBoxWidth={512}
			size={32}
			fill={true}
		/>
		<div class="text-sm">
			{$_(`label.${slot.category}`)} &centerdot; {date} &centerdot; {$_(`label.${slot.timeslot}`)}
			<span class="flex items-center gap-1 text-error-500">
				<Icon viewBoxHeight={24} viewBoxWidth={24} icon={exclamation_triangle} />
				Vorläufig
			</span>
		</div>
	</div>
	<span class="text-lg dark:text-white">
		{slot.name}
	</span>
	<span class="mt-4 text-gray-500 dark:text-gray-300"> Arbeitsdienste </span>
	<ul class="ml-4">
		{#each slot.openings as opening}
			<li class="list-disc">{opening.name}</li>
		{/each}
	</ul>
	<div class="self-end flex gap-4 mt-2 flex-wrap justify-end">
		{#if $page.data.permissions.includes(PERMISSIONS.SLOT_CREATE)}
			{#if slot.helpers.length}
				<button
					type="button"
					on:click={fetchAdditionalHelperInfo}
					class="btn btn-sm variant-ringed-secondary"
				>
					<Icon icon={information_circle} viewBoxHeight={24} viewBoxWidth={24} />
				</button>
			{/if}
			<a
				class="btn btn-sm variant-ringed-secondary"
				href="/create-temporary-slot?duplicateSlotId={slot.id}"
			>
				<Icon icon={document_duplicate} viewBoxWidth={24} viewBoxHeight={24} />
				<span>{$_('label.copy_slot')}</span>
			</a>
			<form method="POST" action="/api?/delete_temporary_slot" use:enhance={handleSubmit}>
				<input type="hidden" name="slot_id" value={slot.id} />
				<button
					type="button"
					on:click={confirmDeleteModal?.show}
					class="btn btn-sm variant-ringed-error"
				>
					<Icon icon={trash} viewBoxHeight={24} viewBoxWidth={24} />
					<span>{$_('label.delete')}</span>
				</button>
				<Modal bind:modal={confirmDeleteModal}>
					<div class="p-4 space-y-4 flex flex-col">
						<p class="unstyled text-xl pr-4">
							{$_('component.temporary_slot.confirm_delete', { values: { name: slot.name } })}
						</p>
						<button type="submit" class="btn variant-filled-error">
							<Icon icon={trash} viewBoxHeight={24} viewBoxWidth={24} />
							<span>{$_('label.delete')}</span>
						</button>
					</div>
				</Modal>
			</form>
			<a class="btn btn-sm variant-ringed-secondary" href="/edit-temporary-slot/{slot.id}">
				<Icon icon={pencil_square} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('label.edit')}</span>
			</a>
			<a class="btn btn-sm variant-ringed-secondary" href="/convert-temporary-slot/{slot.id}">
				<Icon icon={document_check} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('label.convert')}</span>
			</a>
		{/if}
		<form
			method="POST"
			action={`/api?/${alreadyHelper ? 'remove_temporary_helper' : 'add_temporary_helper'}`}
			use:enhance={handleSubmit}
		>
			<input type="hidden" name="slot_id" value={slot.id} />
			{#if alreadyHelper}
				<button
					type="submit"
					disabled={loading}
					class="btn btn-sm variant-glass-secondary w-fit gap-2"
				>
					<span><Icon icon={minus} viewBoxHeight={24} viewBoxWidth={24} /></span>
					{$_('label.remove_helper')}
				</button>
			{:else}
				<button
					type="button"
					disabled={loading}
					class="btn btn-sm variant-glass-primary w-fit gap-2 self-end"
					on:click={signUpModal?.show}
				>
					<span><Icon icon={plus} viewBoxHeight={24} viewBoxWidth={24} /></span>
					{$_('label.add_helper')}
				</button>
				<Modal bind:modal={signUpModal}>
					<div class="p-4 space-y-4 flex flex-col">
						<h2>Vorläufig eintragen</h2>
						<p>
							Für welche Helferdienste im Zeitslot "{slot.name}" möchtest du dich vorläufig
							eintragen?
						</p>
					</div>
					<ul class="ml-4 mb-2">
						{#each slot.openings as opening}
							<li>
								<label>
									<input
										bind:group={checkedOpenings}
										class="checkbox variant-ringed-primary"
										type="checkbox"
										name="openings[]"
										value={opening.id}
									/>
									{opening.name}
								</label>
							</li>
						{/each}
						<button
							type="submit"
							class="btn variant-filled-primary mt-4"
							disabled={loading || checkedOpenings.length === 0}
						>
							{$_('label.add_helper')}
						</button>
					</ul>
				</Modal>
			{/if}
		</form>
	</div>
	{#if slot.contacts.length}
		<hr class="my-2" />
		<span class="text-gray-500 dark:text-gray-300 mb-2">
			{$_('label.contacts')}
		</span>
		<div class="grid grid-cols-[auto_1fr] gap-x-4 text-gray-500 dark:text-gray-300">
			{#each slot.contacts as contact (contact.id)}
				<span>{contact.name}</span>
				<span>(<a class="!text-primary-500" href="tel:{contact.phone}">{contact.phone}</a>)</span>
			{/each}
		</div>
	{/if}
	{#if withHelpers && slot.helpers.length}
		<hr class="my-2" />
		<span class="mb-2">
			{$_('label.temporary_helpers')}
		</span>
		{#each slot.helpers as helper (helper.id)}
			<p>{helper.name} ({helper.openings.map((opening) => opening.name).join(', ')})</p>
		{/each}
	{/if}
</div>
