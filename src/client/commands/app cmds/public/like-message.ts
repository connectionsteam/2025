import { messages } from '@/models/messages.model';
import { Command, type CommandContext, Declare } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Like Message',
	contexts: ['Guild'],
	type: ApplicationCommandType.Message,
})
export default class LikeMessageCommand extends Command {
	async run(context: CommandContext) {
		if (!context.isMenuMessage()) return;

		const { target } = context;
		const responses = context.t.get();

		const fetchedMessage = await messages.findOne(
			{ $or: [{ id: target.id }, { 'children.id': target.id }] },
			{ likes: true },
			{ lean: true },
		);

		if (!fetchedMessage)
			return context.editOrReply({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});

		const authorId = context.author.id;
		const userAlreadyLiked = fetchedMessage.likes?.includes(authorId);

		await Promise.allSettled([
			context.write({
				content: userAlreadyLiked
					? responses.userUnlikedMessage(target.url)
					: responses.userLikedMessage(
							target.url,
							(fetchedMessage.likes?.length ?? 0) + 1,
						),
			}),
			messages.updateOne(
				{ _id: fetchedMessage._id },
				{ [userAlreadyLiked ? '$pull' : '$push']: { likes: authorId } },
			),
		]);
	}
}
