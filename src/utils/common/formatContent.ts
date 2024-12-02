import type { ConnectedConnection } from '@/types/guild';
import type { Message } from 'seyfert';
import { StickerFormatType } from 'seyfert/lib/types';
import { isImageOrVideo } from '../others/isImageOrVideo';

interface FormatContentOptions {
	message: Message;
	connection: ConnectedConnection;
}

export const formatContent = ({
	connection: { flags, blockwords },
	message: { content, attachments, stickerItems },
}: FormatContentOptions) => {
	const rawAttachment =
		attachments.find(isImageOrVideo) ||
		stickerItems?.find(
			(sticker) => sticker.formatType !== StickerFormatType.Lottie,
		);
	const attachment =
		// @ts-expect-error
		'filename' in rawAttachment
			? rawAttachment.url
			: // @ts-expect-error
				`https://cdn.discordapp.com/stickers/${rawAttachment.id}.${rawAttachment.formatType}`;

	if (!content.length && attachment)
		return {
			attachment,
		};

	return { content, attachment };
};
