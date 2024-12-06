import { Client } from 'seyfert';
import { middlewares } from './middlewares/middlewares';

const client = new Client();

client.setServices({
	middlewares,
	cache: {
		disabledCache: {
			bans: true,
			emojis: true,
			members: true,
			//messages: true,
			overwrites: true,
			presences: true,
			roles: true,
			stageInstances: true,
			stickers: true,
			voiceStates: true,
		},
	},
});

client.start().then(() => client.uploadCommands());
