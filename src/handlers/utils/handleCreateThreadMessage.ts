import { threads } from '@/models/threads.model';
import type { CreateThreadMessageOptions } from '@/types/handlers';
import { executeWithBatches } from '@/utils/others/executeWithBatches';
import { isImageOrVideo } from '@/utils/others/isImageOrVideo';

export const handleCreateThreadMessage = async ({
	guild,
	thread,
	message,
}: CreateThreadMessageOptions) => {
	if (!guild.threads?.some(({ id }) => id === thread.id)) return;
	if (
		!guild.connections?.some(
			(connection) => connection.channelId === thread.parentId,
		)
	)
		return;

	const fetchedThread = await threads.findOne(
		{ $or: [{ id: thread.id }, { children: thread.id }] },
		{ children: true },
		{ lean: true },
	);

	if (!fetchedThread?.children.length) return;

	await executeWithBatches(async (threadId) => {
		await message.client.messages.write(threadId, {
			allowed_mentions: {
				parse: [],
			},
			content: `${message.content || message.attachments.find(isImageOrVideo)?.url}\n\n-# Message by ${message.author}`,
		});
	}, fetchedThread.children);
};
