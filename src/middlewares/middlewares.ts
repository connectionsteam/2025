import { devMiddleware } from './dev.middleware';
import { guildMiddleware } from './guild.middleware';
import { userMiddleware } from './user.middleware';

export const middlewares = {
	dev: devMiddleware,
	user: userMiddleware,
	guild: guildMiddleware,
};
