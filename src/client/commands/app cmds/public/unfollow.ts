import { users } from '@/models/users.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { ApplicationCommandType } from 'seyfert/lib/types';

@Declare({
	name: 'Unfollow',
	type: ApplicationCommandType.User,
	contexts: ['Guild'],
	props: {
		projection: {
			user: {
				follows: true,
			},
		},
	},
})
@Middlewares(['user'])
export default class UnfollowCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		if (!context.isMenuUser()) return;

		const { target } = context;
		const responses = context.t.get();
		const { user: me } = context.metadata;

		if (!me.follows.includes(target.id))
			return context.editOrReply({
				content: responses.crrUserIsNotFollowThisUser(target.id),
			});

		await users.updateOne(
			{ id: context.author.id },
			{
				$pull: {
					follows: target.id,
				},
			},
		);

		await context.editOrReply({
			content: responses.unfollowMessage(target.id),
		});
	}
}
