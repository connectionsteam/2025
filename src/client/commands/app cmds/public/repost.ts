import { messages } from "@/models/messages.model";
import { Declare, type CommandContext, Command } from "seyfert";
import { ApplicationCommandType, MessageFlags } from "seyfert/lib/types";

@Declare({
    name: 'Repost',
    type: ApplicationCommandType.Message,
    contexts: ['Guild'],
})
export default class RepostCommand extends Command {
    async run(context: CommandContext) {
        if (!context.isMenuMessage()) return;

        const { target } = context;
        const responses = context.t.get();

        if (target.author.bot || target.author.system) return context.editOrReply({
            content: responses.unknownMessage,
            flags: MessageFlags.Ephemeral,
        });

        const fetchedMessage = await messages.findOne({ id: target.id }, { authorId: true }, { lean: true });

        if (!fetchedMessage) return context.editOrReply({
            content: responses.unknownMessage,
            flags: MessageFlags.Ephemeral,
        });
        if (fetchedMessage.authorId === context.author.id) return context.editOrReply({
            content: responses.cannotRepostOwnMessage,
            flags: MessageFlags.Ephemeral,
        });

        // TODO: Repost the message and save in the database

        await context.editOrReply({
            content: responses.messageReposted(target.url),
        });
    }
}
