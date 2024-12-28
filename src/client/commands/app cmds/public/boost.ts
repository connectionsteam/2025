import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import { Command, type CommandContext, Declare } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Boost',
	props: {
		projection: {
			user: 'boosts',
		},
	},
	contexts: ['Guild'],
	type: ApplicationCommandType.Message,
})
export default class BoostCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		const { user } = context.metadata;
		const responses = context.t.get();

		if (!user.boosts)
			return context.editOrReply(responses.userDoesntHaveBoosts);

		if (!context.isMenuMessage()) return;

		const { target } = context;

		const fetchedMessage = await messages.findOne(
			{ $or: [{ id: target.id }, { 'children.id': target.id }] },
			{ boostCount: true },
			{ lean: true },
		);

		if (!fetchedMessage)
			return context.editOrReply({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});

		await Promise.allSettled([
			users.updateOne({ id: context.author.id }, { $inc: { boosts: -1 } }),
			messages.updateOne(
				{ _id: fetchedMessage._id },
				{ $inc: { boostCount: 1 } },
			),
			context.editOrReply({
				content: responses.messageBoosted(
					(fetchedMessage.boostCount ?? 0) + 1,
					target.url,
				),
			}),
		]);
	}
}
