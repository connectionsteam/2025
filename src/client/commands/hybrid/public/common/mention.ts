import { users } from '@/models/users.model';
import { createDesc } from '@/utils/common/createDesc';
import { Command, type CommandContext, Declare, Middlewares } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

@Declare({
	aliases: ['m'],
	name: 'mention',
	contexts: ['Guild'],
	description: createDesc('Turn your mention on or off.', ['mention', 'm']),
	props: {
		projection: { user: 'allowMentions' },
	},
})
@Middlewares(['user'])
export default class MentionCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		const responses = context.t.get();

		const isMentionOn = context.metadata.user.allowMentions;
		const update = isMentionOn
			? { $unset: { allowMentions: '' } }
			: { $set: { allowMentions: true } };

		await Promise.allSettled([
			users.updateOne({ id: context.author.id }, update),
			context.editOrReply({
				flags: MessageFlags.Ephemeral,
				content: responses.mentionCommand(isMentionOn),
			}),
		]);
	}
}
