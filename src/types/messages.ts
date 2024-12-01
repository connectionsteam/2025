export interface MessageChild {
	id: string;
	channelId: string;
}

export interface ConnectionMessage extends MessageChild {
	authorId: string;
	connection: string;
	children: MessageChild[];
	reference?: string;
}
