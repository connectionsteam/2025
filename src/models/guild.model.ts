import type { Guild } from '@/types/guild';
import { Schema, model } from 'mongoose';

const guildSchema = new Schema<Guild>({
	id: {
		type: String,
		unique: true,
	},
	prefix: String,
	mods: {
		type: [
			{
				id: String,
				type: Number,
			},
		],
	},
	premium: {
		type: {
			type: Number,
		},
		expiresAt: Number,
	},
	metadata: {
		invite: String,
		maxChars: Number,
	},
	connections: [
		{
			name: String,
			webhook: String,
			channelId: String,
			language: String,
			lockedAt: Number,
			blockwords: [String],
			logsChannelId: String,
			flags: {
				type: Number,
				default: 0,
			},
		},
	],
	cases: [
		{
			type: Number,
			id: {
				type: String,
				default() {
					return Date.now().toString(16);
				},
			},
			modId: String,
			reason: String,
			targetId: String,
			createdAt: {
				type: Number,
				default: Date.now,
			},
			connection: String,
			proof: String,
			lifetime: Number,
		},
	],
});

export const guilds = model('guilds', guildSchema);
