import { guilds } from '@/models/guild.model';
import {
	CaseType,
	type ConnectedConnection,
	type GuildCase,
} from '@/types/guild';
import type { MessageChild, ReferenceMessage } from '@/types/messages';
import type { Guild, Message, User } from 'seyfert';
import { MessageReferenceType } from 'seyfert/lib/types';

interface CreateConnectionMessageOptions {
	guild: Guild;
	message: Message;
	repostUser?: User;
	children?: MessageChild[];
	reference?: ReferenceMessage;
	connection: ConnectedConnection;
	metadata: { maxChars?: number; cases: GuildCase[] };
}

export const createConnectionMessage = async ({
	guild,
	message,
	children,
	reference,
	connection,
	repostUser,
	metadata: { cases },
}: CreateConnectionMessageOptions) => {
	const connectionChannel = await guild.channels.fetch(connection.channelId);

	if (!connectionChannel) return;

	/* if (cases.some((crrCase) => crrCase.targetId === guild.id))
			return; */

	const authorId = repostUser?.id ?? message.author.id;

	const userCase = cases.find(
		(crrCase) =>
			crrCase.targetId === authorId && crrCase.connection === connection.name,
	);

	if (userCase) {
		if (userCase.type === CaseType.Ban) return;
		if (userCase.type === CaseType.Timeout && userCase.lifetime >= Date.now())
			return;

		// TODO: Make the request after the message
		await guilds.updateOne(
			{ id: guild.id },
			{
				$pull: { cases: { id: userCase.id } },
			},
		);
	}

	const isMention =
		reference?.author.allowMentions &&
		reference.data.channelId === connectionChannel.id;
	const { id } = await message.client.messages.write(connection.channelId, {
		message_reference: isMention
			? {
					message_id: reference.message.id,
					type: repostUser && MessageReferenceType.Forward,
				}
			: void 0,
		content: `<@${authorId}>:\n\n${message.content}`,
		allowed_mentions: {
			parse: [],
			replied_user: true,
		},
	});

	if (children)
		children.push({
			id,
			channelId: connection.channelId,
		});
};
