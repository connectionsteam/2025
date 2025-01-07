import { users } from '@/models/users.model';
import { createDesc } from '@/utils/common/createDesc';
import {
	Command,
	type CommandContext,
	Declare,
	IgnoreCommand,
	Middlewares,
} from 'seyfert';

@Declare({
	name: 'whotofollow',
	description: createDesc('Discover amazing users to follow', ['whotofollow']),
	contexts: ['Guild'],
	ignore: IgnoreCommand.Message,
	props: {
		projection: {
			user: 'follows',
		},
	},
})
@Middlewares(['user'])
export default class WTFCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		const responses = context.t.get();

		await context.editOrReply({
			content: responses.whotofollowWait,
		});

		const fetchedUsers = await users.aggregate([
			{
				$match: { id: context.author.id },
			},
			{
				$lookup: {
					from: 'messages',
					localField: 'id',
					foreignField: 'authorId',
					as: 'userMessages',
				},
			},
			{
				$unwind: '$userMessages',
			},
			{
				$group: {
					_id: '$userMessages.connection',
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 3 },
			{
				$lookup: {
					from: 'connections',
					localField: '_id',
					foreignField: '_id',
					as: 'favoriteConnections',
				},
			},
			{
				$unwind: '$favoriteConnections',
			},
			{ $project: { tags: '$favoriteConnections.tags' } },
			{
				$unwind: '$tags',
			},
			{
				$group: { _id: null, allTags: { $addToSet: '$tags' } },
			},
			{
				$lookup: {
					from: 'messages',
					localField: 'allTags',
					foreignField: 'connection',
					as: 'relatedMessages',
				},
			},
			{
				$unwind: '$relatedMessages',
			},
			{
				$group: {
					_id: '$relatedMessages.authorId',
					count: { $sum: 1 },
				},
			},
			{
				$match: { _id: { $ne: context.author.id } },
			},
			{ $sort: { count: -1 } },
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: 'id',
					as: 'userDetails',
				},
			},
			{ $unwind: '$userDetails' },
			{
				$project: {
					id: '$userDetails.id',
					ttmCount: '$userDetails.ttmCount',
					achievements: { $size: '$userDetails.achievements' },
					score: {
						$add: [
							{ $ifNull: ['$userDetails.ttmCount', 0] },
							{ $size: '$userDetails.achievements' },
						],
					},
				},
			},
			{ $sort: { score: -1 } },
			{ $limit: 3 },
		]);

		if (!fetchedUsers.length)
			return context.editOrReply({
				content: responses.noUsersToFollow,
			});

		await context.editOrReply({
			content: fetchedUsers.map(({ id }) => `<@${id}>`).join('\n'),
			allowed_mentions: {
				parse: [],
			},
		});
	}
}
