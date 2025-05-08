<script lang="ts">
	import { enhance } from '$app/forms';
	import { A, Button, Checkbox, Heading, Helper, Input, Label, Li, List } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline, CloseOutline, CheckOutline } from 'flowbite-svelte-icons';
	import type { SvelteHTMLElements } from 'svelte/elements';

	/**
	 * @description Submitting error from server
	 */
	let formError = $state('');

	/**
	 * @description Submitting Status (local)
	 */
	let isSubmitting = $state(false);

	/**
	 * @description User's email.
	 */
	let userEmail = $state('');

	/**
	 * @description User email validation error if has.
	 */
	let emailValidationErrorMessage = $state('');

	const validateEmailFormat = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		emailValidationErrorMessage =
			input.value.length === 0
				? '邮箱不能为空'
				: /\s/.test(input.value)
					? '邮箱不能包含空格'
					: !emailRegex.test(input.value)
						? '邮箱格式不正确'
						: '';
	};

	const handleFormSubmit = (event: Event) => {
		event.preventDefault();
	};

	// let props: AuthFormProps = $props();
</script>

<div class="flex justify-center">
	<form
		onsubmit={handleFormSubmit}
		method="POST"
		use:enhance={() => {
			// TODO: actual register logic goes here
			// isSubmitting
		}}
		novalidate
	>
		<div class="grid gap-3 mb-6 w-xs md:w-sm mt-10">
			<Heading tag="h4" class="text-center">找回密码</Heading>
			<div class="flex gap-2 flex-col">
				<Label for="username">邮箱</Label>
				<Input
					type="email"
					id="username"
					placeholder="example@test.com"
					required
					maxlength={15}
					bind:value={userEmail}
					oninput={validateEmailFormat}
				/>
				{#if true}
					<Helper color="red">{emailValidationErrorMessage}</Helper>
				{/if}
			</div>

			<Button type="submit" disabled={emailValidationErrorMessage !== '' || userEmail === ''}
				>重置密码</Button
			>
			<div class="text-sm flex justify-between">
				<A href="/login">返回登录</A>
			</div>
		</div>
	</form>
</div>


<svelte:head>
	<title>Anki Workshop | 找回密码</title>
</svelte:head>
