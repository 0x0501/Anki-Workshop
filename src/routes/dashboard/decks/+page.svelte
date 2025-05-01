<script lang="ts">
	import type { supportPlatformOption } from '$lib/interfaces/supportPlatformOption';
	import { formatDateFromTimestamp } from '$lib/utils/helper';

	import {
		A,
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Pagination,
		Search,
		TabItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	/**
	 * @description Description of a deck, used for sale on the home page.
	 */
	interface DeckItem {
		deckName: string;
		/**
		 * @description Represent a unique deck
		 */
		deckId: number;
		deckDescription: string;
		deckTags: string[];
		/**
		 * @description The size of the current deck
		 * @example 112341
		 */
		deckSize: number;
		deckCount: number;
		/**
		 * @description The price of the current deck, double type.
		 * @example 18.99
		 */
		deckPrice: number;

		/**
		 * @description Unix time stamp indicate the last update date of the current deck
		 * @example 1745923720
		 */
		LastUpdateDate: number;

		/**
		 * @description Unix time stamp indicate the create date of the current deck
		 * @example 1745923720
		 */
		CreatedDate: number;

		/**
		 * @description Whether the current deck is on sale.
		 */
		isDeckOnSale: boolean;

		/**
		 * @description An integer represents the author
		 */
		deckAuthorId?: string;

		/**
		 * @description An integer represents how many people liked this deck
		 */
		deckLikedByPeople?: number;

		/**
		 * @description The cover image of the deck, a secure https link should provided.
		 */
		deckCoverImageUrl?: string;

		supportPlatform: supportPlatformOption;
	}

	const deckData: DeckItem[] = $state(
		(() => {
			const dataArray: DeckItem[] = [];
			let i = 0;
			while (i <= 1000) {
				dataArray.push({
					deckName: '测试卡组',
					deckId: i,
					deckDescription:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget magna a turpis lobortis ullamcorper vitae sit amet est. Vivamus posuere sagittis condimentum. Pellentesque nunc nisi, elementum ut quam vel, vehicula scelerisque lorem. Sed urna tellus, venenatis non lectus et, tempor scelerisque magna. Maecenas non enim facilisis, efficitur ligula non, malesuada sapien. Suspendisse non mauris venenatis lorem maximus eleifend. Sed pretium risus quam, non efficitur nibh ullamcorper sed. Donec diam libero, finibus id massa a, cursus pulvinar orci. Maecenas mauris metus, mollis quis euismod vel, mattis a sapien. Phasellus eget velit in lectus blandit luctus. Fusce nisi elit, tempor vitae sapien a, posuere placerat metus.',
					deckTags: ['英语', '考研'],
					deckSize: Math.round(Math.random() * 1000),
					deckCount: 20,
					deckPrice: 39.98,
					LastUpdateDate: 1745923720,
					CreatedDate: 1745923720,
					isDeckOnSale: true,
					supportPlatform: { platform: 'All' }
				});
				i++;
			}
			return dataArray;
		})()
	);

	deckData.push({
		deckName: '判断题',
		deckId: 1001,
		deckDescription:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget magna a turpis lobortis ullamcorper vitae sit amet est. Vivamus posuere sagittis condimentum. Pellentesque nunc nisi, elementum ut quam vel, vehicula scelerisque lorem. Sed urna tellus, venenatis non lectus et, tempor scelerisque magna. Maecenas non enim facilisis, efficitur ligula non, malesuada sapien. Suspendisse non mauris venenatis lorem maximus eleifend. Sed pretium risus quam, non efficitur nibh ullamcorper sed. Donec diam libero, finibus id massa a, cursus pulvinar orci. Maecenas mauris metus, mollis quis euismod vel, mattis a sapien. Phasellus eget velit in lectus blandit luctus. Fusce nisi elit, tempor vitae sapien a, posuere placerat metus.',
		deckTags: ['英语', '考研'],
		deckSize: Math.round(Math.random() * 1000),
		deckCount: 20,
		deckPrice: 39.98,
		LastUpdateDate: 1745923720,
		CreatedDate: 1745923720,
		isDeckOnSale: false,
		supportPlatform: { platform: 'All' }
	});

	let currentSelectedDeckId = $state<number[]>([]);

	let isEditible = $derived(currentSelectedDeckId.length === 1 ? true : false);

	let isDeletable = $derived(currentSelectedDeckId.length >= 1 ? true : false);

	let filterInputValue = $state<string>('');

	let displayedDeckData: DeckItem[] = $derived(deckData);

	const handleItemChecked = (event: Event) => {
		const checkbox = event.target as HTMLInputElement;
		const deckId = parseInt(checkbox.value, 10);

		if (checkbox.checked) {
			if (!currentSelectedDeckId.includes(deckId)) {
				currentSelectedDeckId = [...currentSelectedDeckId, deckId];
			}
		} else {
			currentSelectedDeckId = currentSelectedDeckId.filter((id) => id !== deckId);
		}
	};

	const handleTableFilter = (event: Event) => {
		event.preventDefault();
		// Filter the original deckData based on the current input value
		const filtered = deckData.filter(
			(item) =>
				item.deckName.includes(filterInputValue) || item.deckDescription.includes(filterInputValue)
		);
		// Update the state variable that controls the table's data source
		displayedDeckData = filtered;
	};

	const handleTableInput = (event: Event) => {
		const input = event.target as HTMLInputElement;

		if (input.value.length === 0) {
			displayedDeckData = deckData;
		}
	};
</script>

<div class="flex flex-col">
	<Heading tag="h4" class="mb-2">所有卡组</Heading>

	<div class="flex mb-3 pr-3 justify-between py-2 items-center">
		<form class="inline-flex gap-2 items-center">
			<Search
				size="md"
				class="w-sm"
				bind:value={filterInputValue}
				placeholder="搜索卡组名称"
				oninput={handleTableInput}
			></Search>
			<!-- TODO: implemnet search feature -->
			<Button size="sm" onclick={handleTableFilter}>搜索</Button>
		</form>
		<div>
			<Button size="sm" href="/dashboard/decks/new">新增</Button>
			<Button size="sm" color="blue" disabled={!isEditible}>编辑</Button>
			<Button size="sm" color="red" disabled={!isDeletable}>删除</Button>
		</div>
	</div>
	<Table
		divClass="relative overflow-x-auto overflow-y-auto h-150"
		items={displayedDeckData}
		hoverable={true}
		striped={true}
	>
		<TableHead
			class="text-center"
			theadClass="text-xs uppercase sticky top-0 bg-gray-100 dark:bg-gray-800 z-10"
		>
			<TableHeadCell class="p-4!">
				<Checkbox />
			</TableHeadCell>
			<TableHeadCell>ID</TableHeadCell>
			<TableHeadCell>名称</TableHeadCell>
			<TableHeadCell>价格 (￥)</TableHeadCell>
			<TableHeadCell>卡组大小</TableHeadCell>
			<TableHeadCell>卡片数量</TableHeadCell>
			<TableHeadCell>支持平台</TableHeadCell>
			<TableHeadCell>当前状态</TableHeadCell>
			<TableHeadCell>修改日期</TableHeadCell>
			<TableHeadCell>创建日期</TableHeadCell>
			<TableHeadCell>操作</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each displayedDeckData.slice(0, 200) as item}
				<TableBodyRow slot="row" class="text-center">
					<!-- TODO: truncate text when it too long. -->
					<TableHeadCell class="p-4!">
						<Checkbox oninput={handleItemChecked} value={item.deckId} />
					</TableHeadCell>
					<TableBodyCell>{item.deckId}</TableBodyCell>
					<TableBodyCell
						>{item.deckName.length > 10
							? item.deckName.substring(0, 10) + '...'
							: item.deckName}</TableBodyCell
					>
					<TableBodyCell>{item.deckPrice}</TableBodyCell>
					<TableBodyCell>{(item.deckSize / 1024).toFixed(2)}MB</TableBodyCell>
					<TableBodyCell>{item.deckCount}</TableBodyCell>
					<TableBodyCell>{item.supportPlatform.platform}</TableBodyCell>
					<TableBodyCell>
						{#if item.isDeckOnSale}
							<Badge color='green'>已上架</Badge>
						{:else}
							<Badge color='pink'>已下架</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>{formatDateFromTimestamp(item.LastUpdateDate)}</TableBodyCell>
					<TableBodyCell>{formatDateFromTimestamp(item.CreatedDate)}</TableBodyCell>
					<TableBodyCell class="inline-flex flex-row gap-2">
						<A href={`/dashboard/decks/edit/${item.deckId}`}>编辑</A>
						<A>更新</A>
						<A>下架</A>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>
