import { createDesc } from '@/utils/common/createDesc';
import {
	Command,
	type CommandContext,
	Declare,
	Options,
	createUserOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	user: createUserOption({
		description: 'Enter the @mention of the user to discover',
	}),
};

@Declare({
	name: 'profile',
	contexts: ['Guild'],
	description: createDesc('Discover more about you or anyone', ['profile']),
})
@Options(options)
export default class ProfileCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		const responses = context.t.get();

		await context.editOrReply({
			content: responses.betaFeature,
			flags: MessageFlags.Ephemeral,
		});

		/* const { user } = context.options;

        if (user?.bot) return context.editOrReply({
            content: 'You can not discover more about apps.',
            flags: MessageFlags.Ephemeral,
        }); */
	}
}
