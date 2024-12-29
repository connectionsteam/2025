import { UserPremiumType } from '@/types/user';
import ms from 'ms';
import {
	ActionRow,
	type Button,
	Command,
	type CommandContext,
	Declare,
	Middlewares,
} from 'seyfert';
import { ButtonStyle, ComponentType } from 'seyfert/lib/types';

@Declare({
	name: 'premium',
	contexts: ['Guild'],
	props: {
		projection: {
			user: 'premium',
		},
	},
	description: 'See your premium status',
})
@Middlewares(['user'])
export default class PremiumCommand extends Command {
	async run(context: CommandContext<never, 'user'>) {
		const {
			user: { premium },
		} = context.metadata;

		if (!premium)
			return context.write({
				content: `We didn't find any active premium on your account. Let's Buy!`,
				components: [
					new ActionRow<Button>({
						components: [
							{
								label: 'Go to Premium',
								style: ButtonStyle.Link,
								type: ComponentType.Button,
								url: 'https://connections.squareweb.app/premium',
							},
						],
					}),
				],
			});

		const isGang = premium.type === UserPremiumType.Gang;

		await context.write({
			content: `✨ You have a **${isGang ? 'Gang' : 'Connections+'}** subscription ${isGang ? `with ${premium.members.length} members` : ''}that expires in ${ms(premium.expiresAt - Date.now())}.`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							style: ButtonStyle.Link,
							type: ComponentType.Button,
							label: 'View My Subscriptions',
							url: 'https://connections.squareweb.app/subscriptions',
						},
					],
				}),
			],
		});
	}
}
