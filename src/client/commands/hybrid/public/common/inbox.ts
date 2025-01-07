import { NotificationType } from '@/types/user';
import {
	Command,
	type CommandContext,
	Declare,
	Middlewares,
	Options,
	createIntegerOption,
	createStringOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	id: createStringOption({
		description: 'Enter the unique ID of the notification',
		description_localizations: {
			'pt-BR': 'Insira o ID único da notificação',
		},
	}),
	type: createIntegerOption({
		description: 'Kind of notification to filter',
		description_localizations: {
			'pt-BR': 'O tipo de filtro para a notificação',
		},
		choices: [
			{
				name: 'User Replies',
				name_localizations: {
					'pt-BR': 'Respostas de Usuário',
				},
				value: NotificationType.Reply,
			},
			{
				name: 'Team Invites',
				name_localizations: {
					'pt-BR': 'Invites de Times',
				},
				value: NotificationType.TeamInvite,
			},
			{
				name: 'Server Backups',
				name_localizations: {
					'pt-BR': 'Backups de Servidores',
				},
				value: NotificationType.Backup,
			},
			{
				name: 'User Gifts',
				name_localizations: {
					'pt-BR': 'Presentes de Usuários',
				},
				value: NotificationType.Gift,
			},
			{
				name: 'Connections Team 🤍',
				name_localizations: {
					'pt-BR': 'Time do Connections 🤍',
				},
				value: NotificationType.Internal,
			},
		],
	}),
};

@Declare({
	name: 'inbox',
	description: 'See your inbox with all notifications.',
	props: {
		projection: {
			user: 'notifications',
		},
	},
	contexts: ['Guild'],
})
@Options(options)
@Middlewares(['user'])
export default class InboxCommand extends Command {
	async run(context: CommandContext<typeof options, 'user'>) {
		const { user } = context.metadata;
		const responses = context.t.get();

		if (!user.notifications?.length)
			return context.editOrReply({
				content: responses.userDoesntHaveNotifications,
				flags: MessageFlags.Ephemeral,
			});

		const { id, type } = context.options;

		if (id && type)
			return context.editOrReply({
				content: responses.cantUseBothOptionsInInbox,
				flags: MessageFlags.Ephemeral,
			});

		await context.write(responses.inboxCommand(id, type));
	}
}
