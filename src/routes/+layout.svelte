<script lang="ts">
	import {
		Alert,
		Button,
		ImagePlaceholder,
		Navbar,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Skeleton,
		TextPlaceholder
	} from 'flowbite-svelte';

	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	let activeUrl = $derived(page.url.pathname);
</script>

<div class="relative px-8 pt-16">
	<Navbar>
		<Navbar class="px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b">
			<!-- Anki workshop logo -->
			<NavBrand href="/">
				<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="Anki workshop logo" />
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>Anki Workshop</span
				>
			</NavBrand>
			<NavHamburger />
			<!-- Login/Register button group -->
			<div class="flex md:order-2 gap-3.5">
				<Button size="sm" class="hidden md:block" href="/register">注册</Button>
                <Button size="sm" color="light" href="/login">登录</Button>
			</div>

			<NavUl {activeUrl}>
				<NavLi href="/decks">卡组</NavLi>
				<!-- <NavLi href="/bench">工作台</NavLi> -->
				<NavLi href="/tutorial">模板制作</NavLi>
				<NavLi href="/common-faq">常见问题</NavLi>
				<NavLi href="/contact">联系</NavLi>
				<NavLi href="/about">关于</NavLi>
			</NavUl>
		</Navbar>
	</Navbar>
</div>



{@render children()}
