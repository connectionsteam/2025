import { connections } from '@/models/connection.model';
import { guilds } from "@/models/guild.model";
import { ConnectedConnectionFlags } from "@/types/guild";
import { type CommandContext, Middlewares, createChannelOption, createStringOption } from "seyfert";
import { Declare, Options, SubCommand } from "seyfert";
import { ChannelType, MessageFlags } from "seyfert/lib/types";

const options = {
    name: createStringOption({
        required: true,
        description: 'Enter the name of the connection to join'
    }),
    channel: createChannelOption({
        description: 'Enter the @mention of the channel to use',
        channel_types: [ChannelType.GuildText],
    }),
}

@Declare({
    name: 'join',
    description: 'Join in a new connection',
})
@Options(options)
@Middlewares(['guild'])
export class JoinConnectionSubcommand extends SubCommand {
    async run(context: CommandContext<typeof options, 'guild'>) {
        const {guild}=context.metadata;
        const {connections:guildConnections=[]}=guild;
    const GUILD_CONNECTIONS_LIMIT = 10;
    const responses = context.t.get();

    if (guildConnections.length === GUILD_CONNECTIONS_LIMIT)
        return context.editOrReply({
        // TODO: Mensagem melhor e premium
            content: 'Unfortunatelly this server has reached the limit of connections.',
            flags: MessageFlags.Ephemeral,
        });

    const {name}=context.options;

    // TODO: Fazer para se conectar na mesma conexão até 3 vezes
    const isConnectionAlreadyConnected = guildConnections.some(
        (connection) => connection.name === name
    );

    if (isConnectionAlreadyConnected)
        return context.editOrReply({
            content: `Connection **${name}** is already connected in this guild.`,
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
        },
        { lean: true }
    );

    if (!originalConnection)
        return context.editOrReply({
            content: responses.unknownConnection,
            flags: MessageFlags.Ephemeral,
        });

    const connectedGuildsCount = await guilds.countDocuments({
        'connections.name': name,
    });

    if (connectedGuildsCount === (originalConnection.metadata?.maxConnections ?? 50))
        return context.editOrReply({
            content: 'Connection reached the limit of servers to join',
            flags: MessageFlags.Ephemeral,
        });

    const minMembers = originalConnection.metadata?.minMembers;

    if (minMembers) {
        const members = await context.client.members.list(context.guildId as string, {limit:minMembers});

        if (members.length !== minMembers)
            return context.editOrReply({
                content: `This server must have at least "${minMembers}" to join in this connection`,
                flags: MessageFlags.Ephemeral,
            });
    }

    const channel =
        context.options.channel ?? await context.channel('flow');

    if (
        !channel.isTextGuild() ||
        guildConnections.some(
            (connection) => connection.channelId === channel?.id
        )
    )
        return context.editOrReply({
            content: `Some connection is already using the channel ${channel}`,
            flags: MessageFlags.Ephemeral,
        });
    if (originalConnection.type && !channel.nsfw)
        return context.editOrReply({
            content: `Channel ${channel} must be NSFW`,
            flags: MessageFlags.Ephemeral,
        });
    
    // TODO: Implementar regras
    /* const rules = connection.metadata?.rules;

    if (
        rules &&
        context.author.id !== originalConnection.creatorId
    )
        return handleAcceptConnectionRules({
            guild,
            channel,
            responses,
            interaction,
            connection: name,
            rules: originalConnection.rules,
        }); */

    const connection = {
        name,
        channelId: channel.id,
        flags: 
            ConnectedConnectionFlags.AllowEmojis|
            ConnectedConnectionFlags.AllowOrigin
        
    };

    await Promise.allSettled([
        guilds.updateOne({
            id: context.guildId,
        }, { $push: { connections: connection } }),
        context.editOrReply({
            content: `Connection **${name}** has been connected`
        }),
    ]);

    await context.interaction.followup({
        content: 'Rules complement',
        flags: MessageFlags.Ephemeral,
    });

    /* if (
        guild.logs.channelId &&
        hasLogFlag(guild.logs.flags, LogsFlag.LogConnections)
    )
        await createConnectionLog({
            connection,
            channelId: guild.logs.channelId,
            type: ConnectionLogType.Joined,
            embed: responses.connectionLogEmbed({
                connection,
                type: ConnectionLogType.Joined,
                channelId: guild.logs.channelId,
            }),
        });

    const { webhook, new: isNew } = await fetchConnectionWebhook(channel);

    if (isNew)
        await guilds.updateOne(
            {
                guildId: guild.guildId,
                'connections.$.name': name,
            },
            { 'connections.$.webhookURL': webhook.url }
        );
    } */
}
