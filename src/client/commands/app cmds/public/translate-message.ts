import { messages } from '@/models/messages.model';
import { getContent } from '@/utils/others/getContent';
import { lang, translate } from 'bing-translate-api';
import {
	Command,
	type CommandContext,
	Declare,
	type DefaultLocale,
	type StringSelectMenuInteraction,
} from 'seyfert';
import { ApplicationCommandType, MessageFlags } from 'seyfert/lib/types';

@Declare({
	name: 'Translate Message',
	contexts: ['Guild'],
	type: ApplicationCommandType.Message,
})
export default class TranslateMessage extends Command {
	async run(context: CommandContext) {
		if (!context.isMenuMessage()) return;

		const { target } = context;
		const responses = context.t.get();

		const messageExist = await messages.exists({
			$or: [{ id: target.id }, { 'children.id': target.id }],
		});

		if (!messageExist)
			return context.write({
				content: responses.unknownMessage,
				flags: MessageFlags.Ephemeral,
			});

		// @ts-expect-error This works
		const content = getContent(target);

		if (!content)
			return context.write({
				content: responses.unknownConnection,
				flags: MessageFlags.Ephemeral,
			});

		const translation = await translate(content, null, lang.LANGS.en).catch(
			() => null,
		);

		if (!translation)
			return context.write({
				content: responses.couldNotTranslateMessage,
				flags: MessageFlags.Ephemeral,
			});

		const message = await context.write(
			{
				flags: MessageFlags.Ephemeral,
				content: responses.translation(lang.LANGS.en, translation.translation),
				components: responses.translateComponents,
			},
			true,
		);
		const collector = message.createComponentCollector({
			filter: (interaction) => interaction.user.id === context.author.id,
		});

		collector.run('language', async (interaction) => {
			if (interaction.isStringSelectMenu())
				await this.changeLanguage(interaction, responses, content);
		});
	}

	public async changeLanguage(
		interaction: StringSelectMenuInteraction,
		responses: DefaultLocale,
		content: string,
	) {
		const [language] = interaction.values;

		const translation = await translate(content, null, language).catch(
			() => null,
		);

		if (!translation)
			return interaction.editOrReply({
				content: responses.couldNotTranslateMessage,
				flags: MessageFlags.Ephemeral,
			});

		await interaction.update({});
		await interaction.editResponse({
			content: responses.translation(language, translation.translation),
		});
	}
}
