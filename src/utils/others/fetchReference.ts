import { messages } from '@/models/messages.model';
import { users } from '@/models/users.model';
import type { ReferenceMessage } from '@/types/messages';
import type { Message } from 'seyfert';

export const fetchReference = async (message: Message) => {
	const { referencedMessage } = message;
	if (!referencedMessage) return;

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
		const author = await users.findOne(
			{ id: data.authorId },
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
