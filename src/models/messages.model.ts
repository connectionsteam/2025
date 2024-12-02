import type { ConnectionMessage } from '@/types/messages';
import { Schema, model } from 'mongoose';

const messageSchema = new Schema<ConnectionMessage>(
	{
		id: {
			type: String,
			unique: true,
			required: true,
		},
		channelId: {
			type: String,
			required: true,
		},
		authorId: {
			type: String,
			required: true,
		},
		children: {
			type: [Object],
			required: true,
		},
		connection: {
			type: String,
			required: true,
		},
		reference: String,
	},
	{ versionKey: false },
).index({ 'children.id': 1, channelId: 1 });

export const messages = model('messages', messageSchema);
