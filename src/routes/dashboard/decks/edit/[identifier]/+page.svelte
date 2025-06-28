<script lang="ts">
	import { page } from '$app/state';
	import DeckEditor, { type DeckEditData } from '$lib/components/DeckEditor.svelte';
	import type { decks } from '$lib/database/schema';
	import type { InferSelectModel } from 'drizzle-orm';

	type FullDeckData = InferSelectModel<typeof decks>;

	let { data } = $props();

	let currentEditDeckId = Number(page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1));

	let currentEditDeck = (data.data as FullDeckData[]).filter(
		(item) => item.id === currentEditDeckId
	)[0];
</script>

<DeckEditor editorType="Edit" deckData={currentEditDeck as unknown as DeckEditData} />
