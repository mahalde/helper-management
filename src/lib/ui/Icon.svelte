<script lang="ts">
	export let size = 24;
  export let viewBoxWidth: number | undefined;
  export let viewBoxHeight: number | undefined;
	export let icon: string;
  export let color = 'currentColor';
  export let fill = false;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="{fill ? color : 'none'}"
	viewBox="0 0 {viewBoxWidth ?? size} {viewBoxHeight ?? size}"
	style="width:{size}px; height:{size}px; stroke: {color}"
	class="stroke-current flex-shrink-0"
>
	<path stroke-linecap="round" stroke-linejoin="round" d={icon} />
</svg>
