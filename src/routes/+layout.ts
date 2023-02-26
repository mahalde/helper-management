import { browser } from '$app/environment';
import '$lib/i18n';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	const { session } = await getSupabase(event);
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { session };
};
