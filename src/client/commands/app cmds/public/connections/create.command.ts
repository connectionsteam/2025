import { connections } from '@/models/connection.model';
import { ConnectionType } from '@/types/connection';
import {
	ActionRow,
	type Button,
	type CommandContext,
	createIntegerOption,
} from 'seyfert';
import { Declare, Options, SubCommand, createStringOption } from 'seyfert';
import { ButtonStyle, ComponentType, MessageFlags } from 'seyfert/lib/types';

const options = {
	name: createStringOption({
		required: true,
		description: 'Enter the connection name.',
		autocomplete(interaction) {
			const name = interaction.getInput();
			const cleanName = name
				.toLowerCase()
				.replace(/[^a-z0-9_ ]/g, '')
				.slice(0, 25);

			if (!name || !cleanName)
				return interaction.respond([
					{
						name: 'Connections - Enter a valid connection name.',
						value: 'invalid-connection',
					},
				]);

			return interaction.respond([
				{
					name:
						name !== cleanName
							? `Connections - The name is invalid, but will be replaced by "${cleanName}"`
							: name,
					value: cleanName,
				},
			]);
		},
	}),
	type: createIntegerOption({
		description: 'Should the connection be NSFW or Anonymous?',
		choices: [
			{
				name: 'NSFW Connection',
				value: ConnectionType.NSFW,
			},
			{
				name: 'Anonymous Connection',
				value: ConnectionType.Anonymous,
			},
		],
	}),
};

@Declare({
	name: 'create',
	description: 'Create a new connection.',
})
@Options(options)
export class CreateConnectionSubcommand extends SubCommand {
	async run(context: CommandContext<typeof options>) {
		const userConnectionsCount = await connections.countDocuments({
			creatorId: context.author.id,
		});
		const CONNECTIONS_LIMIT_PER_USER = 5;

		if (userConnectionsCount === CONNECTIONS_LIMIT_PER_USER)
			return context.editOrReply({
				content: 'You have reached your connections limit.',
				flags: MessageFlags.Ephemeral,
			});

		const { name } = context.options;

		if (name === 'invalid-connection')
			return context.editOrReply({
				content: 'Invalid name for a connection.',
				flags: MessageFlags.Ephemeral,
			});

		const connectionExists = await connections.exists({ name });

		if (connectionExists)
			return context.editOrReply({
				content: 'A connection with the same name already exists.',
				flags: MessageFlags.Ephemeral,
			});

		await Promise.all([
			connections.create({
				name,
				type: context.options.type,
				creatorId: context.author.id,
			}),
			context.editOrReply({
				content: `Your connection **${name}** has been created. Make it shine using the buttons be!low!`,
				components: [
					new ActionRow<Button>({
						components: [
							{
								label: 'Make it Shine',
								style: ButtonStyle.Link,
								type: ComponentType.Button,
								emoji: {
									name: '✨',
								},
								url: 'https://connections.squareweb.app/promote',
							},
							{
								style: ButtonStyle.Link,
								label: "Let's Customize!",
								type: ComponentType.Button,
								url: 'https://connections.squareweb.app/dashboard',
							},
						],
					}),
				],
			}),
		]);
	}
}
