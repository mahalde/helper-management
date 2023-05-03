<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { notifications } from '$lib/stores';
	import { PERMISSIONS, type Modal as ModalType, type Slot, type SlotCategory } from '$lib/types';
	import { getDateFormatter, getTimeFormatter } from '$lib/utils';
	import { isBefore, isSameDay } from 'date-fns';
	import { locale, _ } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import {
		calendar,
		catering,
		chevron_right,
		document_duplicate,
		dressage,
		information_circle,
		minus,
		obstacle,
		pencil_square,
		plus,
		trash,
		user_circle
	} from './icons';
	import Modal from './Modal.svelte';

	export let slot: Slot;
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

	const dateFormatter = getDateFormatter($locale, true);
	const timeFormatter = getTimeFormatter($locale);

	let confirmDeleteModal: ModalType | undefined;

	let isContact: boolean;
	$: isContact = slot.contacts.some((contact) => contact.id === $page.data.session?.user.id);
	let additionalFieldsModal: ModalType | undefined;
	function needsAdditionalInformation(): boolean {
		if (alreadyHelper) {
			return false;
		}

		return isContact || (slot.additional_fields.length > 0 && !alreadyHelper);
	}

	let additionalHelperInfoModal: ModalType | undefined;
	async function fetchAdditionalHelperInfo() {
		const { data } = await $page.data.supabase
			.from('selected_slots')
			.select('user_id,selected_on,additional_field_data')
			.eq('slot_id', slot.id)
			.in(
				'user_id',
				slot.helpers.map((helper) => helper.id)
			);

		const information = data?.map((row) => ({
			helper: slot.helpers.find((helper) => helper.id === row.user_id),
			selected_on: new Date(row.selected_on),
			information: row.additional_field_data
		}));
		additionalHelperInfoModal?.show(information);
	}

	let expiredSlotModal: ModalType | undefined;
	function slotExpired() {
		if ($page.data.permissions.includes(PERMISSIONS.SLOT_CREATE)) {
			return false;
		}

		return (
			slot.category === 'dressage' ||
			(isBefore(slot.start_time, new Date(2023, 4, 2)) &&
				(alreadyHelper || !slot.max_helpers || slot.helpers.length < slot.max_helpers))
		);
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
			additionalFieldsModal?.hide();
			confirmDeleteModal?.hide();
		};
	};

	let endDate: string;
	$: startDate = dateFormatter.format(slot.start_time);
	$: if (isSameDay(slot.start_time, slot.end_time)) {
		endDate = timeFormatter.format(slot.end_time);
	} else {
		endDate = dateFormatter.format(slot.end_time);
	}
	$: alreadyHelper = slot.helpers.some((helper) => helper.id === $page.data.session?.user.id);
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
			{$_(`label.${slot.category}`)} &centerdot; {startDate} &ndash; {endDate}
		</div>
	</div>
	<span class="text-lg dark:text-white">
		{slot.name}
	</span>
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
			<a class="btn btn-sm variant-ringed-secondary" href="/create-slot?duplicateSlotId={slot.id}">
				<Icon icon={document_duplicate} viewBoxWidth={24} viewBoxHeight={24} />
				<span>{$_('label.copy_slot')}</span>
			</a>
			<form method="POST" action="/api?/delete_slot" use:enhance={handleSubmit}>
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
							{$_('component.slot.confirm_delete', { values: { name: slot.name } })}
						</p>
						<button type="submit" class="btn variant-filled-error">
							<Icon icon={trash} viewBoxHeight={24} viewBoxWidth={24} />
							<span>{$_('label.delete')}</span>
						</button>
					</div>
				</Modal>
			</form>
			<a class="btn btn-sm variant-ringed-secondary" href="/edit-slot/{slot.id}">
				<Icon icon={pencil_square} viewBoxHeight={24} viewBoxWidth={24} />
				<span>{$_('label.edit')}</span>
			</a>
		{/if}
		{#if slotExpired()}
			<button class="btn btn-sm variant-glass-primary self-end" on:click={expiredSlotModal?.show}>
				<span
					><Icon icon={alreadyHelper ? minus : plus} viewBoxHeight={24} viewBoxWidth={24} /></span
				>
				{$_(alreadyHelper ? 'label.remove_helper' : 'label.add_helper')}
			</button>
			<Modal bind:modal={expiredSlotModal}>
				<div class="p-4 space-y-4 flex flex-col">
					<p>{$_('component.slot.expired')}</p>
					<div class="grid grid-cols-[auto_1fr] gap-x-4 text-gray-500 dark:text-gray-300">
						{#each slot.contacts as contact (contact.id)}
							<span>{contact.name}</span>
							<span
								>(<a class="!text-primary-500" href="tel:{contact.phone}">{contact.phone}</a>)</span
							>
						{/each}
					</div>
				</div>
			</Modal>
		{:else}
			<form
				method="POST"
				action={`/api?/${alreadyHelper ? 'remove_helper' : 'add_helper'}`}
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
				{:else if !slot.max_helpers || slot.helpers.length < slot.max_helpers}
					<button
						type={needsAdditionalInformation() ? 'button' : 'submit'}
						on:click={() => {
							if (needsAdditionalInformation()) additionalFieldsModal?.show();
						}}
						disabled={loading}
						class="btn btn-sm variant-glass-primary w-fit gap-2 self-end"
					>
						<span><Icon icon={plus} viewBoxHeight={24} viewBoxWidth={24} /></span>
						{$_('label.add_helper')}
					</button>
				{/if}
				{#if needsAdditionalInformation()}
					<Modal bind:modal={additionalFieldsModal}>
						<div class="p-4 space-y-4 flex flex-col">
							{#if isContact}
								<p class="unstyled text-xl mb-2">{$_('label.additional_helper')}</p>
								<p>{$_('component.slot.additional_helper')}</p>
								<label class="label">
									<span>{$_('label.name')}</span>
									<input type="text" name="additional_helper_name" class="input" />
								</label>
								<label class="label">
									<span>{$_('label.phone')}</span>
									<input type="text" name="additional_helper_phone" class="input" />
								</label>
							{/if}
							{#if slot.additional_fields.length}
								<p class="unstyled text-xl mb-2">{$_('label.additional_fields')}</p>
								<p>{$_('component.slot.additional_fields')}</p>
							{/if}
							{#each slot.additional_fields as field (field.id)}
								<label class="label">
									<p>
										{field.name}
										{#if field.description}
											<span class="text-gray-500">({field.description})</span>
										{/if}
									</p>
									{#if field.type === 'text'}
										<input
											type="text"
											name="additional_field_{field.id}"
											required={!field.optional}
											class="input"
										/>
									{/if}
								</label>
							{/each}
							<button type="submit" class="btn variant-glass-primary gap-2">
								<span><Icon icon={plus} viewBoxHeight={24} viewBoxWidth={24} /></span>
								{$_('label.add_helper')}
							</button>
						</div>
					</Modal>
				{/if}
			</form>
		{/if}
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
	{#if withHelpers}
		<hr class="my-2" />
		<span class="mb-2">
			{#if slot.helpers.length}
				{$_('label.assigned_helpers')}
			{/if}
			{#if slot.helpers.length < slot.min_helpers}
				{#if slot.helpers.length}
					&verbar;
				{/if}
				{$_('label.num_of_helpers_needed', {
					values: { num: slot.min_helpers - slot.helpers.length }
				})}
			{:else if slot.max_helpers}
				({slot.helpers.length}/{slot.max_helpers})
			{/if}
		</span>
		{#each slot.helpers as helper (helper.id)}
			<p>{helper.name}</p>
		{/each}
	{/if}
</div>

{#if $page.data.permissions.includes(PERMISSIONS.SLOT_CREATE) && slot.helpers.length}
	<Modal bind:modal={additionalHelperInfoModal} let:data>
		<div class="p-4 pr-16">
			<h2>{$_('component.slot.additional_helper_info')}</h2>
			{#each data ?? [] as informationRow (informationRow.helper.id)}
				<div class="mt-8 text-gray-500 mb-2">
					<div class="flex gap-2">
						<Icon icon={user_circle} viewBoxHeight={24} viewBoxWidth={24} />
						{informationRow.helper.name}
					</div>
					<div class="flex gap-2">
						<Icon icon={calendar} viewBoxHeight={24} viewBoxWidth={24} />
						{dateFormatter.format(informationRow.selected_on)}
					</div>
				</div>
				{#each slot.additional_fields as field (field.id)}
					<div class="flex flex-col mb-4">
						<div class="flex flex-row items-center">
							<Icon icon={chevron_right} viewBoxHeight={24} viewBoxWidth={24} size={16} />
							{field.name}: {field.description}
							{field.optional ? `(${$_('label.optional')})` : ''}
						</div>
						<span
							>{informationRow?.information.find((info) => info.key === field.id)?.value ??
								$_('label.no_answer')}</span
						>
					</div>
				{/each}
			{/each}
		</div>
	</Modal>
{/if}
