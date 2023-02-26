<script lang="ts">
	import type { NotificationType } from '$lib/types';
	import Icon from './Icon.svelte';
	import { check_circle, exclamation_triangle, information_circle, x_circle } from './icons';

	export let message: string;
	export let type: NotificationType;

	const iconMap: Record<NotificationType, string> = {
		info: information_circle,
		success: check_circle,
		warning: exclamation_triangle,
		error: x_circle
	};

	const varianClassMap: Record<NotificationType, string> = {
		info: 'variant-ghost-primary',
		success: 'variant-ghost-success',
		warning: 'variant-ghost-warning',
		error: 'variant-ghost-error'
	};

	$: icon = iconMap[type];
	$: variantClass = varianClassMap[type];
</script>

<aside class="alert {variantClass}">
	<Icon viewBoxHeight={24} viewBoxWidth={24} {icon} />
	<p class="alert-message">{message}</p>
</aside>
