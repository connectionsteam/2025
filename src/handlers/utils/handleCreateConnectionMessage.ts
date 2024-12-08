import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import { ConnectionType } from '@/types/connection';
import type { HandleCreateConnectionMessageOptions } from '@/types/handlers';
import type { MessageChild } from '@/types/messages';
import { createConnectionMessage } from '@/utils/others/createConnectionMessage';
import { executeWithBatches } from '@/utils/others/executeWithBatches';
import { fetchReference } from '@/utils/others/fetchReference';
import { ActionRow, type Button } from 'seyfert';
import { ButtonStyle, ComponentType } from 'seyfert/lib/types';

export const handleCreateConnectionMessage = async ({
	guild,
	channel,
	message,
	repostUser,
	connection,
}: HandleCreateConnectionMessageOptions) => {
	const EIGHT_DAYS_IN_MILLISECONDS = 6.912e8;

	const isNewAccount =
		message.author.createdTimestamp / 1000 < EIGHT_DAYS_IN_MILLISECONDS;

	if (isNewAccount) return;

	const { name } = connection;

	const fetchedConnection = await connections.findOne(
		{ name },
		{ type: true, pausedAt: true, promotingSince: true },
		{ lean: true },
	);

	if (!fetchedConnection) {
		const promises = [
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
		];

		await Promise.allSettled(promises);

		return;
	}

	const ONE_WEEK_IN_MS = 6.048e8;

	// TODO: Verificar se ta pausado por muito tempo
	if (fetchedConnection.pausedAt) {
		if (
			!fetchedConnection.promotingSince &&
			Date.now() - fetchedConnection.pausedAt > ONE_WEEK_IN_MS
		)
			await Promise.allSettled([
				message.write({
					content: 'This connection has been deleted due to inactivity',
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
			content: `Connection **${name}** is NSFW or Anonymous and the channel need to be NSFW.`,
		});

	// TODO: Implementar coolodown aqui

	const connectedConnections = await guilds
		.find(
			{
				id: { $ne: message.guildId },
				'connections.name': name,
				'connections.lockedAt': { $exists: false },
			},
			{
				cases: true,
				metadata: true,
				'connections.$': true,
			},
			{ lean: true },
		)
		.sort({ premium: -1 });

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
			metadata: {
				maxChars: metadata?.maxChars,
				cases,
				invite: metadata?.invite,
			},
		});
	}, connectedConnections);

	const xp = new Set(message.content).size / 7;
	const promises = [
		users.updateOne(
			{ id: message.author.id },
			{ $inc: { xpCount: xp > 3 ? 3 : xp } },
		),
	] as Promise<unknown>[];

	if (children)
		promises.push(
			messages.create({
				children,
				id: message.id,
				connection: name,
				channelId: channel.id,
				authorId: message.author.id,
				reference: reference?.data.id,
			}),
		);

	await Promise.allSettled(promises);
};
