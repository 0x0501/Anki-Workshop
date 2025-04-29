<script lang="ts">
	import { enhance } from '$app/forms';
	import { A, Button, Checkbox, Heading, Helper, Input, Label, Li, List } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline, CloseOutline, CheckOutline } from 'flowbite-svelte-icons';
	import type { SvelteHTMLElements } from 'svelte/elements';
	/**
	 * @description The username, used for login
	 */
	let username = $state('');

	/**
	 * @description The password of user's account
	 */
	let userPassword = $state('');

	/**
	 * @description whether display the password when, default hidden
	 */
	let isShowPassword = $state(false);

	/**
	 * @description Submitting error from server
	 */
	let formError = $state('');

	let userAgreementAndTerm = $state(true);

	/**
	 * @description Remember login status, within 7days no password will be required.
	 */
	let rememberLoginStatus = $state(false);

	/**
	 * @description Submitting Status (local)
	 */
	let isSubmitting = $state(false);

	/**
	 * @description Username login validation rules:
	 *
	 * 1. Username must be at least 6 length, and maximum 15 length; and username must not be any empty space.
	 * 2. Username can only contain uppercase, lowercase, numbers, no special is allowed.
	 */
	let usernameValidationErrorMessage = $state('');

	/**
	 * @description Password login validation rules, same as username login validation.
	 */
	let passwordValidationErrorMessage = $state('');

	const validateUsernameLoginCriteria = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const usernameRegex = /\s/;

		usernameValidationErrorMessage = !input.value
			? '用户名不能为空'
			: usernameRegex.test(input.value)
				? '用户名不能包含空格'
				: '';
	};

	const validatePasswordLoginCriteria = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const usernameRegex = /\s/;

		passwordValidationErrorMessage = !input.value
			? '密码不能为空'
			: usernameRegex.test(input.value)
				? '密码不能包含空格'
				: '';
	};

	const handleFormSubmit = (event: Event) => {
		event.preventDefault();
		console.log(userAgreementAndTerm);
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
	>
		<div class="grid gap-3 mb-6 w-xs md:w-sm">
			<Heading tag="h4" class="text-center">登录</Heading>
			<div class="flex gap-2 flex-col">
				<Label for="username">用户名</Label>
				<Input
					type="text"
					id="username"
					placeholder="爱吃炸鱼的小丸子"
					required
					maxlength={15}
					bind:value={username}
					oninput={validateUsernameLoginCriteria}
				/>
				{#if usernameValidationErrorMessage !== ''}
					<Helper color="red">{usernameValidationErrorMessage}</Helper>
				{/if}
			</div>
			<div class="flex gap-2 flex-col">
				<Label for="password">密码</Label>
				<Input
					type={isShowPassword ? 'text' : 'password'}
					id="password"
					required
					color={passwordValidationErrorMessage !== '' ? 'red' : 'base'}
					bind:value={userPassword}
					oninput={validatePasswordLoginCriteria}
					maxlength={18}
				>
					<button
						slot="right"
						class="pointer-events-auto"
						onclick={() => (isShowPassword = !isShowPassword)}
					>
						{#if isShowPassword}
							<EyeOutline class="w-6 h-6" />
						{:else}
							<EyeSlashOutline class="w-6 h-6" />
						{/if}
					</button>
				</Input>
				{#if passwordValidationErrorMessage !== ''}
					<Helper color="red">{passwordValidationErrorMessage}</Helper>
				{/if}
			</div>
			<Checkbox bind:checked={rememberLoginStatus}>7天免登录</Checkbox>
			<Button
				type="submit"
				disabled={username === '' || userPassword === '' || usernameValidationErrorMessage !== ''}
				>登录</Button
			>
			<div class="text-sm flex justify-between">
				<A href="/register">立即注册</A>
				<A href="/resetAccount">找回密码</A>
			</div>
		</div>
	</form>
</div>
