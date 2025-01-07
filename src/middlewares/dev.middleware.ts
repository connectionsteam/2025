import { createMiddleware } from 'seyfert';

export const devMiddleware = createMiddleware<never>(
	({ context, next, stop }) => {
		const DEV_ID = '963124227911860264';

		if (context.author.id !== DEV_ID)
			return stop('Only Connections developers can use this command');

		next();
	},
);
