<script lang="ts">
	import HomeNavigation from '$lib/components/HomeNavigation.svelte';
	import { Blockquote, Footer, Heading, Hr, P } from 'flowbite-svelte';

	let { data } = $props();
</script>

<HomeNavigation system_settings={data.system_settings} />

<div class="py-12 px-4 flex flex-col items-center gap-3">
    <img alt="Anki workshop Logo" src="/logo.png" class="size-36 lg:size-64"/>
    <Heading tag="h4" class="text-center">欢迎来到 Anki Workshop —— 你的高效学习加速器！</Heading>
    <div class="grow">
        <P justify>
        
            在这里，我们致力于打造高质量、精心设计的 Anki 记忆卡片（Flashcards）和模板，帮助学生、语言学习者、专业人士更轻松、更有系统地掌握知识。无论你是备考医学、法律、外语，还是想要提升自己的技能，Anki Workshop 都为你提供结构清晰、科学记忆的学习资源。
        </P>
    
        <Blockquote class="text-gray-600">
            "Crafting Smarter Flashcards for Smarter Learning."
    （为更聪明的学习，打造更智慧的记忆卡片）
        </Blockquote>
    </div>

    <Footer class="fixed bottom-0 start-0 px-2 pb-3 text-sm text-gray-500 w-full">
        <Hr hrClass="h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"/>
        注意：Anki Workshop 是独立运营的第三方平台，所提供的内容与服务并非由 Anki 官方开发或运营，我们与其无任何隶属关系或商业利益关联。Anki 是 Anki Inc. 的注册商标。
    </Footer>
</div>
