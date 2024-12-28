import type { APIEmbed } from 'seyfert/lib/types';
import { Constants } from '../utility/Constants';

export const getContent = ({
	content,
	embeds: [embed],
}: { content?: string; embeds: APIEmbed[] }) => {
	if (content) return content;

	return embed.description?.match(Constants.ReplyPattern)?.[1] ?? embed.description;
};
