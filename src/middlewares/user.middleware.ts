import type { User } from '@/types/user';
import { fetchUser } from '@/utils/common/fetchUser';
import { createMiddleware } from 'seyfert';

export const userMiddleware = createMiddleware<User>(
	async ({ next, context }) => {
		next(
			await fetchUser(
				context.author.id,
				context.command.props.projection?.user,
			),
		);
	},
);
