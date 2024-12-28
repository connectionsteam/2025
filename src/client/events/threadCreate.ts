import { guilds } from '@/models/guild.model';
import { messages } from '@/models/messages.model';
import { threads } from '@/models/threads.model';
import { PremiumType } from '@/types/guild';
import { createEvent } from 'seyfert';
import { ChannelType } from 'seyfert/lib/types';

export default createEvent({
	data: { name: 'threadCreate' },
	async run(thread) {
		const { ownerId: creatorId } = thread;

		if (
			!creatorId ||
			!thread.parentId ||
			!thread.guildId ||
			thread.type !== ChannelType.PublicThread
		)
			return;

		const starterMessageId = thread.id;
		const messageExists = await messages.exists({
			$or: [{ id: starterMessageId }, { 'children.id': starterMessageId }],
		});

		if (!messageExists) return;

		const guild = await guilds.findOne(
			{ id: thread.guildId },
			{ threads: true, premium: true, connections: true },
			{ lean: true },
		);

		if (!guild) return;

		const connection = guild.connections?.find(
			({ channelId }) => channelId === thread.parentId,
		);

		if (!connection) return;

		const MAX_GUILD_THREADS_COUNT =
			{
				[PremiumType.Normal]: 7,
				[PremiumType.Vip]: 20,
				// @ts-expect-error
			}[guild.premium?.type] ?? 3;

		if (guild.threads?.length === MAX_GUILD_THREADS_COUNT) return;

		// TODO: Maybe increase this value with user premium
		const MAX_THREADS_PER_USER = 5;
		const userThreadsCount = await threads.countDocuments({ creatorId });

		if (userThreadsCount === MAX_THREADS_PER_USER) return;

		await Promise.allSettled([
			guilds.updateOne(
				{ id: thread.guildId },
				{ $push: { threads: { id: thread.id, parent: thread.id } } },
			),
			threads.create({ creatorId, id: thread.id }),
			thread.messages.write({
				allowed_mentions: {
					parse: [],
				},
				content: `✨ A new connection thread has been started by <@${creatorId}>.`,
			}),
		]);
	},
});
