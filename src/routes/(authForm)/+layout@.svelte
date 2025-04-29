<script lang="ts">
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';

	let { children } = $props();
</script>

<HomeNavigation />

{@render children()}
