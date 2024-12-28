import type { Thread } from '@/types/thread';
import { Schema, model } from 'mongoose';

const threadSchema = new Schema<Thread>(
	{
		id: {
			type: String,
			unique: true,
			required: true,
		},
		creatorId: {
			type: String,
			required: true,
		},
		children: {
			type: [String],
			default: [],
		},
		createdTimestamp: {
			type: Number,
			default: Date.now,
		},
	},
	{ versionKey: false },
).index({ creatorId: -1 });

export const threads = model('threads', threadSchema);
