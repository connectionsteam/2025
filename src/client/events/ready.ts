import { connect } from 'mongoose';
import { createEvent } from 'seyfert';
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types';

export default createEvent({
	data: { name: 'botReady', once: true },
	async run(_, client) {
		await connect(process.env.MONGOOSE_URL as string);

		client.logger.debug('Database connected successfully');

		client.gateway.setPresence({
			activities: [
				{
					name: 'a',
					type: ActivityType.Custom,
					state: `🤍 ${client.cache.users?.count()} users talking`,
				},
				{
					name: 'b',
					type: ActivityType.Custom,
					state: `🤍 ${client.cache.guilds?.count()} guilds out there`,
				},
			],
			afk: false,
			since: null,
			status: PresenceUpdateStatus.Online,
		});
	},
});
