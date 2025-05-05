<script lang="ts">
	import { page } from '$app/state';
	import type { DeckData } from '../../routes/+layout.server';

	export interface DeckGalleryProps {
		class?: string;
		items: DeckData[];
		tag?: string; // Add category prop
	}
	let props: DeckGalleryProps = $props();

	// Filtering logic moved to CSS class toggling below
</script>

<div class={`grid grid-cols-2 md:grid-cols-3 gap-4 ${props.class}`}>
	{#each props.items as deck (deck.id)}
		<a
			class="flex flex-col justify-center align-middle gap-3"
			class:hidden={props.tag && !deck.deck_tags?.includes(props.tag)}
			href={`${page.url.pathname}decks/${deck.id}`}
		>
			<img class="h-auto max-w-full rounded-lg" src={'/front.jpg'} alt={deck.deck_name} />
			<p class="font-normal text-gray-700 leading-tight">{deck.deck_name}</p>
		</a>
	{/each}
</div>
