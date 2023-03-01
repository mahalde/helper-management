<script lang="ts">
	import { notifications } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import Icon from '$lib/ui/Icon.svelte';
	import { log_out, user, user_circle } from '$lib/ui/icons';
	import { AppBar, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import Auth from './Auth.svelte';
	import Dashboard from './Dashboard.svelte';

	export let data: PageData;

	const userPopupSetting: PopupSettings = {
		event: 'click',
		target: 'userPopup'
	};

	const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      notifications.error(error.message, 5000);
    }
  };
</script>

<svelte:head>
	<title>Helfereinteilung Turnier Höven 2023</title>
	<meta
		name="description"
		content="Helfereinteilung für das Turnier des Reitervereins Höven 2023"
	/>
</svelte:head>

{#if !data.session}
	<Auth />
{:else}
	<AppBar slotTrail="justify-end" background="bg-secondary-500" shadow="shadow-md">
		<h2 class="text-white">Helfereinteilung</h2>
		<div slot="trail" use:popup={userPopupSetting}>
			<Icon
				class="cursor-pointer"
				color="white"
				icon={user_circle}
				viewBoxHeight={24}
				viewBoxWidth={24}
				size={40}
			/>
		</div>
	</AppBar>
  <div class="overflow-auto">
    <Dashboard session={data.session} />
  </div>
{/if}

<div data-popup="userPopup" class="card variant-ringed-primary bg-white">
	<nav class="list-nav">
		<ul>
			<li>
				<a href="account">
					<Icon icon={user} viewBoxHeight={24} viewBoxWidth={24} />
					<span class="flex-auto">{$_('popup.profile')}</span>
				</a>
			</li>
			<li class="!mt-0 border-t border-primary-500">
				<button class="w-full link justify-between" on:click={logout}>
					<Icon icon={log_out} viewBoxHeight={24} viewBoxWidth={24} />
					<span>{$_('popup.log_out')}</span>
				</button>
			</li>
		</ul>
	</nav>
</div>
