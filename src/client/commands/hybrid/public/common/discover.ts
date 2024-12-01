import { connections } from '@/models/connection.model';
import { ConnectionType } from '@/types/connection';
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
		await context.editOrReply({
			content: 'Wait until we find good connections for you...',
		});

		const guildConnections =
			context.metadata.guild.connections?.map(({ name }) => name) ?? [];
		const fetchedConnections = await connections
			.find(
				{
					name: { $nin: guildConnections },
					type: { $ne: ConnectionType.Anonymous },
					pausedAt: { $exists: false },
				},
				{ metadata: false, teamId: false },
				{ limit: 15 },
			)
			.sort({ promotingSince: -1, 'likes.count': -1 });

		if (!fetchedConnections.length)
			return context.editOrReply({
				content: 'We could nto find any connection right now. Sorry.',
			});

		await context.editOrReply({
			content: fetchedConnections.map((a) => a.name).join(', '),
		});
	}
}
