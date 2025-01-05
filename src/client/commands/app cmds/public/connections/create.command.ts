import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { ConnectionType } from '@/types/connection';
import { ConnectedConnectionFlags } from '@/types/guild';
import { fetchGuild } from '@/utils/common/fetchGuild';
import {
	type CommandContext,
	createChannelOption,
	createIntegerOption,
} from 'seyfert';
import { Declare, Options, SubCommand, createStringOption } from 'seyfert';
import {
	ChannelType,
	MessageFlags,
} from 'seyfert/lib/types';

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
		],
	}),
	channel: createChannelOption({
		description: 'Enter the channel @mention to connect the connection',
		channel_types: [ChannelType.GuildText],
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
		const responses = context.t.get();
		const CONNECTIONS_LIMIT_PER_USER = 5;

		if (userConnectionsCount === CONNECTIONS_LIMIT_PER_USER)
			return context.editOrReply({
				content: responses.userReachedConnectionsLimit,
				flags: MessageFlags.Ephemeral,
			});

		const { name } = context.options;

		if (name === 'invalid-connection')
			return context.editOrReply({
				content: responses.invalidConnectionName,
				flags: MessageFlags.Ephemeral,
			});

		const connectionExists = await connections.exists({ name });

		if (connectionExists)
			return context.editOrReply({
				content: responses.connectionWithSameNameExists,
				flags: MessageFlags.Ephemeral,
			});

		const promises = [
			connections.create({
				name,
				type: context.options.type,
				creatorId: context.author.id,
			}),
			context.editOrReply(responses.connectionCreated(name)),
		] as Promise<unknown>[];

		const { channel } = context.options;

		if (channel) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const guild = (await context.guild('flow'))!;
			const fetchedGuild = await fetchGuild({ guild, projection: 'connections' });

			if (fetchedGuild.connections?.some(({channelId})=>channelId===channel.id)) return context.write({

			});

			promises.push(
				guilds.updateOne(
					{
						id: context.guildId,
					},
					{
						$push: {
							connections: {
								name,
								channelId: channel.id,
								flags:
									ConnectedConnectionFlags.AllowEmojis |
									ConnectedConnectionFlags.AllowOrigin,
							},
						},
					},
				),
			);
		}

		await Promise.all(promises);
	}
}
