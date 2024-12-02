import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import type { ReferenceMessage } from '@/types/messages';
import type { Message } from 'seyfert';
import { resolveAuthorId } from './resolveAuthorId';

export const fetchReference = async (message: Message) => {
	const referencedMessage = message.referencedMessage!;

	const data = await messages.findOne(
		{
			$or: [
				{ id: referencedMessage.id },
				{ 'children.id': referencedMessage.id },
			],
		},
		{ channelId: true, authorId: true },
		{ lean: true },
	);

	if (data) {
		const userId =
			referencedMessage.author.id === message.client.me.id
				? resolveAuthorId(referencedMessage.embeds)
				: message.author.id;

		const author = await users.findOne(
			{ userId },
			{ allowMentions: true },
			{ lean: true },
		);

		return {
			data,
			author,
			message: referencedMessage,
		} as unknown as ReferenceMessage;
	}
};
