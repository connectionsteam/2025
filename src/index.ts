import { Client } from 'seyfert';
import { middlewares } from './middlewares/middlewares';

const client = new Client({
	commands: {
		prefix: () => ['c.'],
	},
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
		},
	},
});

client.start().then(() => client.uploadCommands());
