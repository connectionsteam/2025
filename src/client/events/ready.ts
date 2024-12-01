import { connections } from '@/models/connection.model';
import { connect } from 'mongoose';
import { createEvent } from 'seyfert';
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types';

export default createEvent({
	data: { name: 'botReady', once: true },
	async run(user, client) {
		await connect(process.env.MONGOOSE_URL as string);

		client.logger.debug('Database connected successfully');

		const connectionsCount = await connections.countDocuments();

		client.gateway.setPresence({
			activities: [
				{
					name: '',
					type: ActivityType.Custom,
					state: `${connectionsCount} amazing connections to discover 🤍`,
				},
			],
			afk: false,
			since: null,
			status: PresenceUpdateStatus.Online,
		});
	},
});
