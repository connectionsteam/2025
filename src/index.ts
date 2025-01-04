import { Client } from 'seyfert';
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types';
import { middlewares } from './middlewares/middlewares';

const client = new Client({
	commands: {
		prefix: () => ['c.'],
	},
	presence: () => ({
		afk: false,
		since: null,
		status: PresenceUpdateStatus.Online,
		activities: [
			{
				name: '.',
				state: '#2025',
				type: ActivityType.Custom,
			},
		],
	}),
});

client.setServices({
	middlewares,
	cache: {
		disabledCache: {
			bans: true,
			emojis: true,
			members: true,
			overwrites: true,
			presences: true,
			roles: true,
			stageInstances: true,
			stickers: true,
			voiceStates: true,
			onPacket: true,
			messages: true,
		},
	},
});

client.start().then(() => client.uploadCommands());
