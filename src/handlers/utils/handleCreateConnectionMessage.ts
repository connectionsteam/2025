import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { messages } from '@/models/messages.model';
import { ConnectionType } from '@/types/connection';
import type { HandleCreateConnectionMessageOptions } from '@/types/handlers';
import type { MessageChild } from '@/types/messages';
import { createConnectionMessage } from '@/utils/others/createConnectionMessage';
import { isNewAccount } from '@/utils/utility/isNewAccount';

export const handleCreateConnectionMessage = async ({
	user,
	guild,
	channel,
	message,
	connection,
	fetchedGuild,
}: HandleCreateConnectionMessageOptions) => {
	if (isNewAccount(message.author.createdTimestamp)) return;

	const fetchedConnection = await connections.findOne(
		{ name: connection.name },
		{ type: true, pausedAt: true },
		{ lean: true },
	);

	if (!fetchedConnection) {
		await message.reply({
			content: 'essa conexao nao existe, sla o pq',
		});

		await guilds.updateMany(
			{
				'connections.name': connection.name,
			},
			{
				$pull: {
					connections: { name: connection.name },
					cases: { connection: connection.name },
				},
			},
		);

		return;
	}

	// TODO: Verificar se ta pausado por muito tempo
	if (fetchedConnection.pausedAt) return;
	if (fetchedConnection.type && !channel.nsfw)
		return message.reply({
			content: 'esse canal precisa ser nsfw por conta da conexão',
		});

	// TODO: Cooldown here

	const connectedConnections = await guilds.find(
		{
			id: { $ne: message.guildId },
			'connections.name': connection.name,
			/* 'connections.flags': {
                $nin: [ConnectedConnectionFlags.Frozen],
            }, */
			'connections.lockedAt': { $exists: false },
		},
		{
			cases: true,
			metadata: true,
			'connections.$': true,
		},
		{ lean: true },
	);

	if (connectedConnections.length === 0) return;

	const children =
		fetchedConnection.type !== ConnectionType.Anonymous
			? ([] as MessageChild[])
			: void 0;

	for (const crrGuild of connectedConnections) {
		await createConnectionMessage();
	}

	if (children)
		await messages.create({
			children,
			id: message.id,
			channelId: channel.id,
			authorId: message.author.id,
			connection: connection.name,
		});
};
