import { guilds } from '@/models/guild.model';
import { threads } from '@/models/threads.model';
import { createEvent } from 'seyfert';

export default createEvent({
	data: { name: 'threadDelete' },
	async run(thread) {
		if (!thread.guildId) return;

		const fetchedThread = await threads.findOne(
			{ $or: [{ id: thread.id }, { children: thread.id }] },
			{ id: true, children: true },
			{ lean: true },
		);

		if (!fetchedThread) return;
		if (thread.id === fetchedThread.id) {
			await Promise.allSettled([
				guilds.updateMany(
					{
						'threads.parent': thread.id,
					},
					{ $pull: { threads: { parent: thread.id } } },
				),
				threads.deleteOne({ _id: fetchedThread._id }),
			]);

			return;
		}

		await guilds.updateOne(
			{
				id: thread.guildId,
			},
			{ $pull: { threads: { id: thread.id } } },
		);
	},
});
