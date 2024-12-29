import { devMiddleware } from './dev.middleware';
import { guildMiddleware } from './guild.middleware';
import { nopMiddleware } from './nop.middleware';
import { userMiddleware } from './user.middleware';

export const middlewares = {
	nop: nopMiddleware,
	dev: devMiddleware,
	user: userMiddleware,
	guild: guildMiddleware,
};
