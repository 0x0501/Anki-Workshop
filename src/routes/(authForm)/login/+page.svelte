<script lang="ts">
	import { enhance } from '$app/forms';
	import { A, Button, Checkbox, Heading, Helper, Input, Label, Li, List } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline, CloseOutline, CheckOutline } from 'flowbite-svelte-icons';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { signIn } from '@auth/sveltekit/client';
	import { onMount } from 'svelte';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
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

	// Redirect if already logged in
	onMount(() => {
		if (page.data.session) {
			console.log(page.data.session);
			goto('/'); // Or dashboard
		}
	});

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

	async function handleSignIn() {
		isSubmitting = true;
		formError = '';
		try {
			// Use the client-side signIn function
			const result = await signIn('credentials', {
				// Use the ID of your CredentialsProvider
				username: username,
				password: userPassword,
				redirect: false // Important: Handle redirect/error manually
			});

			if (result?.error) {
				// Handle errors returned from the authorize function or network issues
				console.error('Sign in error:', result.error);
				// Map common errors to user-friendly messages
				if (result.error === 'CredentialsSignin') {
					formError = 'Invalid username or password.';
				} else {
					formError = 'Login failed. Please try again.';
				}
			} else if (result?.ok) {
				// Sign-in successful, redirect manually
				await goto('/'); // Redirect to home or intended page
				// SvelteKit's $page store will update automatically due to session change
			} else {
				// Handle unexpected cases
				formError = 'An unknown error occurred during login.';
			}
		} catch (e) {
			console.error('Exception during sign in:', e);
			formError = 'An unexpected error occurred.';
		} finally {
			isSubmitting = false;
		}
	}

	// let props: AuthFormProps = $props();
</script>

<div class="flex justify-center">
	<form
		method="POST"
		use:enhance={async ({ cancel }) => {
			cancel(); // Prevent default form submission

			// TODO: actual register logic goes here
			isSubmitting = true;
			formError = ''; // Clear previous errors

			// Perform client-side validation before attempting sign-in
			// alternative using zod to verify username and password.
			validateUsernameLoginCriteria({ target: { value: username } } as any);
			validatePasswordLoginCriteria({ target: { value: userPassword } } as any);

			if (usernameValidationErrorMessage || passwordValidationErrorMessage) {
				isSubmitting = false;
				return;
			}

			const result = await signIn('credentials', {
				username,
				password: userPassword,
				redirect: false // Prevent automatic redirect, handle it manually
			});

			if (result?.error) {
				// Handle errors returned from the authorize function or network issues
				// Map common errors to user-friendly messages
				if (result.error === 'CredentialsSignin') {
					formError = '用户名或密码不正确';
				} else {
					formError = '登录失败，请稍后重试';
				}
			} else {
				// Redirect on successful login, e.g., to the dashboard
				// You might want to use goto from '$app/navigation' here
				// import { goto } from '$app/navigation';

				// console.log('Login successful!'); // Placeholder for successful login
				await goto('/', { invalidateAll: true });
			}

			isSubmitting = false;
		}}
	>
		<div class="grid gap-3 mb-6 w-xs md:w-sm mt-10">
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
			{#if formError !== ''}
				<Helper color="red">{formError}</Helper>
			{/if}
			<Button
				type="submit"
				disabled={username === '' ||
					userPassword === '' ||
					usernameValidationErrorMessage !== '' ||
					isSubmitting}>登录</Button
			>
			<div class="text-sm flex justify-between">
				<A href="/register">立即注册</A>
				<A href="/resetAccount">找回密码</A>
			</div>
		</div>
	</form>
</div>
