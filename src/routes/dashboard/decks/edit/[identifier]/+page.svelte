<script lang="ts">
	import { page } from "$app/state";
	import { Breadcrumb, BreadcrumbItem, Heading } from "flowbite-svelte";

    
</script>
<div>
    <Heading tag="h4" class="mb-2">编辑卡组</Heading>
    <Breadcrumb aria-label="Default breadcrumb example">
		<BreadcrumbItem href="/dashboard/decks" home>
            卡组管理
        </BreadcrumbItem>
		<BreadcrumbItem href="#edit">
            编辑</BreadcrumbItem>
	</Breadcrumb>
</div>