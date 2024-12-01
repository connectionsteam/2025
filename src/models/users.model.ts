import type { User } from '@/types/user';
import { Schema, model } from 'mongoose';

const userSchema = new Schema<User>({
	id: {
		type: String,
		unique: true,
	},
	allowMentions: {
		type: Boolean,
		default: true,
	},
	blacklist: {
		type: {
			devId: {
				type: String,
				required: true,
			},
			reason: String,
			blacklistedAt: {
				type: Number,
				default: Date.now,
			},
		},
	},
	achievements: {
		type: [Object],
	},
	bookmarks: { type: Object },
	notifications: [
		{
			type: {
				type: Number,
				required: true,
			},
			content: {
				type: String,
				required: true,
			},
			sentTimestamp: {
				type: Number,
				default: Date.now,
			},
			id: {
				type: String,
				default() {
					return Date.now().toString(16);
				},
			},
			msgURL: String,
			teamId: String,
			codeId: String,
			backupId: String,
			_id: false,
		},
	],
	follows: {
		type: [String],
		default: [],
	},
});

export const users = model('users', userSchema);