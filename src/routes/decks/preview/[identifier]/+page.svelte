<script lang="ts">
	import { Button, Hr } from 'flowbite-svelte';

	const { data } = $props();

	let deckPreviewCode = $state(data.deckPreviewCode.data);

	// true: front/ false: back
	let currentDisplayCode = $state(true);

	let iframeElement: HTMLIFrameElement; // 1. Declare a variable to hold the iframe reference

	// 2. Function to write content to the iframe
	function updateIframeContent(htmlContent: string) {
		if (iframeElement && iframeElement.contentDocument) {
			const doc = iframeElement.contentDocument;
			doc.open();
			// Construct the full HTML document including styles and scripts
			const fullHtml = `
                <!DOCTYPE html>
                <html>
                    ${htmlContent}
                </html>
            `;

			doc.writeln(fullHtml);
			doc.close();
		}
	}

	// 3. Use $effect to update iframe when data changes
	$effect(() => {
		if (deckPreviewCode) {
			updateIframeContent(JSON.parse(deckPreviewCode.deck_front_preview_code));
		}
	});

	const changeDisplayCode = (_: Event) => {
		currentDisplayCode = false;
		updateIframeContent(JSON.parse(deckPreviewCode.deck_back_preview_code));
	};
</script>

<div class="flex flex-col h-180">
	<iframe title="Deck Preview" bind:this={iframeElement} class="w-full h-full">
		<p>Your browser does not support iframes.</p>
	</iframe>
	<div class="fixed bottom-0 left-0 w-full bg-white p-2 shadow-md z-50">
		<hr class="-ml-2 -mr-2 border-t border-gray-300 my-2" />
		<div class="flex gap-3 items-center justify-around">
			{#if currentDisplayCode}
				<Button size="sm" class="bg-red-700 grow focus-within:ring-0" onclick={changeDisplayCode}
					>忘记</Button
				>
				<Button size="sm" class="bg-orange-600 grow focus-within:ring-0" onclick={changeDisplayCode}
					>困难</Button
				>
				<Button size="sm" class="bg-green-600 grow focus-within:ring-0" onclick={changeDisplayCode}
					>良好</Button
				>
				<Button size="sm" class="bg-blue-600 grow focus-within:ring-0" onclick={changeDisplayCode}
					>容易</Button
				>
			{:else}
				<Button
					size="sm"
					class="grow focus-within:ring-0 bg-blue-500"
					onclick={() => {
						currentDisplayCode = true;
						updateIframeContent(JSON.parse(deckPreviewCode.deck_front_preview_code));
					}}>返回正面</Button
				>
			{/if}
		</div>
	</div>
</div>
