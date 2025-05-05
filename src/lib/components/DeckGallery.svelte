<script lang="ts">
	import { page } from '$app/state';
	import type { DeckData } from '../../routes/+layout.server';

	export interface DeckGalleryProps {
		class?: string;
		items: DeckData[];
		tag?: string; // Add category prop
		searchKeywords: string;
	}
	let props: DeckGalleryProps = $props();

	const filteredItems: DeckData[] = $derived.by(() => {
		return props.items.filter((deck) => {
			const tagMatch = props.tag ? deck.deck_tags?.includes(props.tag) : true;
			const searchMatch = props.searchKeywords
				? deck.deck_name.toLowerCase().includes(props.searchKeywords.toLowerCase()) ||
				  deck.deck_description.toLowerCase().includes(props.searchKeywords.toLowerCase())
				: true;

			return tagMatch && searchMatch;
		});
	});
</script>

<div class={`grid gap-4 ${props.class}`}>
	{#each filteredItems as deck (deck.id)}
		<a
			class="flex flex-col justify-center align-middle gap-3"
			href={`${page.url.pathname}decks/${deck.id}`}
		>
			<img class="h-auto max-w-full rounded-lg" src={deck.deck_cover_image_url} alt={deck.deck_name} />
			<p class="font-normal text-gray-700 leading-tight">{deck.deck_name}</p>
		</a>
	{/each}
</div>
