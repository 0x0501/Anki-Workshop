<script>
	import {
		Avatar,
		Dropdown,
		DropdownItem,
		P,
		Sidebar,
		SidebarWrapper,
		SidebarGroup,
		SidebarItem,
		A
	} from 'flowbite-svelte';

	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faArrowRightFromBracket, faGear, faBell } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from 'fontawesome-svelte';
	import { ChartPieSolid, ObjectsColumnSolid } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';

	library.add(faArrowRightFromBracket, faGear, faBell);

	let activeUrl = $derived(page.url.pathname);

	let { children } = $props();
</script>

<!-- header -->
<div
	class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 flex items-center gap-3 justify-between px-4 md:pr-8 py-3 divide-gray-200 dark:divide-gray-700 border-gray-200 dark:border-gray-700 border-b"
>
	<!-- back to decks -->
	<P weight="bold" class="text-gray-600"
		><A href="/" class="no-underline hover:no-underline text-gray-600">Anki workshop</A></P
	>
	<div class="inline-flex gap-3 items-center">
		<!-- <button class="inline-flex flex-col items-center text-xs">
			<FontAwesomeIcon icon={faBell} class="text-gray-600" size="lg" />
		</button> -->
		<div class="inline-flex cursor-pointer items-center gap-3" id="userAvatar">
			<img alt="User avatar" class="size-10 rounded-full" src={page.data.session?.user.image}/>
			<!-- user's nickname -->
			<span class="block text-sm text-gray-900 dark:text-white"
				>{page.data.session?.user?.name}</span
			>
		</div>

		<Dropdown triggeredBy="#userAvatar">
			<DropdownItem
				class="inline-flex gap-2 items-center justify-between"
				onclick={async () => await goto('/dashboard/personal')}
			>
				<FontAwesomeIcon icon={faGear} />
				账号设置
			</DropdownItem>
			<DropdownItem
				slot="footer"
				class="inline-flex gap-2 items-center justify-between"
				onclick={() => signOut({ redirect: true, redirectTo: '/' })}
			>
				<FontAwesomeIcon icon={faArrowRightFromBracket} />
				退出账号
			</DropdownItem>
		</Dropdown>
	</div>
</div>
<div class="grid grid-cols-12 p-2 pl-3 pt-20">
	<Sidebar
		activeClass="flex items-center p-2 text-base font-normal text-primary-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-gray-700"
		asideClass="col-span-full lg:col-span-2"
		{activeUrl}
	>
		<SidebarWrapper>
			<SidebarGroup>
				<SidebarItem label="网站设置" href="/dashboard">
					<svelte:fragment slot="icon">
						<ChartPieSolid
							class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
				<!-- <SidebarItem label="主页设置">
					<svelte:fragment slot="icon">
						<UserCircleSolid
							class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem> -->
				<!-- <SidebarItem label="我的贴子">
					<svelte:fragment slot="icon">
						<NewspaperSolid
							class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem> -->
				<SidebarItem label="卡组管理" href="/dashboard/decks">
					<svelte:fragment slot="icon">
						<ObjectsColumnSolid
							class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
				<!-- <SidebarItem label="退出账号">
					<svelte:fragment slot="icon">
						<ArrowRightToBracketOutline
							class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem> -->
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
	<div class="col-span-full lg:col-span-10 py-2 px-4">
		{@render children()}
	</div>
</div>
