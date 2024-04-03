<script lang="ts">
	import Icon from './Icon.svelte';
	import { x_mark } from './icons';

	export const modal = {
		show(data?: unknown) {
			modalData = data;
			modalEl?.setAttribute('aria-hidden', 'false');
			modalEl?.classList.remove('hidden');
		},
		hide() {
			modalEl?.setAttribute('aria-hidden', 'true');
			modalEl?.classList.add('hidden');
		}
	};
	let modalData: any | undefined;
	let modalEl: HTMLDivElement;
</script>

<div bind:this={modalEl} aria-hidden="true" class="hidden fixed inset-0 z-10 overflow-y-auto">
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
	<div class="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
		<div
			class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
		>
			<button type="button" on:click|preventDefault={modal.hide} class="absolute right-3 top-3">
				<Icon icon={x_mark} viewBoxHeight={24} viewBoxWidth={24} size={32} />
			</button>
			<slot data={modalData} />
		</div>
	</div>
</div>
