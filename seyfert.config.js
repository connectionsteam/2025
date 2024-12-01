// @ts-check is better
const { config } = require('seyfert');
const { GatewayIntentBits } = require('seyfert/lib/types');

module.exports = config.bot({
	token: process.env.CLIENT_TOKEN ?? '',
	intents: [
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessagePolls,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	],
	locations: {
		base: 'src',
		output: 'src',
		langs: 'languages',
		events: 'client/events',
		commands: 'client/commands',
	},
	debug: true,
});
