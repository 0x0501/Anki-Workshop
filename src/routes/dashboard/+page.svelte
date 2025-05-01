<script lang="ts">
	import { Heading, Label, Toggle } from 'flowbite-svelte';

    let allowUserRegister = $state(true);

    let enableShowingFollower = $state(true);

    let enableUserFollowFunc = $state(true);

    let enableDeckFavoriteFunc = $state(true)

</script>

<div class="flex flex-col">
    <Heading tag="h4" class="">网站设置</Heading>
    <div class="mt-5 flex gap-3 flex-col"> 
       <Toggle bind:checked={allowUserRegister}>允许用户注册</Toggle>
       <Toggle bind:checked={enableShowingFollower}>卡组页面显示粉丝数量</Toggle>
       <Toggle bind:checked={enableUserFollowFunc}>启用关注功能</Toggle>
       <Toggle bind:checked={enableDeckFavoriteFunc}>启用卡组收藏功能</Toggle>
    </div>
</div>


