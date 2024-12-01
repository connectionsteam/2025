import { connections } from '@/models/connection.model';
import {
	Command,
	type CommandContext,
	Declare,
	Options,
	createStringOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	connection: createStringOption({
		required: true,
		description: 'Enter the name of connection to like',
		async autocomplete(interaction) {
			const name = interaction.options.getAutocompleteValue();
			const isEmpty = !name?.length;

			const topConnections = await connections.aggregate([
				{
					$match:
						isEmpty ? {} : { name: { $regex: name, $options: 'i' } },
				},
				{
					$project: {
						name: 1,
						likes: 1,
						likesCount: { $sum: '$likes.count' },
					},
				},
				{ $sort: { likesCount: -1 } },
				{ $limit: isEmpty ? 5 : 25 },
			]);

			if (topConnections.length === 0)
				return interaction.respond([
					{
						value: 'unknown_connection',
						name: 'Team - We could not find a connection with this name...',
						name_localizations: {
							'pt-BR':
								'Time - Nós não conseguis encontrar alguma conexão com este nome...',
						},
					},
				]);

			await interaction.respond(
				topConnections.map(({ name, likesCount }, position) => ({
					value: `${name}`,
					name: `#${position + 1} ${name} with ${likesCount} likes`,
					name_localizations: {
						'pt-BR': `${position + 1} ${name} com ${likesCount} likes`,
					},
				})),
			);
		},
	}),
};

@Declare({
	name: 'like',
	aliases: ['l'],
	contexts: ['Guild'],
	description: 'Like any connection you want!',
})
@Options(options)
export default class LikeCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		const { connection } = context.options;
		const responses = context.t.get();

		if (!connection || connection === 'unknown_connection')
			return context.editOrReply({
				content: responses.unknownConnection,
				flags: MessageFlags.Ephemeral,
			});

		const fetchedConnection = await connections.findOne(
			{ name: connection },
			'likes',
			{ lean: true },
		);

		if (!fetchedConnection)
			return context.editOrReply({
				content: responses.unknownConnection,
				flags: MessageFlags.Ephemeral,
			});

		const userLike = fetchedConnection.likes?.find(
			({ user }) => user === context.author.id,
		);

		if (userLike && userLike.lastLikeAt > 1)
			return context.editOrReply({
				content: responses.userCantLike(Date.now() - userLike.lastLikeAt),
				flags: MessageFlags.Ephemeral,
			});

		const query = { name: connection };

		// @ts-expect-error Ignore this
		if (userLike) query['likes.user'] = context.author.id;

		const update = userLike
			? {
					$inc: { 'likes.$.count': 1 },
					$set: { 'likes.$.lastLikeAt': Date.now() },
				}
			: {
					$push: {
						likes: {
							count: 1,
							lastLikeAt: Date.now(),
							user: context.author.id,
						},
					},
				};

		await connections.updateOne(query, update);

		await context.editOrReply({
			content: 'vc votou bla bla bla',
		});
	}
}
