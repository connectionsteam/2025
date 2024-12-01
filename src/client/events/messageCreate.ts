import { fetchGuild } from '@/utils/common/fetchGuild';
import { fetchUser } from '@/utils/common/fetchUser';
import { createEvent } from 'seyfert';

export default createEvent({
	data: { name: 'messageCreate' },
	async run(message) {
		if (message.author.bot || message.webhookId || !message.guildId) return;

		const channel = await message.channel();

		if (!channel.isTextGuild() && !channel.isThread()) return;

		if (message.content === `<@${message.client.me.id}>`)
			return message.reply({
				content: 'Hi',
				allowed_mentions: { parse: [] },
			});

		const user = await fetchUser(message.author.id, {
			blacklist: true,
			notifications: true,
		});

		if (user.blacklist) return;

		const guild = await message.guild();

		if (!guild) return;

		const fetchedGuild = await fetchGuild({
			guild,
			id: message.guildId,
			projection: 'connections',
		});

		if (channel.isThread()) return;

		const connection = fetchedGuild.connections?.find(
			(connection) => connection.channelId === message.channelId,
		);

		if (!connection) return;
	},
});
