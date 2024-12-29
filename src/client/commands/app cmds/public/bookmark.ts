import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import {
	ActionRow,
	type Button,
	Command,
	type CommandContext,
	Declare,
	Middlewares,
} from 'seyfert';
import {
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from 'seyfert/lib/types';

@Declare({
	name: 'Bookmark',
	type: ApplicationCommandType.Message,
	contexts: ['Guild'],
	props: {
		projection: { user: 'bookmarks' },
	},
})
@Middlewares(['nop', 'user'])
export default class BookmarkCommand extends Command {
	async run(ctx: CommandContext<never, 'user'>) {
		if (!ctx.isMenuMessage()) return;

		const { user } = ctx.metadata;
		const { target: message } = ctx;
		const { favorites } = user.bookmarks;

		const msgIndex = favorites.msgs.findIndex(({ id }) => id === message.id);

		if (msgIndex !== -1) {
			favorites.msgs.splice(msgIndex, 0);

			await users.updateOne({ id: ctx.author.id }, { $set: { favorites } });

			await ctx.editOrReply({
				content: `Message ${message} removed from the **favorites** bookmark.`,
			});

			return;
		}

		const messageExists = await messages.exists({ id: message.id });

		if (!messageExists)
			return ctx.editOrReply({
				flags: MessageFlags.Ephemeral,
				content: 'We could not find this message.',
			});

		favorites.msgs.push({ id: message.id, channelId: message.channelId });

		await users.updateOne(
			{ id: ctx.author.id },
			{
				$set: { favorites },
			},
		);

		await ctx.editOrReply({
			content: `Message ${message} bookmarked successfully in **favorites**.`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							url: 'https://sex.com',
							label: 'Go to Bookmarks',
						},
					],
				}),
			],
		});
	}
}
