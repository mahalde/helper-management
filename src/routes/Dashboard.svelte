<script lang="ts">
	import { notifications } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import type { Slot } from '$lib/types';
	import UISlot from '$lib/ui/Slot.svelte';
	import type { AuthSession } from '@supabase/supabase-js';
	import { _ } from 'svelte-i18n';

  export let session: AuthSession;

  let yourSlots: Slot[];
  let allSlots: Slot[] = [];

  const getSlots = async () => {
    const { data, error } = await supabase
      .from('slots_with_helpers')
      .select<'*', Slot>('*');

    if (error) {
      notifications.error(error.message);
      return;
    }

    allSlots = data.map(slot => ({
      ...slot,
      start_time: new Date(slot.start_time),
      end_time: new Date(slot.end_time),
    }));

    allSlots.sort((slotA, slotB) => slotA.start_time.getTime() - slotB.start_time.getTime());
  }

  $: yourSlots = allSlots.filter(slot => slot.helpers.some(helper => helper.id === session.user.id));
</script>

<div class="m-4">
  <h4 class="dark:text-white">{$_('page.dashboard.your_times')}</h4>
  {#if yourSlots?.length}
    <div class="flex flex-col max-w-fit gap-2">
      {#each yourSlots as slot (slot.id)}
        <UISlot {slot} withHelpers={false} />
      {/each}
    </div>
  {:else}
    <p class="dark:text-white">{$_('page.dashboard.no_times')}</p>
  {/if}
  <h4 class="mt-4 mb-2 dark:text-white">{$_('page.dashboard.all_times')}</h4>
  <div class="flex flex-col max-w-fit gap-2">
    {#each allSlots as slot (slot.id)}
      <UISlot {slot} />
    {/each}
  </div>
  <button on:click={getSlots} class='btn variant-filled-primary'>Get Slots</button>
</div>
