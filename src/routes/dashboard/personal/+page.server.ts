import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { users } from '$lib/database/schema';
import { json, fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';


const verifyUpdateUserInfoSchema = z.object({
	id: z.string().nonempty('User ID不能为空'),
	username: z.string().nonempty('用户名不能为空'),
	email: z.string().nonempty('邮箱不能为空'),
	old_password: z.string().optional(),
	new_password: z.string().optional(),
	avatar: z.string().optional()
});

export const actions: Actions = {
	updateUserInfo: async ({ locals, request }) => {
		const data = await request.formData();

		const result = verifyUpdateUserInfoSchema.safeParse(Object.fromEntries(data));

		let updatedUser;

		if (!result.success) {
			return fail(400, {
				message : '请求参数错误'
			})
		}

		if (result.data.new_password && result.data.old_password) {
			const oldPassQuery = await locals.db.query.users.findFirst({
				where: eq(users.id, result.data.id),
				columns: {
					hashed_password: true
				}
			});

			console.log(oldPassQuery);

			const passValidResult = bcrypt.compareSync(
				result.data.old_password,
				oldPassQuery?.hashed_password ?? ''
			);

			if (!passValidResult) {
				return fail(400, {
					message : '新旧密码不匹配'
				})
			}

			if (result.data.avatar) {
				updatedUser = await locals.db
					.update(users)
					.set({
						username: result.data.username,
						email: result.data.email,
						hashed_password: bcrypt.hashSync(result.data.new_password, 10),
						image: result.data.avatar
					})
					.where(eq(users.id, result.data.id))
					.returning();
			} else {
				updatedUser = await locals.db
					.update(users)
					.set({
						username: result.data.username,
						email: result.data.email,
						hashed_password: bcrypt.hashSync(result.data.new_password, 10)
					})
					.where(eq(users.id, result.data.id))
					.returning();
			}
		} else {
			if (result.data.avatar) {
				updatedUser = await locals.db
					.update(users)
					.set({
						username: result.data.username,
						email: result.data.email,
						image: result.data.avatar
					})
					.where(eq(users.id, result.data.id))
					.returning();
			} else {
				updatedUser = await locals.db
					.update(users)
					.set({
						username: result.data.username,
						email: result.data.email
					})
					.where(eq(users.id, result.data.id))
					.returning();
			}
		}

		if (updatedUser.length > 0) {
			return {
				status: 'success',
				data: null,
				error: null
			} as RESTfulApiResponse;
		}
	}
};
