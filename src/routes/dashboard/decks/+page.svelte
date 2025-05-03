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
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { RESTfulApiBase } from '$lib/api';
	import { goto, invalidateAll } from '$app/navigation';

	/**
	 * @description Description of a deck, used for sale on the home page.
	 */
	type DeckItem = {
		deck_name: string;
		/**
		 * @description Represent a unique deck
		 */
		id: number;
		deck_description: string;
		deck_tags: string[];
		/**
		 * @description The size of the current deck
		 */
		deck_size: number;
		deck_card_count: number;
		/**
		 * @description The price of the current deck, double type.
		 * @example 18.99
		 */
		deck_price: number;

		/**
		 * @description Date indicate the last update date of the current deck
		 */
		last_updated_date: string;

		/**
		 * @description Date indicate the create date of the current deck
		 */
		created_date: number;

		/**
		 * @description Whether the current deck is on sale.
		 */
		is_deck_on_sale: boolean;

		/**
		 * @description An integer represents the author
		 */
		deck_author_id: string;

		/**
		 * @description An integer represents how many people liked this deck
		 */
		deck_liked_by_people: number;

		/**
		 * @description The cover image of the deck, a secure https link should provided.
		 */
		deck_cover_image_url: string;

		supportPlatform: supportPlatformOption;
	};

	// Get data from +page.server.ts
	const { data }: PageProps = $props();
	console.log(data);

	const deckData = $state(data.data as DeckItem[]);

	let currentSelectedDeckId = $state<number[]>([]);

	let isEditable = $derived(currentSelectedDeckId.length === 1 ? true : false);

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
				item.deck_name.includes(filterInputValue) ||
				item.deck_description.includes(filterInputValue)
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

	const handleDeckDelete = async (event: Event) => {
		event.preventDefault();

		const payload = {
			ids: currentSelectedDeckId
		};

		try {
			const response = await fetch(`${RESTfulApiBase}/decks/delete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			// TODO: fix deck id auto increment issue, when a deck is deleted, the id should automatically update
			// when deck id 1 is removed, deck id 2 should be id 1
			if (response.ok) {
				// refresh data by invoke `load` function
				// TODO: fix the bug, when deck deleted, the page should refresh
				await invalidateAll();

				console.log('Deck delete successfully:', result);
			} else {
				console.error('Failed to delete deck:', result);
				// TODO: handle error, e.g., show error message to user
			}
		} catch (error) {
			console.error('Error during deck creation:', error);
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
			<Button size="sm" color="blue" disabled={!isEditable}>编辑</Button>
			<Button size="sm" color="red" disabled={!isDeletable} onclick={handleDeckDelete}>删除</Button>
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
						<Checkbox oninput={handleItemChecked} value={item.id} />
					</TableHeadCell>
					<TableBodyCell>{item.id}</TableBodyCell>
					<TableBodyCell
						>{item.deck_name.length > 10
							? item.deck_name.substring(0, 10) + '...'
							: item.deck_name}</TableBodyCell
					>
					<TableBodyCell>{item.deck_price}</TableBodyCell>
					<TableBodyCell>{(item.deck_size / 1024).toFixed(2)}MB</TableBodyCell>
					<TableBodyCell>{item.deck_card_count}</TableBodyCell>
					<TableBodyCell>{item.supportPlatform}</TableBodyCell>
					<TableBodyCell>
						{#if item.is_deck_on_sale}
							<Badge color="green">已上架</Badge>
						{:else}
							<Badge color="pink">已下架</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>{item.last_updated_date}</TableBodyCell>
					<TableBodyCell>{item.created_date}</TableBodyCell>
					<TableBodyCell class="inline-flex flex-row gap-2">
						<A href={`/dashboard/decks/edit/${item.id}`}>编辑</A>
						<A>更新</A>
						<A>下架</A>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>
