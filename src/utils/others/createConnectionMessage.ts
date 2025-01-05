import { guilds } from '@/models/guild.model';
import {
	CaseType,
	ConnectedConnectionFlags,
	type Guild,
	type GuildCase,
} from '@/types/guild';
import type { MessageChild, ReferenceMessage } from '@/types/messages';
import type { Message, Guild as SeyfertGuild, User } from 'seyfert';
import { AllowedMentionsTypes, MessageReferenceType } from 'seyfert/lib/types';
import { formatContent } from '../common/formatContent';
import { createConnectionMessageEmbed } from '../ui/embeds/createConnectionMessageEmbed';
import { isImageOrVideo } from './isImageOrVideo';

interface CreateConnectionMessageOptions {
	guild: Guild;
	name: string;
	message: Message;
	repostUser?: User;
	children: MessageChild[];
	originalGuild: SeyfertGuild;
	reference?: ReferenceMessage;
	metadata: { maxChars?: number; cases: GuildCase[]; invite?: string };
}

export const createConnectionMessage = async ({
	name,
	guild,
	message,
	children,
	reference,
	repostUser,
	originalGuild,
	metadata: { cases, invite },
}: CreateConnectionMessageOptions) => {
	const fetchedGuild = await message.client.guilds
		.fetch(guild.id)
		.catch(() => null);

	if (!fetchedGuild) return;

	const connection = guild.connections?.find(
		(connection) => connection.name === name,
	);

	if (!connection) return;

	const connectionChannel = await fetchedGuild.channels.fetch(
		connection.channelId,
	);

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

	const { id } = await message.client.messages.write(connectionChannel.id, {
		/* 		message_reference: isMention
			? {
					message_id: reference.message.id,
					type: repostUser && MessageReferenceType.Forward,
				}
			: void 0, */
		embeds: [
			createConnectionMessageEmbed({
				invite,
				message,
				reference,
				guild: originalGuild,
				flags: connection.flags,
				data: formatContent({ message, connection }),
			}),
		],
		content: isMention ? `<@${reference.data.authorId}>` : void 0,
	});

	children.push({
		id,
		channelId: connection.channelId,
	});
};
