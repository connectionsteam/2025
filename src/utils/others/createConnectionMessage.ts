import { guilds } from '@/models/guild.model';
import {
	CaseType,
	type ConnectedConnection,
	ConnectedConnectionFlags,
	type GuildCase,
} from '@/types/guild';
import type { MessageChild, ReferenceMessage } from '@/types/messages';
import type { Guild, Message, User } from 'seyfert';
import { AllowedMentionsTypes, MessageReferenceType } from 'seyfert/lib/types';
import { formatContent } from '../common/formatContent';
import { createConnectionMessageEmbed } from '../ui/embeds/createConnectionMessageEmbed';

interface CreateConnectionMessageOptions {
	guild: Guild;
	message: Message;
	repostUser?: User;
	children?: MessageChild[];
	reference?: ReferenceMessage;
	connection: ConnectedConnection;
	metadata: { maxChars?: number; cases: GuildCase[]; invite?: string };
}

export const createConnectionMessage = async ({
	guild,
	message,
	children,
	reference,
	connection,
	repostUser,
	metadata: { cases, invite },
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

	const { id } = await message.write({
		message_reference: isMention
			? {
					message_id: reference.message.id,
					type: repostUser && MessageReferenceType.Forward,
				}
			: void 0,
		allowed_mentions: {
			replied_user: true,
			parse:
				connection.flags & ConnectedConnectionFlags.AllowMentions
					? [AllowedMentionsTypes.User]
					: void 0,
		},
		embeds: [
			createConnectionMessageEmbed({
				guild,
				invite,
				message,
				reference,
				flags: connection.flags,
				data: formatContent({ message, connection }),
			}),
		],
	});

	if (children)
		children.push({
			id,
			channelId: connection.channelId,
		});
};
