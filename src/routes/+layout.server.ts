import { getServerSession } from '@supabase/auth-helpers-sveltekit'
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const session = await getServerSession(event);
  event.locals.session = session;
  return {
    session: await getServerSession(event), 
  };
}