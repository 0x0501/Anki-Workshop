<script lang="ts">
	import { page } from '$app/state';
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';
	import { Heading, P, A } from 'flowbite-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Anki workshop | 无权访问</title>
</svelte:head>

<HomeNavigation system_settings={data.system_settings} />

<div class="flex flex-grow items-center justify-center pt-20">
	<div class="flex flex-col items-center gap-3">
		<Heading tag="h2" class="text-center">Unauthorized</Heading>

		<P class="text-gray-500">无权访问该页面，快回到主页继续学习吧~</P>
		<A href="/">返回主页</A>
	</div>
</div>
