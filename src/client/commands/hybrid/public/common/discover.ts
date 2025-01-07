import { connections } from '@/models/connection.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';

@Declare({
	name: 'discover',
	description: 'Discover new amazing connections!',
	contexts: ['Guild'],
	props: {
		projection: {
			user: '_id',
			guild: 'connections',
		},
	},
})
@Middlewares(['guild'])
export default class DiscoverCommand extends Command {
	async run(context: CommandContext<never, 'guild'>) {
		const responses = context.t.get();

		await context.editOrReply({
			content: responses.discordWaitMessage,
		});

		const guildConnections =
			context.metadata.guild.connections?.map(({ name }) => name) ?? [];
		const fetchedConnections = await connections
			.find(
				{
					name: { $nin: guildConnections },
					pausedAt: { $exists: false },
				},
				{ metadata: false, teamId: false },
				{ limit: 15 },
			)
			.sort({ promotingSince: -1, 'likes.count': -1 });

		if (!fetchedConnections.length)
			return context.editOrReply({
				content: responses.connectionsNotFoundWithDiscover,
			});

		await context.editOrReply({
			content: fetchedConnections.map((a) => a.name).join(', '),
		});
	}
}
