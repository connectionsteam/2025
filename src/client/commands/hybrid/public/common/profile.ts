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
	description: 'Discover more about you or anyone',
	contexts: ['Guild'],
})
@Options(options)
export default class ProfileCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		await context.editOrReply({
			content: "You've discovered a beta feature! Keep it a secret.",
			flags: MessageFlags.Ephemeral,
		});

		/* const { user } = context.options;

        if (user?.bot) return context.editOrReply({
            content: 'You can not discover more about apps.',
            flags: MessageFlags.Ephemeral,
        }); */
	}
}
