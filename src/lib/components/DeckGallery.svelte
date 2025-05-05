<script lang="ts">
	import { page } from '$app/state';

	export interface DeckItem {
		// Image url
		src: string;
		// alternative name
		alt: string;
		// deck id
		identifier: string;
		// deck name
		name?: string;
		// deck description
		description?: string;
		// deck  category
		category?: string;
	}

	export interface DeckGalleryProps {
		class?: string;
		items: DeckItem[];
		category?: string; // Add category prop
	}
	let props: DeckGalleryProps = $props();

	// Filtering logic moved to CSS class toggling below
</script>

<div class={`grid grid-cols-2 md:grid-cols-3 gap-4 ${props.class}`}>
	{#each props.items as deck (deck.identifier)}
		{@const isVisible = !props.category || props.category === 'all' || deck.category === props.category}
		<a
			class="flex flex-col justify-center align-middle gap-3"
			class:hidden={!isVisible}
			href={`${page.url.pathname}decks/${deck.identifier}`}
		>
			<img class="h-auto max-w-full rounded-lg" src={deck.src} alt={deck.alt} />
			<p class="font-normal text-gray-700 leading-tight">{deck.alt}</p>
		</a>
	{/each}
</div>
