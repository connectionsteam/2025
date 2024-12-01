import { createMiddleware } from 'seyfert';

export const devMiddleware = createMiddleware<never>(
	({ context, next, pass }) => {
		const DEV_ID = '963124227911860264';

		if (context.author.id !== DEV_ID) return pass();

		next();
	},
);
