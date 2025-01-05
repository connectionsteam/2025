import type {
	Guild,
	Message,
	TextGuildChannel,
	ThreadChannel,
	User,
} from 'seyfert';
import type { ConnectedConnection } from './guild';
import type { Guild as APIGuild } from './guild';

export interface HandleCreateConnectionMessageOptions {
	message: Message;
	repostUser?: User;
	originalGuild: Guild;
	channel: TextGuildChannel;
	connection: ConnectedConnection;
}

export interface CreateThreadMessageOptions {
	guild: APIGuild;
	message: Message;
	thread: ThreadChannel;
}
