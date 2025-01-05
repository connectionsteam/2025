import {
	type ConnectedConnection,
	ConnectedConnectionFlags,
} from '@/types/guild';
import type { Message } from 'seyfert';
import urlRegex from 'url-regex';
import { isImageOrVideo } from '../others/isImageOrVideo';

interface FormatContentOptions {
	message: Message;
	connection: ConnectedConnection;
}

export const formatContent = ({
	connection: { flags },
	message: { content, attachments },
}: FormatContentOptions) => {
	const isMissing = (flag: ConnectedConnectionFlags) => !(flags & flag);

	if (isMissing(ConnectedConnectionFlags.AllowWallOfText))
		content = content.replace('\n', '');
	if (isMissing(ConnectedConnectionFlags.AllowInvites))
		content = content.replace(
			/(?:https?:\/\/)?(?:discord\.(?:gg|com|invite)|dsc\.gg)\/?[\s+]*(?:\S+)?[\s+]*(\w+)/gi,
			'',
		);
	if (isMissing(ConnectedConnectionFlags.AllowEmojis))
		content = content.replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/g, '');
	if (isMissing(ConnectedConnectionFlags.AllowLinks))
		content = content.replace(urlRegex({ strict: false }), '');
	if (isMissing(ConnectedConnectionFlags.AllowFiles)) return { content };

	const attachment = attachments.find(isImageOrVideo)?.url;

	return { content, attachment };
};
