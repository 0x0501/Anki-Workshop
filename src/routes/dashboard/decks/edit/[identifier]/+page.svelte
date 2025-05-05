<script lang="ts">
	import { page } from '$app/state';
	import DeckEditor from '$lib/components/DeckEditor.svelte';

	let { data } = $props();

	let currentEditDeckId = Number(page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1));

	let currentEditDeck = data.deck_data.filter((item) => item.id === currentEditDeckId)[0];
</script>

<DeckEditor editorType="Edit" deckData={currentEditDeck} />
