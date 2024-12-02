import type { APIEmbed } from 'seyfert/lib/types';

export const resolveAuthorId = (embeds: APIEmbed[]) =>
	embeds[0]?.author?.icon_url?.split('/', 5)?.[4];
