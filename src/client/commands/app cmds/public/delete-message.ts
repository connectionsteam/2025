import { messages } from '@/models/messages.model';
import { executeWithBatches } from '@/utils/others/executeWithBatches';
import { Command, type CommandContext, Declare } from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Delete Message',
	contexts: ['Guild'],
	type: ApplicationCommandType.Message,
})
export default class DeleteMessageContextMenu extends Command {
	async run(context: CommandContext) {
		if (!context.isMenuMessage()) return;

		const { target } = context;
		const responses = context.t.get();

		const message = await messages.findOne(
			{ $or: [{ id: target.id }, { 'children.id': target.id }] },
			{ authorId: true, children: true },
			{ lean: true },
		);

		if (!message)
			return context.write({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});
		if (message.authorId !== context.author.id)
			return context.write({
				content: responses.messageDoesntBelongToYou,
				flags: MessageFlags.Ephemeral,
			});

		await Promise.allSettled([
			context.write({
				content: responses.messageQueued.delete(
					Math.ceil(message.children.length / 5) / 2,
				),
			}),
			messages.deleteOne({ _id: message._id }),
			executeWithBatches(async ({ id, channelId }) => {
				await context.client.messages.delete(id, channelId);
			}, message.children),
		]);
	}
}
