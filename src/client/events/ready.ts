import { connect } from 'mongoose';
import { createEvent } from 'seyfert';
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types';

export default createEvent({
	data: { name: 'botReady', once: true },
	async run(_, client) {
		await connect(process.env.DATABASE_URL as string);

		client.logger.debug('Database connected successfully');

		setTimeout(() => {
			const states = [
				`🤍 ${client.cache.guilds?.count()} guilds out there`,
				'#2025',
				`🤍 Connecting ${client.cache.users?.count()} users`,
				'connections.squareweb.app',
			];

			client.gateway.setPresence({
				activities: [
					{
						name: 'a',
						type: ActivityType.Custom,
						state: states[states.length * Math.random()],
					},
				],
				afk: false,
				since: null,
				status: PresenceUpdateStatus.Online,
			});
		}, 60000);
	},
});
