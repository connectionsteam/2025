import { connect } from 'mongoose';
import { createEvent } from 'seyfert';

export default createEvent({
	data: { name: 'botReady', once: true },
	async run(_, client) {
		await connect(process.env.DATABASE_URL as string);

		client.logger.debug('Database connected successfully');
	},
});
