import { guilds } from '@/models/guild.model';
import { type Guild, ModType } from '@/types/guild';
import type { ProjectionType } from 'mongoose';
import type { Guild as DiscordGuild } from 'seyfert';

interface FetchGuildOptions {
	id: string;
	guild: DiscordGuild;
	projection?: ProjectionType<Guild>;
}

export const fetchGuild = async ({
	id,
	guild,
	projection,
}: FetchGuildOptions) => {
	return (
		(await guilds.findOne({ id }, projection, { lean: true })) ??
		(
			await guilds.create({
				id,
				mods: [{ type: ModType.Owner, id: guild.ownerId }],
			})
		).toObject()
	);
};
