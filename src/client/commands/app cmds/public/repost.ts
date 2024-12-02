import { handleCreateConnectionMessage } from '@/handlers/utils/handleCreateConnectionMessage';
import { messages } from '@/models/messages.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Repost',
	type: ApplicationCommandType.Message,
	contexts: ['Guild'],
	props: {
		projection: {
			guild: 'connections',
		},
	},
})
@Middlewares(['guild'])
export default class RepostCommand extends Command {
	async run(context: CommandContext<never, 'guild'>) {
		if (!context.isMenuMessage()) return;

		const { target } = context;
		const responses = context.t.get();

		if (target.author.bot || target.author.system)
			return context.editOrReply({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});

		const fetchedMessage = await messages.findOne(
			{ id: target.id },
			{ authorId: true },
			{ lean: true },
		);

		if (!fetchedMessage)
			return context.editOrReply({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});
		if (fetchedMessage.authorId === context.author.id)
			return context.editOrReply({
				content: responses.cannotRepostOwnMessage,
				flags: MessageFlags.Ephemeral,
			});

		await context.editOrReply({
			content: responses.messageReposted(target.url),
		});

		await handleCreateConnectionMessage({
			repostUser: context.author,
			message: target,
			// @ts-expect-error
			guild: await context.guild('flow'),
			// @ts-expect-error
			channel: await context.channel('flow'),
			// @ts-expect-error
			connection: context.metadata.guild.connections.find(
				(connection) => connection.channelId === context.channelId,
			),
		});
	}
}
