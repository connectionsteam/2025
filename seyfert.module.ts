import type English from '@/languages/en';
import type { middlewares } from '@/middlewares/middlewares';
import type { Guild } from '@/types/guild';
import type { User } from '@/types/user';
import type { ProjectionType } from 'mongoose';
import type {
	Client,
	ParseClient,
	ParseLocales,
	ParseMiddlewares,
} from 'seyfert';

declare module 'seyfert' {
	interface UsingClient extends ParseClient<Client<true>> {}

	interface RegisteredMiddlewares
		extends ParseMiddlewares<typeof middlewares> {}

	interface ExtraProps {
		projection?: {
			user?: ProjectionType<User>;
			guild?: ProjectionType<Guild>;
		};
	}

	interface DefaultLocale extends ParseLocales<typeof English> {}
}
