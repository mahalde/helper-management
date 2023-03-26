import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import '$lib/i18n';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');
	
	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session,
		onAuthStateChange() {
			invalidate('supabase:auth');
		}
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	let permissions: string[] = [];

	if (session?.user.id) {
		permissions = await supabase
		.from('user_permissions')
			.select('permissions')
			.eq('user_id', session?.user.id)
			.then(({ data }) => data?.flatMap(row => row.permissions) ?? []);
	}

	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { supabase, session, permissions };
};
