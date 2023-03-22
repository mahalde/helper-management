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

	const permissions: string[] = await supabase
		.from('user_permissions')
		.select('permissions')
		.eq('user_id', session?.user.id)
		.single()
		.then(({ data }) => data?.permissions);

	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { supabase, session, permissions };
};
