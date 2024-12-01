import { connect } from 'mongoose';
import { createEvent } from 'seyfert';

export default createEvent({
	data: { name: 'botReady', once: true },
	async run(user, client) {
		await connect(
			'mongodb+srv://paiton:998669277@cluster0.ltucfl5.mongodb.net/test?retryWrites=true&w=majority',
		);

		client.logger.info(`${user.name} is ready.`);
	},
});
