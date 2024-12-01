import { guilds } from '@/models/guild.model';
import { type Guild, ModType } from '@/types/guild';
import { createMiddleware } from 'seyfert';

export const guildMiddleware = createMiddleware<Guild>(
	async ({ context, next }) => {
		const data = await guilds.findOne(
			{ id: context.guildId },
			context.command.props.projection?.guild,
			{ lean: true },
		);

		if (!data) {
			const created = await guilds.create({
				id: context.guildId,
				mods: [
					{
						type: ModType.Owner,
						id: (await context.guild('flow'))?.ownerId,
					},
				],
			});

			return next(created.toObject());
		}

		next(data);
	},
);
