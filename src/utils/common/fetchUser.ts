import { users } from '@/models/users.model';
import type { User } from '@/types/user';
import type { ProjectionType } from 'mongoose';

export const fetchUser = async (
	id: string,
	projection?: ProjectionType<User>,
) => {
	return (
		(await users.findOne({ id }, projection, { lean: true })) ??
		(await users.create({ id })).toObject()
	);
};
