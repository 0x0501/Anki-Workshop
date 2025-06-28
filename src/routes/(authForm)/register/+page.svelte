<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { A, Button, Checkbox, Heading, Helper, Input, Label, Li, List } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline, CloseOutline, CheckOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	// import type { SvelteHTMLElements } from 'svelte/elements';

	// interface AuthFormProps extends Partial<SvelteHTMLElements['form']> {
	// 	authType: 'Login' | 'Register';
	// }

	/**
	 * @description The username, used for login
	 */
	let username = $state('');

	/**
	 * @description The password of user's account
	 */
	let userPassword = $state('');

	/**
	 * @description Confirm password, must be equal to `userPassword`
	 */
	let userConfirmPassword = $state('');

	/**
	 * @description whether display the password when, default hidden
	 */
	let isShowPassword = $state(false);

	/**
	 * @description User's email.
	 */
	let userEmail = $state('');

	/**
	 * @description Password confirm error message if has.
	 */
	let isPassWordConfirmErrorMessage = $state('');

	/**
	 * @description Submitting error from server
	 */
	let formError = $state('');

	let userAgreementAndTerm = $state(true);

	/**
	 * @description Submitting Status (local)
	 */
	let isSubmitting = $state(false);

	/**
	 * @description Username validation rules:
	 *
	 * 1. Username must be at least 6 length, and maximum 15 length; and username must not be any empty space.
	 * 2. Username can only contain uppercase, lowercase, numbers, no special is allowed.
	 */
	let usernameValidationErrorMessage = $state('');

	/**
	 * @description Password validation array, must be all true when register.
	 *
	 * 1. Password must be at least 10 length
	 * 2. Password must contain uppercase, lowercase, numbers and special signs (@, #, $ .etc)
	 * 3. Password must not be any empty space.
	 */
	let PasswordValidationArray = $state([false, false, false]);

	// let PasswordValidationClassArray = $derived(
	// 	PasswordValidationArray.map((v) => (v ? 'text-green-600' : 'text-red-600'))
	// );

	// Redirect if already logged in
	onMount(() => {
		if (page.data.session) {
			goto('/'); // Or dashboard
		}
	});

	const getValidationColorScheme = (status: boolean) => {
		return status ? 'text-green-600' : 'text-red-600';
	};

	const validateUsernameCriteria = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const usernameRegex = /^[a-zA-Z0-9_]{6,}$/;

		usernameValidationErrorMessage = !input.value
			? '用户名不能为空'
			: !usernameRegex.test(input.value)
				? '用户名至少6个字符，只能包含字母、数字、下划线'
				: '';
	};

	const validateUserPasswordCriteria = (event: Event) => {
		const input = event.target as HTMLInputElement;

		// Array[0]: Criterion 1
		if (input.value.length >= 10) {
			PasswordValidationArray[0] = true;
		} else {
			PasswordValidationArray[0] = false;
		}

		// Array[1]: Criterion 2
		if (
			/[_!@#$%^&*(),.?":{}|<>]/.test(input.value) &&
			/[0-9]/.test(input.value) &&
			/[a-z]/.test(input.value) &&
			/[A-Z]/.test(input.value)
		) {
			PasswordValidationArray[1] = true;
		} else {
			PasswordValidationArray[1] = false;
		}

		// Array[1]: Criterion 3
		if (!/\s/.test(input.value)) {
			PasswordValidationArray[2] = true;
		} else {
			PasswordValidationArray[2] = false;
		}
	};

	const validateUserPasswordEquality = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.value !== userPassword) {
			isPassWordConfirmErrorMessage = '两次输入的密码不匹配';
		} else {
			isPassWordConfirmErrorMessage = '';
		}
		userConfirmPassword = input.value;
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
	>
		<div class="grid gap-3 mb-6 w-xs md:w-sm mt-10">
			<Heading tag="h4" class="text-center">注册</Heading>
			<div class="flex gap-2 flex-col">
				<Label for="username">用户名</Label>
				<Input
					type="text"
					id="username"
					placeholder="爱吃炸鱼的小丸子"
					required
					maxlength={15}
					bind:value={username}
					oninput={validateUsernameCriteria}
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
					color={PasswordValidationArray.some((v) => v === false) && userPassword.length > 0
						? 'red'
						: 'base'}
					bind:value={userPassword}
					oninput={validateUserPasswordCriteria}
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
				{#if userPassword !== ''}
					<Helper color="red">
						<List tag="ul" class="space-y-1">
							<Li icon>
								{#if PasswordValidationArray[0]}
									<CheckOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[0])}
									/>
								{:else}
									<CloseOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[0])}
									/>
								{/if}
								<span class={getValidationColorScheme(PasswordValidationArray[0])}
									>密码最少为10位</span
								>
							</Li>
							<Li icon>
								{#if PasswordValidationArray[1]}
									<CheckOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[1])}
									/>
								{:else}
									<CloseOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[1])}
									/>
								{/if}
								<span class={getValidationColorScheme(PasswordValidationArray[1])}
									>密码必须同时包含大写字母、小写字母和特殊符号</span
								>
							</Li>
							<Li icon>
								{#if PasswordValidationArray[2]}
									<CheckOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[2])}
									/>
								{:else}
									<CloseOutline
										size="sm"
										class={getValidationColorScheme(PasswordValidationArray[2])}
									/>
								{/if}
								<span class={getValidationColorScheme(PasswordValidationArray[2])}
									>密码不能包含空格</span
								>
							</Li>
						</List>
					</Helper>
				{/if}
			</div>
			<div class="flex gap-2 flex-col">
				<Label for="password-conformed">重复密码</Label>
				<Input
					type={isShowPassword ? 'text' : 'password'}
					id="password-conformed"
					required
					color={isPassWordConfirmErrorMessage === '' ? 'base' : 'red'}
					bind:value={userConfirmPassword}
					oninput={validateUserPasswordEquality}
				/>
				{#if isPassWordConfirmErrorMessage !== ''}
					<Helper color="red">{isPassWordConfirmErrorMessage}</Helper>
				{/if}
			</div>
			<div class="flex gap-2 flex-col">
				<Label for="user-email">邮箱</Label>
				<Input type="email" id="user-email" required bind:value={userEmail} />
			</div>
			<Checkbox bind:checked={userAgreementAndTerm}>
				我已阅读并同意 <A href="/" class="text-primary-700 dark:text-primary-600 hover:underline"
					>Anki workshop用户条款</A
				>.
			</Checkbox>
			<Button
				type="submit"
				disabled={username === '' ||
					userPassword === '' ||
					userConfirmPassword === '' ||
					userEmail === '' ||
					userAgreementAndTerm === false ||
					PasswordValidationArray.some((v) => v === false) === true ||
					usernameValidationErrorMessage !== '' ||
					isPassWordConfirmErrorMessage !== ''}>注册</Button
			>
			<p class="text-sm">已有账号？<A href="/login">点击登录</A></p>
		</div>
	</form>
</div>


<svelte:head>
	<title>Anki Workshop | 注册</title>
</svelte:head>