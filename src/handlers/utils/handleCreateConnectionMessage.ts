import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import type { HandleCreateConnectionMessageOptions } from '@/types/handlers';
import type { MessageChild } from '@/types/messages';
import { createConnectionMessage } from '@/utils/others/createConnectionMessage';
import { executeWithBatches } from '@/utils/others/executeWithBatches';
import { fetchReference } from '@/utils/others/fetchReference';
import { ActionRow, type Button } from 'seyfert';
import { ButtonStyle, ComponentType } from 'seyfert/lib/types';

export const handleCreateConnectionMessage = async ({
	channel,
	message,
	repostUser,
	connection,
	originalGuild,
}: HandleCreateConnectionMessageOptions) => {
	const EIGHT_DAYS_IN_MILLISECONDS = 6.912e8;
	const isNewAccount =
		message.author.createdTimestamp / 1000 < EIGHT_DAYS_IN_MILLISECONDS;

	if (isNewAccount)
		return message.reply({
			content:
				'Your account is too new to send messages in a Connections.\n-# *See why [here](https://connections.squareweb.app/docs)*',
		});

	const { name } = connection;
	const fetchedConnection = await connections.findOne(
		{ name },
		{ type: true, pausedAt: true, promotingSince: true },
		{ lean: true },
	);

	if (!fetchedConnection) {
		await Promise.allSettled([
			message.reply({
				content: `Connection **${name}** appears to no longer exist. Sorry for the confusion.`,
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
					'connections.name': name,
				},
				{
					$pull: {
						connections: { name },
						cases: { connection: name },
					},
				},
			),
			messages.deleteMany({
				connection: name,
			}),
		]);

		return;
	}

	if (fetchedConnection.pausedAt) {
		const ONE_WEEK_IN_MS = 6.048e8;

		if (
			!fetchedConnection.promotingSince &&
			Date.now() - fetchedConnection.pausedAt > ONE_WEEK_IN_MS
		)
			await Promise.allSettled([
				message.write({
					content: 'This connection has been deleted due to inactivity.',
				}),
				connections.deleteOne({ name }),
				guilds.updateMany(
					{
						'connections.name': name,
					},
					{
						$pull: {
							connections: { name },
							cases: { connection: name },
						},
					},
				),
				messages.deleteMany({
					connection: name,
				}),
			]);

		return;
	}
	if (fetchedConnection.type && !channel.nsfw)
		return message.reply({
			content: `Current channel need to be NSFW to use the connection **${name}**.`,
		});

	// TODO: Implementar cooldown aqui

	const connectedConnections = await guilds.find(
		{
			'connections.name': name,
			id: { $ne: message.guildId },
			'connections.lockedAt': { $exists: false },
		},
		{
			id: true,
			cases: true,
			metadata: true,
			connections: true,
		},
		{ lean: true },
	);

	if (connectedConnections.length === 0) return;

	const children = [] as MessageChild[];
	const reference = await fetchReference(message);

	await executeWithBatches(async (guild) => {
		await createConnectionMessage({
			name,
			guild,
			message,
			children,
			reference,
			repostUser,
			originalGuild,
			metadata: {
				cases: guild.cases ?? [],
				invite: guild.metadata?.invite,
				maxChars: guild.metadata?.maxChars,
			},
		});
	}, connectedConnections);

	const xp = new Set(message.content).size / 7;

	await Promise.allSettled([
		users.updateOne(
			{ id: message.author.id },
			{ $inc: { xpCount: xp > 3 ? 3 : xp } },
		),
		messages.create({
			children,
			id: message.id,
			connection: name,
			channelId: channel.id,
			authorId: message.author.id,
			reference: reference?.data.id,
		}),
	]);
};
