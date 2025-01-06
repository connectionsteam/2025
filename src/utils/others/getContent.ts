import type { APIAttachment, APIEmbed } from 'seyfert/lib/types';
import { Constants } from '../utility/Constants';
import { isImageOrVideo } from './isImageOrVideo';

export const getContent = ({
	content,
	attachments,
	embeds: [embed],
}: { content?: string; embeds: APIEmbed[]; attachments: APIAttachment[] }) => {
	if (content) return content;

	const maybeContent =
		embed.description?.match(Constants.ReplyPattern)?.[1] ?? embed.description;

	if (maybeContent) return maybeContent;

	const image =
		embed.image ??
		attachments.find(({ content_type: contentType }) =>
			isImageOrVideo({ contentType }),
		);

	if (!image) return;

	return `The message has an [attachment](${image?.url})`;
};
