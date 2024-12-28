import type { APIMessage } from 'seyfert/lib/types';
import type { User } from './user';

export interface MessageChild {
	id: string;
	channelId: string;
}

export interface ConnectionMessage extends MessageChild {
	authorId: string;
	connection: string;
	reference?: string;
	boostCount?: number;
	children: MessageChild[];
}

export interface ReferenceMessage {
	author: User;
	message: APIMessage;
	data: ConnectionMessage;
}
