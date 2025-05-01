<script lang="ts">
	import DeckGallery, { type DeckItem } from '$lib/components/DeckGallery.svelte';
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';
	import {
		Button,
		Search,
		Footer,
		FooterBrand,
		FooterCopyright,
		FooterIcon,
		FooterLink,
		FooterLinkGroup
	} from 'flowbite-svelte';

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

<div>
	<HomeNavigation />
	<div class="flex items-center justify-center py-4 md:py-8 flex-wrap gap-3 mx-auto">
		<!-- filter buttons -->
		<div class="flex flex-row flex-wrap justify-center gap-3">
			<Button pill size="md" value="all" onclick={categoryChanged} class="text-xs py-2 md:text-sm"
				>全部</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="postgraduate"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">考研</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="civilServiceExam"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">考公</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="obtainCert"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">考证</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="english"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">英语</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="middleSchool"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">初中</Button
			>
			<Button
				pill
				size="md"
				color="alternative"
				value="highSchool"
				onclick={categoryChanged}
				class="text-xs py-2 md:text-sm">高中</Button
			>
		</div>
		<form class="flex gap-3">
			<Search size="md" class="items-center min-w-xs " />
			<Button class="hidden sm:block p-2.5! me-1 sm:w-25">搜索</Button>
		</form>
	</div>
	<div class="pl-4 pr-4">
		<DeckGallery
			class="grid gap-4 grid-cols-2 md:grid-cols-4"
			items={images}
			category={categoryChosen}
		/>
	</div>
	<!-- footer -->
	<Footer class="text-center mt-3 px-3 py-4 border-t-1 border-gray-300">
		<div class="sm:flex sm:items-center sm:justify-between">
			<FooterCopyright href="/" by="Anki Workshop" year={2025} />
		</div>
	</Footer>
</div>
