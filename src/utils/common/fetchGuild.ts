import { guilds } from '@/models/guild.model';
import { type Guild, ModType } from '@/types/guild';
import type { ProjectionType } from 'mongoose';
import type { Guild as DiscordGuild } from 'seyfert';

interface FetchGuildOptions {
	projection?: ProjectionType<Guild>;
	guild: DiscordGuild<'api' | 'cached'>;
}

export const fetchGuild = async ({ guild, projection }: FetchGuildOptions) => {
	return (
		(await guilds.findOne({ id: guild.id }, projection, { lean: true })) ??
		(
			await guilds.create({
				id: guild.id,
				mods: [{ type: ModType.Owner, id: guild.ownerId }],
			})
		).toObject()
	);
};
