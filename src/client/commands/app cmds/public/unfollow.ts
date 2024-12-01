import { users } from '@/models/users.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

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

		const { user: me } = context.metadata;
		const { target } = context;

		if (!me.follows.includes(target.id))
			return context.editOrReply({
				content: `You are not following **${target.username}**.`,
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
			flags: MessageFlags.Ephemeral,
			content: `You just unfollowed **${target.username}**`,
		});
	}
}
