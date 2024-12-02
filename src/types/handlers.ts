import type { Guild, Message, TextGuildChannel, User } from 'seyfert';
import type { ConnectedConnection } from './guild';

export interface HandleCreateConnectionMessageOptions {
	guild: Guild;
	message: Message;
	repostUser?: User;
	channel: TextGuildChannel;
	connection: ConnectedConnection;
}
