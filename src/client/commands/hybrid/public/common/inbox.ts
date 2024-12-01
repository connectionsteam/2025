import { type Notification, NotificationType } from '@/types/user';
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
	}),
	type: createIntegerOption({
		description: 'Kind of notification to filter',
		choices: [
			{
				name: 'User Replies',
				name_localizations: {
					'pt-BR': 'Respostas de Usuários',
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

		if (!user.notifications?.length)
			return context.editOrReply({
				content: 'You dont have notifications yet.',
				flags: MessageFlags.Ephemeral,
			});

		const { id, type } = context.options;

		if (id && type)
			return context.editOrReply({
				content: 'You cant use both options to fetch your notifications.',
				flags: MessageFlags.Ephemeral,
			});
		if (id) return this.viewSingleNotification(context, id, user.notifications);

		return this.viewNotifications(context, user.notifications, type);
	}

	viewSingleNotification(
		context: CommandContext,
		id: string,
		notifications: Notification[],
	) {
		const notification = notifications.find(
			(notification) => notification.id === id,
		);

		if (!notification)
			return context.editOrReply({
				content: 'We could not find any notification with this ID.',
				flags: MessageFlags.Ephemeral,
			});

		return context.editOrReply({
			content: `Notificação: ${notification}`,
			flags: MessageFlags.Ephemeral,
		});
	}

	viewNotifications(
		context: CommandContext,
		notifications: Notification[],
		type?: NotificationType,
	) {
		const filteredNotifications = type
			? notifications.filter((notification) => notification.type === type)
			: notifications;

		if (filteredNotifications.length === 0)
			return context.editOrReply({
				content: 'No notifications found with the criteria.',
				flags: MessageFlags.Ephemeral,
			});

		return context.editOrReply({
			content: notifications.map((a) => `${a.id} - ${a.content}`).join('\n'),
			flags: MessageFlags.Ephemeral,
		});
	}
}
