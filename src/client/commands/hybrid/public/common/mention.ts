import { users } from '@/models/users.model';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

@Declare({
	aliases: ['m'],
	name: 'mention',
	contexts: ['Guild'],
	description: 'Turn your mention on or off.',
	props: {
		projection: { user: 'allowMentions' },
	},
})
@Middlewares(['user'])
export default class MentionCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		const isMentionOn = context.metadata.user.allowMentions;
		const update = isMentionOn
			? { $unset: { allowMentions: '' } }
			: { $set: { allowMentions: true } };

		await users.updateOne({ id: context.author.id }, update);

		await context.editOrReply({
			flags: MessageFlags.Ephemeral,
			content: `You turned your mentions ${isMentionOn ? 'off' : 'on'}.`,
		});
	}
}
