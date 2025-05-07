<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deckNavState } from '$lib/deckNavState.svelte';
	import { formatDateFromTimestamp } from '$lib/utils/helper';
	import { Avatar, Badge, Button, Heading, Hr, Li, List, Modal, P, Tooltip } from 'flowbite-svelte';
	import { BadgeCheckSolid, CheckOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';

	const { data } = $props();
	const settings = data.system_settings;

	// if deck price is zero(0), display it as free.

	const currentSelectedDeckId = Number(
		page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)
	);

	const currentSelectedDeckData = $state(
		data.deck_data.filter((item) => item.id === currentSelectedDeckId)[0]
	);

	const deckSupportPlatform = $derived.by(() => {
		const sup = JSON.parse(currentSelectedDeckData.support_platform) as Array<string>;

		if (sup.includes('All')) {
			return ['Windows', 'MacOS', 'iOS', 'Android'];
		} else {
			return sup;
		}
	});

	const authorBio = 'Learning everything in Anki.';

	// whether current user followed the deck author
	let isFollowedAuthor = $state(true);
	// whether current user was official account
	let isOfficialAccount = true;

	let isPurchaseModelDisplay = $state(false);

	const changeFollowStatus = () => {
		isFollowedAuthor = !isFollowedAuthor;
	};

	const handleImportDeckToAnki = () => {
		isPurchaseModelDisplay = true;
	};

	const handleDeckPurchase = () => {
		window.location.href = currentSelectedDeckData.deck_purchase_link;
	};

	// update navbar

	deckNavState.deckTitle = currentSelectedDeckData.deck_name;
	deckNavState.deckLikeByPeople = currentSelectedDeckData.deck_liked_by_people ?? 0;
	deckNavState.isDeckLikeByCurrentUser = false;
</script>

<div class="flex flex-col md:flex-row p-4 gap-6">
	<!-- deck preview and specification -->
	<!-- <div class="p-4 flex"> -->
	<!-- deck preview -->
	<div class="min-w-xs md:w-sm order-2 md:order-1">
		<img class="rounded-md" src={currentSelectedDeckData.deck_cover_image_url} alt="牌组预览图" />
		<div class="flex-col gap-3 mt-3 just hidden md:flex lg:hidden">
			<Button color="alternative" class="w-auto" onclick={handleImportDeckToAnki}
				>一键导入Anki（.apkg）</Button
			>
			<Button
				color="alternative"
				class="w-auto"
				href={`/decks/preview/${page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)}`}
				>预览</Button
			>
			{#if settings.enable_online_study_func}
				<Button color="blue" class="w-auto">在线学习</Button>
			{/if}
		</div>
	</div>

	<div class="w-full order-1 md:order-2 flex flex-col gap-3">
		<!-- deck author -->
		<div class="flex gap-3 items-center">
			<!-- the avatar of deck author -->
			{#if currentSelectedDeckData.deck_author_image === null || currentSelectedDeckData.deck_author_image === '' || currentSelectedDeckData.deck_author_image === undefined}
				<Avatar class="size-12" />
			{:else}
				<img
					class="size-10 sm:size-12 rounded-full"
					alt="牌组作者头像"
					src={data.session?.user.image}
				/>
			{/if}

			<div class="inline-flex flex-col justify-center grow">
				<!-- author nickname -->
				<div class="text-sm md:text-lg font-bold inline-flex gap-1 items-center">
					{currentSelectedDeckData.deck_author_name}
					{#if isOfficialAccount}
						<BadgeCheckSolid color="#1677ff" class="size-4 md:size-5" />
						<Tooltip class="text-xs sm:text-sm">官方账号</Tooltip>
					{/if}
				</div>
				<!-- author bio -->
				<span class="text-gray-500 text-xs sm:text-sm md:text-md">{authorBio}</span>
			</div>
			{#if settings.enable_user_follow_func}
				{#if isFollowedAuthor}
					<Button
						class="min-w-20 h-8 px-2 md:h-10 self-center gap-1 text-xs sm:text-sm"
						color="alternative"
						onclick={changeFollowStatus}><CheckOutline />已关注</Button
					>
				{:else}
					<Button
						class="min-w-16 h-8 px-2 md:h-10 self-center text-xs sm:text-sm"
						onclick={changeFollowStatus}>关注</Button
					>
				{/if}
			{/if}
		</div>

		<div class="text-wrap text-justify">
			<p class="font-bold block md:hidden">{currentSelectedDeckData.deck_name}</p>
			<p class="">
				{currentSelectedDeckData.deck_description}
			</p>
		</div>
		<div class="flex flex-col col-span-full md:order-3 gap-3">
			<div class="inline-flex gap-1 gap-y-1.5 md:gap-3 flex-wrap">
				标签：
				{#each JSON.parse(currentSelectedDeckData.deck_tags ?? '[]') as badge}
					<Badge>{badge}</Badge>
				{/each}
			</div>
			<div
				class="flex-col gap-2 lg:flex-row text-gray-500 inline-flex justify-between font-normal text-sm"
			>
				<span>卡片数量：{currentSelectedDeckData.deck_card_count}</span>
				<span>最后更新日期：{currentSelectedDeckData.last_updated_date}</span>
			</div>
			<!-- Price -->
			<div class="-mt-2">
				<span class="text-sm text-gray-500">价格: ￥{currentSelectedDeckData.deck_price}</span>
			</div>
			<Hr hrClass="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700 block md:hidden lg:block" />
		</div>

		<!-- deck specification -->
		<div class="order-3 grid grid-cols-6 gap-3">
			<!-- Support platform -->
			<div class="col-span-full md:col-span-2 lg:col-span-1 md:mt-0 md:hidden lg:block">
				<Heading tag="h2" class="mb-2 text-base font-semibold text-gray-900 dark:text-white"
					>支持平台：</Heading
				>
				<List tag="ul" class="space-y-1 text-gray-500 dark:text-gray-400">
					{#each deckSupportPlatform as platform (platform)}
						<Li>{platform}</Li>
					{/each}
				</List>
			</div>
			<!-- button group for download, preview and import -->
			<div
				class="col-span-full md:col-span-3 lg:col-span-2 2xl:col-span-1 flex-col gap-3 mt-3 md:mt-0 flex md:hidden lg:flex justify-center"
			>
				<Button
					color={settings.enable_online_study_func ? 'alternative' : 'blue'}
					class="w-auto"
					onclick={handleImportDeckToAnki}>一键导入Anki（.apkg）</Button
				>
				<Button
					color="alternative"
					class="w-auto"
					href={`/decks/preview/${page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)}`}
					>预览</Button
				>
				{#if settings.enable_online_study_func}
					<Button color="blue" class="w-auto">在线学习</Button>
				{/if}
			</div>
			<!-- how to import and use term -->
		</div>
	</div>
</div>

<Modal
	bind:open={isPurchaseModelDisplay}
	size="xs"
	autoclose
	placement="center"
	dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 h-full z-50 w-full p-4 flex"
>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			即将跳转到闲鱼APP进行购买
		</h3>
		<P class="py-2">点击下面的【确定】按钮会跳转到闲鱼商品链接，拍下商品后会自动发货。</P>
		<Button color="primary" class="me-2" onclick={handleDeckPurchase}>确定，我想要这个！</Button>
		<Button color="alternative">再考虑考虑</Button>
	</div>
</Modal>
