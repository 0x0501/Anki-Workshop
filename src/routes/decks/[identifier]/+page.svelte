<script lang="ts">
	import { page } from '$app/state';
	import { deckNavState } from '$lib/deckNavState.svelte';
	import { formatDateFromTimestamp } from '$lib/utils/helper';
	import { Badge, Button, Heading, Hr, Li, List, Tooltip } from 'flowbite-svelte';
	import { BadgeCheckSolid, CheckOutline } from 'flowbite-svelte-icons';

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

	const changeFollowStatus = () => {
		isFollowedAuthor = !isFollowedAuthor;
	};

	// update navbar

	deckNavState.deckTitle = currentSelectedDeckData.deck_name;
	deckNavState.deckLikeByPeople = currentSelectedDeckData.deck_liked_by_people ?? 0;
	deckNavState.isDeckLikeByCurrentUser = false;
</script>

<div class="flex flex-col">
	<!-- deck preview and specification -->
	<div class="p-4 md:p-6 grid grid-cols-8 gap-6 @container">
		<!-- deck preview -->
		<div
			class="order-3 md:order-1 col-span-full md:col-span-2 min-w-1/3 min-h-150 md:min-h-130 bg-gray-300 rounded-md"
		></div>
		<div class="flex flex-col gap-3 order-0 md:order-2 col-span-full md:col-span-6 w-auto">
			<!-- deck author -->
			<div class="flex gap-3 items-center">
				<!-- the avatar of deck author -->
				<div class="size-10 xs:size-12 sm:size-15 md:size-20 rounded-full bg-gray-300"></div>
				<div class="inline-flex flex-col justify-center grow">
					<!-- author nickname -->
					<div class="text-sm md:text-lg font-bold inline-flex gap-1 items-center">
						{currentSelectedDeckData.deck_author_id}
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
				<p class="min-h-50">{currentSelectedDeckData.deck_description}</p>
			</div>
			<div class="flex flex-col col-span-full md:order-3 gap-3">
				<div class="inline-flex gap-1 gap-y-1.5 md:gap-3 flex-wrap">
					标签：
					{#each JSON.parse(currentSelectedDeckData.deck_tags ?? '[]') as badge}
						<Badge>{badge}</Badge>
					{/each}
				</div>
				<div
					class="flex-col gap-2 @lg:flex-row text-gray-500 inline-flex justify-between font-normal text-sm"
				>
					<span
						>卡组大小：{(currentSelectedDeckData.deck_size / 1024).toFixed(2)}M | 卡片数量：{currentSelectedDeckData.deck_card_count}</span
					>
					<span>最后更新日期：{currentSelectedDeckData.last_updated_date}</span>
				</div>
				<!-- Price -->
				<div>
					<span class="text-sm text-gray-500">价格: ￥{currentSelectedDeckData.deck_price}</span>
				</div>
				<Hr class="block md:hidden" hrClass="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
			</div>

			<!-- deck specification -->
			<div class="order-4 grid grid-cols-6">
				<!-- Support platform -->
				<div class="col-span-full md:col-span-1 md:mt-0">
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
				<div class="col-span-full md:col-span-2 flex flex-col gap-3 mt-3 md:mt-0 just">
					<Button color="alternative" class="md:w-3/4">一键导入Anki（.apkg）</Button>
					<Button
						color="alternative"
						class="md:w-3/4"
						href={`/decks/preview/${page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)}`}
						>预览</Button
					>
					<Button color="blue" class="md:w-3/4">在线学习</Button>
				</div>
				<!-- how to import and use term -->
			</div>
		</div>
	</div>
</div>
