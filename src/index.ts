import { Client } from 'seyfert';
import { middlewares } from './middlewares/middlewares';

const client = new Client();

client.setServices({
	middlewares,
	cache: {
		disabledCache: {
			bans: false,
			emojis: false,
			members: false,
			messages: false,
			overwrites: false,
			presences: false,
			roles: false,
			stageInstances: false,
			stickers: false,
			voiceStates: false,
		},
	},
});

client.start().then(() => client.uploadCommands);
