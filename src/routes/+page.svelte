<script lang="ts">
	import DeckGallery from '$lib/components/DeckGallery.svelte';
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';
	import { Button, Search, Footer, FooterCopyright } from 'flowbite-svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let deckData = $state(data.deck_data);

	let searchKeywords = $state('');

	let deckTags = $derived.by(() => {
		let rawTags = deckData.map((item) => {
			return (JSON.parse(item.deck_tags ?? '') as Array<string>).join(' ');
		});
		return Array.from(new Set(rawTags));
	});

	let tagChosen = $state('');

	const categoryChanged = (event: any) => {
		// console.log(event.target.value);
		tagChosen = event.target.value;
	};
</script>

<svelte:head>
	<title>Anki Workshop | 发现和分享高质量Anki卡组与模板</title>
	<meta name="description" content="在 Anki Workshop 探索海量用户分享的 Anki 卡组与专业设计的模板。提升学习效率，轻松记忆，支持多种学科和语言。" />
</svelte:head>

<div>
	<HomeNavigation system_settings={data.system_settings}/>
	<div class="flex items-center justify-center py-4 md:py-8 flex-wrap gap-3 mx-auto">
		<!-- filter buttons -->
		<div class="flex flex-row flex-wrap justify-center gap-3">
			<Button
				pill
				color={tagChosen === '' ? 'primary' : 'alternative'}
				size="md"
				value=""
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">全部</Button
			>
			{#each deckTags as item}
				<Button
					pill
					size="md"
					color={tagChosen === item ? 'primary' : 'alternative'}
					value={item}
					onclick={categoryChanged}
					class="text-xs py-2 md:text-sm">{item}</Button
				>
			{/each}
		</div>
		<div class="flex gap-3">
			<Search size="md" class="items-center min-w-xs " bind:value={searchKeywords} />
		</div>
	</div>
	<div class="pl-4 pr-4">
		<DeckGallery
			class="grid gap-4 grid-cols-2 sm:grid-cols-4 xl:grid-cols-6"
			items={deckData}
			tag={tagChosen}
			{searchKeywords}
		/>
	</div>
	<!-- footer -->
	<Footer class="text-center mt-3 px-3 py-4 border-t-1 border-gray-300">
		<div class="sm:flex sm:items-center sm:justify-between">
			<FooterCopyright href="/" by="Anki Workshop" year={2025} />
		</div>
	</Footer>
</div>
