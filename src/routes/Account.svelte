<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import type { AuthSession } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import Avatar from './Avatar.svelte';

	export let session: AuthSession;

	let loading = false;
	let full_name: string | null = null;
	let avatarUrl: string | null = null;

	onMount(() => {
		getProfile();
	});

	const getProfile = async () => {
		try {
			loading = true;
			const { user } = session;

			const { data: userData, error, status } = await supabase
				.from('profiles')
				.select(`full_name, avatar_url`)
				.eq('id', user.id)
				.single();

			if (userData) {
				full_name = userData.full_name;
				avatarUrl = userData.avatar_url;
			}

			if (error && status !== 406) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

	async function updateProfile() {
		try {
			loading = true;
			const { user } = session;

			const updates = {
				id: user.id,
				full_name,
				avatar_url: avatarUrl,
				updated_at: new Date()
			};

			let { error } = await supabase.from('profiles').upsert(updates);

			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function signOut() {
		try {
			loading = true;
			let { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<form use:getProfile class="form-widget" on:submit|preventDefault={updateProfile}>
  <Avatar bind:url={avatarUrl} size={10} on:upload={updateProfile} />
	<div>
		<label for="email">Email</label>
		<input type="text" id="email" value={session.user.email} disabled />
	</div>
	<div>
		<label for="username">Name</label>
		<input type="text" id="username" bind:value={full_name} />
	</div>

	<div>
		<input
			type="submit"
			value={loading ? 'Loading...' : 'Update'}
			class="button block primary"
			disabled={loading}
		/>
	</div>

  <div>
    <button class="button block" on:click={signOut} disabled={loading}>Sign Out</button>
  </div>
</form>
