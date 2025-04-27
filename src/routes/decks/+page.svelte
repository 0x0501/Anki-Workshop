<script lang="ts">
	import DeckGallery, { type DeckItem } from '$lib/components/DeckGallery.svelte';
	import { Button, Gallery, ImagePlaceholder, Search } from 'flowbite-svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	const images: DeckItem[] = [
		{
			alt: '【考研必备】马哲',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
			identifier: '12345678910',
			category: 'postgraduate'
		},
		{
			alt: 'small bag',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
			identifier: '123456758290',
			category: 'postgraduate'
		},
		{
			alt: 'plants',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
			identifier: '112345678390',
			category: 'postgraduate'
		},
		{
			alt: 'watch',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
			identifier: '012345678490',
			category: 'civilServiceExam'
		},
		{
			alt: 'shoe',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg',
			identifier: '12345657890',
			category: 'civilServiceExam'
		},
		{
			alt: 'shoes',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
			identifier: '12345678690'
		},
		{
			alt: 'small bag',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
			identifier: '1234567890'
		},
		{
			alt: 'plants',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
			identifier: '12347567890'
		},
		{
			alt: 'watch',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
			identifier: '12345867890'
		},
		{
			alt: 'shoe',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg',
			identifier: '12345679890'
		},
		{
			alt: 'shoes',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
			identifier: '12234567890'
		},
		{
			alt: 'small bag',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
			identifier: '12334567890'
		},
		{
			alt: 'plants',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
			identifier: '12345467890'
		},
		{
			alt: 'watch',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
			identifier: '12345567890'
		},
		{
			alt: 'shoe',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg',
			identifier: '123465567890'
		},
		{
			alt: 'shoes',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
			identifier: '12345677890',
			category: 'highSchool'
		},
		{
			alt: 'small bag',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
			identifier: '12345367890',
			category: 'highSchool'
		},
		{
			alt: 'plants',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
			identifier: '12345678390',
			category: 'english'
		},
		{
			alt: 'watch',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
			identifier: '123453678940',
			category: 'english'
		},
		{
			alt: 'shoe',
			src: 'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg',
			identifier: '12345647890',
			category: 'english'
		}
	];
	let categoryChosen = $state('all');

	const categoryChanged = (event: any) => {
		console.log(event.target.value);
		categoryChosen = event.target.value;
	};
</script>

<div class="flex items-center justify-center py-4 md:py-8 flex-wrap gap-3 mb-3 mx-auto">
	<Button pill size="md" value="all" onclick={categoryChanged}>全部</Button>
	<Button pill size="md" color="alternative" value="postgraduate" onclick={categoryChanged}
		>考研</Button
	>
	<Button pill size="md" color="alternative" value="civilServiceExam" onclick={categoryChanged}
		>考公</Button
	>
	<Button pill size="md" color="alternative" value="obtainCert" onclick={categoryChanged}
		>考证</Button
	>
	<Button pill size="md" color="alternative" value="english" onclick={categoryChanged}>英语</Button>
	<Button pill size="md" color="alternative" value="middleSchool" onclick={categoryChanged}
		>初中</Button
	>
	<Button pill size="md" color="alternative" value="highSchool" onclick={categoryChanged}
		>高中</Button
	>
	<form class="flex gap-3">
		<Search size="md" class="w-sm" />
		<Button class="p-2.5! me-1">搜索</Button>
	</form>
</div>
<div class="pl-4 pr-4">
	<DeckGallery
		class="grid gap-4 grid-cols-2 md:grid-cols-4"
		items={images}
		category={categoryChosen}
	/>
</div>
