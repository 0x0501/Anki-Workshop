<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { Button } from 'flowbite-svelte';
	import { AngleLeftOutline, HeartOutline } from 'flowbite-svelte-icons';
	import { deckNavState } from '$lib/deckNavState.svelte';
	import { page } from '$app/state';

	let {
		data,
		children,
		deckTitle = $bindable(),
		deckLikeByPeople = $bindable()
	}: {
		data: LayoutData;
		children: Snippet;
		deckTitle: string;
		deckLikeByPeople: number;
	} = $props();
</script>

<!-- navigation only render for `/decks/inspect` and `/decks/preview`-->
{#if page.route.id?.startsWith('/decks/inspect/') || page.route.id?.startsWith('/decks/preview/')}
	<div class="flex items-center gap-3 justify-between pr-4 md:pr-6">
		<!-- back to decks -->
		<a class="border-0 px-4" href="/decks" type="button"><AngleLeftOutline /></a>
		<!-- deck title -->
		<p class="hidden md:block">{deckNavState.deckTitle}</p>
		<Button class="border-0 hover focus:outline-0 focus:border-0 gap-2 p-0 mt-1" outline
			><HeartOutline size="lg" />收藏 ({deckNavState.deckLikeByPeople})</Button
		>
	</div>
{/if}

{@render children()}
