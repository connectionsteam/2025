export interface MessageChild {
	id: string;
	channelId: string;
}

export interface ConnectionMessage extends MessageChild {
	authorId: string;
	children: string[];
	connection: string;
}
