import { createMiddleware } from "seyfert";

export const nopMiddleware = createMiddleware<never>(({ context, next, stop }) => {
    if (context.author.id !== '963124227911860264') return stop('Nananinanão');

    return next();
});
