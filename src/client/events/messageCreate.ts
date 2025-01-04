import { handleCreateConnectionMessage } from '@/handlers/utils/handleCreateConnectionMessage';
import { handleCreateThreadMessage } from '@/handlers/utils/handleCreateThreadMessage';
import { fetchGuild } from '@/utils/common/fetchGuild';
import { fetchUser } from '@/utils/common/fetchUser';
import { createEvent } from 'seyfert';

export default createEvent({
	data: { name: 'messageCreate' },
	async run(message) {
		if (message.author.bot || message.webhookId || !message.guildId) return;

		const channel = await message.channel();

		if (!channel.isTextGuild() && !channel.isThread()) return;

		const user = await fetchUser(message.author.id, {
			blacklist: true,
			notifications: true,
		});

		if (user.blacklist) return;
		if (message.content === `<@${message.client.me.id}>`)
			return message.reply({
				allowed_mentions: { parse: [] },
				content: '**Discover Connections**\n[connections.squareweb.app](https://connections.squareweb.app)\n\n**Our Assistance**\nhttps://discord.gg/RXBRraTWeY',
			});

		const guild = await message.guild();

		if (!guild) return;

		const fetchedGuild = await fetchGuild({
			guild,
			id: message.guildId,
			projection: 'connections',
		});

		if (channel.isThread())
			return handleCreateThreadMessage({
				message,
				thread: channel,
				guild: fetchedGuild,
			});

		const connection = fetchedGuild.connections?.find(
			(connection) => connection.channelId === message.channelId,
		);

		if (!connection) return;

		await handleCreateConnectionMessage({
			guild,
			channel,
			message,
			connection,
		});
	},
});
