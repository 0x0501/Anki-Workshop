<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { Avatar, Button } from 'flowbite-svelte';
	import { AngleLeftOutline, HeartOutline, HeartSolid } from 'flowbite-svelte-icons';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
	import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
	import { deckNavState } from '$lib/deckNavState.svelte';
	import { page } from '$app/state';
	import { FontAwesomeIcon } from 'fontawesome-svelte';

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

	library.add(faHeartSolid, faHeartRegular);

	const changeDeckLikeStatus = () => {
		deckNavState.isDeckLikeByCurrentUser = !deckNavState.isDeckLikeByCurrentUser;

		if (deckNavState.isDeckLikeByCurrentUser == false) {
			deckNavState.deckLikeByPeople -= 1;

			// TODO: actual deck like logic
		} else {
			deckNavState.deckLikeByPeople += 1;
		}
	};

	const settings = data.system_settings;
</script>

<!-- navigation only render for `/decks/inspect` and `/decks/preview`-->
{#if page.route.id?.startsWith('/decks') || page.route.id?.startsWith('/decks/preview/')}
	<div
		class="flex items-center gap-3 justify-between pr-4 md:pr-6 py-3 divide-gray-200 dark:divide-gray-700 border-gray-200 dark:border-gray-700 border-b"
	>
		<!-- back to decks -->
		<a
			class="border-0 px-4"
			href={page.url.pathname.includes('preview')
				? '/decks/' + page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)
				: '/'}
			type="button"><AngleLeftOutline /></a
		>
		<!-- deck title -->
		<p class="hidden md:block flex-grow text-left">{deckNavState.deckTitle}</p>
		<div class="inline-flex gap-3">
			{#if settings.enable_deck_favorite_func}
				<button
					class="md:min-w-25 justify-end border-0 hover focus:outline-0 focus:border-0 gap-2 p-0 mt-1 font-medium text-sm inline-flex items-center hover:text-primary-700"
					onclick={changeDeckLikeStatus}
				>
					{#if deckNavState.isDeckLikeByCurrentUser}
						<span class="text-primary-700"
							><FontAwesomeIcon icon={faHeartSolid} size="lg" /> &nbsp;已收藏 ({deckNavState.deckLikeByPeople})</span
						>
					{:else}
						<FontAwesomeIcon icon={faHeartRegular} size="lg" />收藏 ({deckNavState.deckLikeByPeople})
					{/if}
				</button>
			{/if}

			<!-- if user logged in display avatar -->
			{#if data.session}
				<Avatar size="md" />
			{/if}
		</div>
	</div>
{/if}

{@render children()}
