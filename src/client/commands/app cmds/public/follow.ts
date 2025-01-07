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

		const { target } = context;
		const responses = context.t.get();
		const { user: me } = context.metadata;

		if (target.id === context.client.me.id)
			return context.editOrReply({
				content: responses.cannotFollowConnections,
			});
		if (me.follows.includes(target.id))
			return context.editOrReply({
				content: responses.alreadyFollowingThisUser(target.username),
			});
		if (target.bot || target.system)
			return context.editOrReply({
				flags: MessageFlags.Ephemeral,
				content: responses.cannotFollowAnApp,
			});

		await users.updateOne(
			{ id: context.author.id },
			{
				$push: { follows: target.id },
			},
		);

		await context.editOrReply({
			allowed_mentions: {
				parse: [],
			},
			content: responses.followMessage(target.id),
		});
	}
}
