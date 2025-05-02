<script lang="ts">
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
	import { Button, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import { CogOutline } from 'flowbite-svelte-icons';

	let activeUrl = $derived(page.url.pathname);

	let session = page.data.session;
</script>

<div class="relative px-8 md:py-2 mt-16 md:mt-14">
	<Navbar navContainerClass="w-full m-0" class="fixed w-full z-20 top-0 start-0 border-b">
		<!-- Anki workshop logo -->
		<NavBrand href="/">
			<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="Anki workshop logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>Anki Workshop</span
			>
		</NavBrand>
		<NavHamburger />

		<NavUl
			{activeUrl}
			ulClass="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-2 px-2 md:py-2 mt-4 md:mt-0"
		>
			<NavLi class="text-sm md:text-base" href="/">卡组</NavLi>
			<NavLi class="text-sm md:text-base" href="/common-faq">常见问题</NavLi>
			<NavLi class="text-sm md:text-base" href="/contact">联系</NavLi>
			<NavLi class="text-sm md:text-base" href="/about">关于</NavLi>
			<div class="flex gap-3 flex-col md:flex-row items-center">
				{#if session}
					<span>{session.user?.name}</span>
					<a
						class="text-center font-medium focus-within:ring-4 focus-within:outline-hidden items-center justify-center px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 rounded-lg inline-flex gap-1"
						color="light"
						href="/dashboard"
					>
						<CogOutline />
						管理后台</a
					>
				{:else}
					<a
						class="text-center font-medium focus-within:ring-4 focus-within:outline-hidden items-center justify-center px-4 py-2 text-sm text-white bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 focus-within:ring-primary-300 dark:focus-within:ring-primary-800 rounded-lg"
						href="/register">注册</a
					>
					<a
						class="text-center font-medium focus-within:ring-4 focus-within:outline-hidden items-center justify-center px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 rounded-lg inline-flex"
						color="light"
						href="/login">登录</a
					>
				{/if}
			</div>
		</NavUl>
	</Navbar>
</div>
