import { ConnectedConnectionFlags, type ConnectedConnection } from '@/types/guild';
import type { Message } from 'seyfert';
import { StickerFormatType } from 'seyfert/lib/types';
import { isImageOrVideo } from '../others/isImageOrVideo';
import urlRegex from 'url-regex';

interface FormatContentOptions {
	message: Message;
	connection: ConnectedConnection;
}

export const formatContent = ({
	connection: { flags },
	message: { content, attachments, stickerItems },
}: FormatContentOptions) => {
	const isMissing = (flag: ConnectedConnectionFlags) => !(flags & flag) 

	if (isMissing(ConnectedConnectionFlags.AllowWallOfText)) content = content.replace('\n', '');
	if (isMissing(ConnectedConnectionFlags.AllowInvites)) content = content.replace(/(?:https?:\/\/)?(?:discord\.(?:gg|com|invite)|dsc\.gg)\/?[\s+]*(?:\S+)?[\s+]*(\w+)/gi, '');
	if (isMissing(ConnectedConnectionFlags.AllowEmojis)) content = content.replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/g, '');
	if (isMissing(ConnectedConnectionFlags.AllowLinks)) content = content.replace(urlRegex({ strict: false }), '')
	if (isMissing(ConnectedConnectionFlags.AllowFiles)) return { content };

	const rawAttachment =
		attachments.find(isImageOrVideo) ||
		stickerItems?.find(
			(sticker) => sticker.formatType !== StickerFormatType.Lottie,
		);
	const attachment = rawAttachment
		? 'filename' in rawAttachment
			? rawAttachment.url
			: `https://cdn.discordapp.com/stickers/${rawAttachment.id}.${rawAttachment.formatType}`
		: undefined;

	if (!content.length && attachment)
		return {
			attachment,
		};

	return { content, attachment };
};
