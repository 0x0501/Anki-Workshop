<script lang="ts">
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';

	let { children, data } = $props();
</script>

<HomeNavigation system_settings={data.system_settings} />

{@render children()}
