import type { Connection } from '@/types/connection';
import { Schema, model } from 'mongoose';

const connectionSchema = new Schema<Connection>({
	name: {
		type: String,
		unique: true,
	},
	icon: String,
	teamId: String,
	description: String,
	invite: String,
	pausedAt: Number,
	creatorId: String,
	createdAt: {
		type: Number,
		default: Date.now,
	},
	promotingSince: Number,
	type: { type: Number },
	likes: [
		{
			user: String,
			count: Number,
			lastLikeAt: Number,
		},
	],
	metadata: {
		rules: String,
		minMembers: Number,
		maxConnections: Number,
	},
});

export const connections = model('connections', connectionSchema);
