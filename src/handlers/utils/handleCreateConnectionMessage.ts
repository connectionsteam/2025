import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { messages } from '@/models/messages.model';
import { ConnectionType } from '@/types/connection';
import type { HandleCreateConnectionMessageOptions } from '@/types/handlers';
import type { MessageChild } from '@/types/messages';
import { createConnectionMessage } from '@/utils/others/createConnectionMessage';
import { executeWithBatches } from '@/utils/others/executeWithBatches';
import { fetchReference } from '@/utils/others/fetchReference';
import { isNewAccount } from '@/utils/utility/isNewAccount';
import { ActionRow, type Button } from 'seyfert';
import { ButtonStyle, ComponentType } from 'seyfert/lib/types';

export const handleCreateConnectionMessage = async ({
	guild,
	channel,
	message,
	repostUser,
	connection,
}: HandleCreateConnectionMessageOptions) => {
	if (isNewAccount(message.author.createdTimestamp)) return;

	const fetchedConnection = await connections.findOne(
		{ name: connection.name },
		{ type: true, pausedAt: true },
		{ lean: true },
	);

	if (!fetchedConnection) {
		const promises = [
			message.reply({
				content: `Connection **${connection.name}** appears to no longer exist. Sorry for the confusion.`,
				components: [
					new ActionRow<Button>({
						components: [
							{
								label: 'Why?',
								style: ButtonStyle.Link,
								type: ComponentType.Button,
								// TODO: Put the corret link here
								url: 'https://connections.docs/why-connection-does-not-exist',
							},
						],
					}),
				],
			}),
			guilds.updateMany(
				{
					'connections.name': connection.name,
				},
				{
					$pull: {
						connections: { name: connection.name },
						cases: { connection: connection.name },
					},
				},
			),
			messages.deleteMany({
				connection: connection.name,
			}),
		];

		Promise;

		await Promise.allSettled(promises);

		return;
	}

	// TODO: Verificar se ta pausado por muito tempo
	if (fetchedConnection.pausedAt) return;
	if (fetchedConnection.type && !channel.nsfw)
		return message.reply({
			content: `Connection **${connection.name}** is NSFW or Anonymous and the channel need to be NSFW.`,
		});

	// TODO: Implementar coolodown aqui

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
	const reference = message.referencedMessage
		? await fetchReference(message)
		: void 0;

	await executeWithBatches(async ({ cases = [], metadata }) => {
		await createConnectionMessage({
			guild,
			message,
			children,
			reference,
			connection,
			repostUser,
			metadata: { maxChars: metadata?.maxChars, cases },
		});
	}, connectedConnections);

	if (children)
		await messages.create({
			children,
			id: message.id,
			channelId: channel.id,
			authorId: message.author.id,
			connection: connection.name,
			reference: reference?.data.id,
		});
};
