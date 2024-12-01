import { messages } from '@/models/messages.model';
import {
	AttachmentBuilder,
	Command,
	type CommandContext,
	Declare,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'rank',
	contexts: ['Guild'],
	description:
		'See the top 3 users who sent the most messages with Connections',
})
export default class RankCommand extends Command {
	async run(context: CommandContext) {
		await context.deferReply();

		const users = await messages.aggregate([
			{
				$group: {
					_id: '$authorId',
					messageCount: { $sum: 1 },
				},
			},
			{
				$sort: { messageCount: -1 },
			},
			{
				$limit: 3,
			},
		]);

		const userOnTop = users.find((user) => user._id === context.author.id);
		const userMsgs = userOnTop
			? userOnTop.messageCount
			: await messages.countDocuments({ authorId: context.author.id });

		if (users.length < 3)
			return context.editOrReply({
				content: 'We could not find fetch the rank, sorry for that.',
				flags: MessageFlags.Ephemeral,
			});

		const [firstUser, secondUser, thirdUser] = await Promise.all([
			context.client.users.fetch(users[0]._id),
			context.client.users.fetch(users[1]._id),
			context.client.users.fetch(users[2]._id),
		]);

		const queryParams = new URLSearchParams({
			firstPlace: firstUser.avatarURL({ extension: 'png' }),
			secondPlace: secondUser.avatarURL({ extension: 'png' }),
			thirdPlace: thirdUser.avatarURL({ extension: 'png' }),
			firstUser: `#1 ${firstUser.username}`,
			secondUser: `#2 ${secondUser.username}`,
			thirdUser: `#3 ${thirdUser.username}`,
			firstUserMessages: `${users[0].messageCount} messages`,
			secondUserMessages: `${users[1].messageCount} messages`,
			thirdUserMessages: `${users[2].messageCount} messages`,
			yourPlace: userOnTop
				? `You are already on the top with ${userMsgs} messages! Keep the pace.`
				: 'You are not on the top. Keep sending messages to get the top!',
		});

		try {
			const request = await fetch(
				`https://connections.squareweb.app/api/02afe945-854b-44d2-8d64-8ca2d3c4e931?${queryParams}`,
			);
			const response = await request.arrayBuffer();

			await context.interaction.followup({
				files: [
					new AttachmentBuilder({
						resolvable: Buffer.from(response),
						filename: 'rank.png',
					}),
				],
				content:
					'✨ **The first user** receive [Premium](https://connections.squareweb.app/) from the Connections Team.',
			});
		} catch {}
	}
}
