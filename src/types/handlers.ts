import type { Guild as DGuild, Message, TextGuildChannel } from 'seyfert';
import type { ConnectedConnection, Guild } from './guild';
import type { User } from './user';

export interface HandleCreateConnectionMessageOptions {
	user: User;
	guild: DGuild;
	message: Message;
	fetchedGuild: Guild;
	channel: TextGuildChannel;
	connection: ConnectedConnection;
}
