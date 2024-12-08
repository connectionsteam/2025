import { connections } from '@/models/connection.model';
import { guilds } from '@/models/guild.model';
import { ConnectedConnectionFlags } from '@/types/guild';
import {
	type CommandContext,
	type DefaultLocale,
	Middlewares,
	createChannelOption,
	createStringOption,
} from 'seyfert';
import { Declare, Options, SubCommand } from 'seyfert';
import { ChannelType, MessageFlags } from 'seyfert/lib/types';

const options = {
	name: createStringOption({
		required: true,
		description: 'Enter the name of the connection to join',
	}),
	channel: createChannelOption({
		description: 'Enter the @mention of the channel to use',
		channel_types: [ChannelType.GuildText],
	}),
};

@Declare({
	name: 'join',
	description: 'Join in a new connection',
})
@Options(options)
@Middlewares(['guild'])
export class JoinConnectionSubcommand extends SubCommand {
	async run(context: CommandContext<typeof options, 'guild'>) {
		const { guild } = context.metadata;
		const { connections: guildConnections = [] } = guild;
		const GUILD_CONNECTIONS_LIMIT = 10;
		const responses = context.t.get();

		if (guildConnections.length === GUILD_CONNECTIONS_LIMIT)
			return context.editOrReply({
				...responses.guildReachedConnectionsLimit,
				flags: MessageFlags.Ephemeral,
			});

		const { name } = context.options;

		// TODO: Fazer para se conectar na mesma conexão até 3 vezes
		const isConnectionAlreadyConnected = guildConnections.some(
			(connection) => connection.name === name,
		);

		if (isConnectionAlreadyConnected)
			return context.editOrReply({
				...responses.connectionIsAlreadyConnected(name),
				flags: MessageFlags.Ephemeral,
			});

		const originalConnection = await connections.findOne(
			{
				name,
			},
			{
				type: true,
				creatorId: true,
				metadata: true,
				promotingSince: true,
			},
			{ lean: true },
		);

		if (!originalConnection)
			return context.editOrReply({
				content: responses.unknownConnection,
				flags: MessageFlags.Ephemeral,
			});

		const connectedGuildsCount = await guilds.countDocuments({
			'connections.name': name,
		});
		const MAX_CONNECTED_GUILDS_PER_CONNECTION =
			originalConnection.promotingSince ? 100 : 50;

		if (
			connectedGuildsCount ===
			(originalConnection.metadata?.maxConnections ??
				MAX_CONNECTED_GUILDS_PER_CONNECTION)
		)
			return context.editOrReply({
				...responses.connectionReachedGuildsLimit(
					name,
					context.author.id === originalConnection.creatorId,
					originalConnection.creatorId,
				),
				flags: MessageFlags.Ephemeral,
			});

		const minMembers = originalConnection.metadata?.minMembers;

		if (minMembers) {
			const members = await context.client.members.list(
				context.guildId as string,
				{ limit: minMembers },
			);

			if (members.length <= minMembers)
				return context.editOrReply({
					content: responses.insufficientNumberOfMembers(minMembers),
					flags: MessageFlags.Ephemeral,
				});
		}

		const channel = context.options.channel ?? (await context.channel('flow'));

		if (
			!channel.isTextGuild() ||
			guildConnections.some(
				(connection) => connection.channelId === channel?.id,
			)
		)
			return context.editOrReply({
				content: responses.someConnectionIsUsingTheChannel(channel.id),
				flags: MessageFlags.Ephemeral,
			});
		if (originalConnection.type && !channel.nsfw)
			return context.editOrReply({
				...responses.channelMustBeNSFW(channel.id),
				flags: MessageFlags.Ephemeral,
			});

		const rules = originalConnection.metadata?.rules;

		if (rules && context.author.id !== originalConnection.creatorId)
			return this.accepConnectionRules({
				name,
				rules,
				context,
				responses,
				channelId: channel.id,
			});

		const connection = {
			name,
			channelId: channel.id,
			flags:
				ConnectedConnectionFlags.AllowEmojis |
				ConnectedConnectionFlags.AllowOrigin,
		};

		await Promise.allSettled([
			guilds.updateOne(
				{
					id: context.guildId,
				},
				{ $push: { connections: connection } },
			),
			context.editOrReply(responses.connectionConnected(name, channel.id)),
		]);

		await context.interaction.followup({
			...responses.connectionConnectedFollowUp,
			flags: MessageFlags.Ephemeral,
		});
	}

	async accepConnectionRules({
		name,
		rules,
		channelId,
		context,
		responses,
	}: {
		context: CommandContext;
		rules: string;
		name: string;
		responses: DefaultLocale;
		channelId: string;
	}) {
		const message = await context.write(
			responses.acceptConnectionRules(rules),
			true,
		);

		message
			.createComponentCollector({
				filter: (i) => i.user.id === context.author.id,
			})
			.run('accept-rules', async (i) => {
				if (i.customId === 'reject') {
					await i.write({
						content: responses.rulesRejected,
						flags: MessageFlags.Ephemeral,
					});
					await message.delete();

					return;
				}

				const connection = {
					name,
					channelId,
					flags:
						ConnectedConnectionFlags.AllowEmojis |
						ConnectedConnectionFlags.AllowOrigin,
				};

				await Promise.allSettled([
					guilds.updateOne(
						{
							id: context.guildId,
						},
						{ $push: { connections: connection } },
					),
					context.editOrReply(responses.connectionConnected(name, channelId)),
				]);
			});
	}
}
