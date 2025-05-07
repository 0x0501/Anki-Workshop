<!-- Error Page (error code 404) -->

<script lang="ts">
	import { page } from '$app/state';
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';

	import { A, Heading, P } from 'flowbite-svelte';

	const { data } = $props();

</script>

<HomeNavigation system_settings={data.system_settings}/>

<svelte:head>
	<title>Anki workshop | 出错啦</title>
</svelte:head>

<div class="flex flex-grow items-center justify-center pt-20">
	<div class="flex flex-col items-center gap-3">
		<Heading tag="h2" class="text-center">{page.status}</Heading>

		<P>错误（{page.error?.message}）: {page.url.pathname}</P>
		<A href='/'>返回主页</A>
	</div>
</div>
