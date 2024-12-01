import { users } from '@/models/users.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Follow',
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
export default class FollowCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		if (!context.isMenuUser()) return;

		const { user: me } = context.metadata;
		const { target } = context;

		if (target.id === context.client.me.id)
			return context.editOrReply({
				content:
					'Why you are trying to follow the best connection app? Follow me in **X**!\nhttps://x.com/ConnectionsBot',
			});
		if (me.follows.includes(target.id))
			return context.editOrReply({
				content: `You are already following **${target.username}**.`,
			});
		if (target.bot || target.system)
			return context.editOrReply({
				flags: MessageFlags.Ephemeral,
				content: 'You can not follow an app.',
			});

		await users.updateOne(
			{ id: context.author.id },
			{
				$push: { follows: target.id },
			},
		);

		await context.editOrReply({
			content: `✨ You just followed user **${target.username}**`,
		});
	}
}
