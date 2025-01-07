import { inspect } from 'node:util';
import { createDesc } from '@/utils/common/createDesc';
import {
	ActionRow,
	Button,
	Command,
	type CommandContext,
	Declare,
	Middlewares,
	Options,
	createBooleanOption,
	createStringOption,
} from 'seyfert';
import { ButtonStyle, MessageFlags } from 'seyfert/lib/types';

const options = {
	code: createStringOption({
		required: true,
		description: 'Enter a code to execute',
	}),
	hide: createBooleanOption({
		description: 'Should Connections hide the result?',
	}),
};

@Declare({
	name: 'eval',
	aliases: ['ev'],
	description: createDesc('Run a code with Connections', ['eval', 'ev']),
})
@Options(options)
@Middlewares(['dev'])
export default class EvalCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		const { code, hide } = context.options;
		// biome-ignore lint/security/noGlobalEval: <explanation>
		const result = await eval(code);

		const message = await context.editOrReply(
			{
				content: inspect(result),
				flags: hide ? MessageFlags.Ephemeral : void 0,
				components: [
					new ActionRow<Button>().setComponents([
						new Button()
							.setCustomId('destroy')
							.setLabel('💣')
							.setStyle(ButtonStyle.Primary),
					]),
				],
			},
			true,
		);

		message.createComponentCollector().run('destroy', async (interaction) => {
			const messages = [
				'Why are you trying this?',
				'Are you still trying this?',
				'I will not run a code for you',
				'Stop with this',
				'No No No',
				'Nah bro',
			];

			if (interaction.user.id !== context.author.id)
				return interaction.editOrReply({
					flags: MessageFlags.Ephemeral,
					content: messages[Math.floor(messages.length * Math.random())],
				});

			await message.delete();
			await interaction.editOrReply({
				flags: MessageFlags.Ephemeral,
				content: 'Message destroyed successfully 💣',
			});
		});
	}

	onRunError(context: CommandContext, error: Error) {
		return context.editOrReply({
			content: `${error.name ?? 'Error'}: ${error}`,
		});
	}
}
