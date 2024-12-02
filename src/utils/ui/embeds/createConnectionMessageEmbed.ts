import type { ReferenceMessage } from '@/types/messages';
import { getContent } from '@/utils/others/getContent';
import { Constants } from '@/utils/utility/Constants';
import type { Guild, Message } from 'seyfert';
import type { APIEmbed } from 'seyfert/lib/types';

interface CreateConnectionMessageEmbedOptions {
	guild: Guild;
	invite?: string;
	message: Message;
	reference?: ReferenceMessage;
	data: { content?: string; attachment?: string };
}

export const createConnectionMessageEmbed = ({
	guild,
	invite,
	message,
	reference,
	data: { content, attachment },
}: CreateConnectionMessageEmbedOptions) => {
	return {
		author: {
			name: message.author.username,
			icon_url: message.author.defaultAvatarURL(),
		},
		color: Constants.InvisibleColor,
		footer: {
			text: `${guild.name}${invite ? ` | ${invite}` : ''}`,
			icon_url: guild.iconURL(),
		},
		image: attachment && { url: attachment },
		description: reference
			? `${getContent(reference.message)}\n-# Replying to ${reference.author}\n\n${content}`
			: content,
	} as APIEmbed;
};
