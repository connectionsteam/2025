import { guilds } from '@/models/guild.model';
import { CaseType, ConnectedConnectionFlags } from '@/types/guild';
import { createDesc } from '@/utils/common/createDesc';
import { isImageOrVideo } from '@/utils/others/isImageOrVideo';
import parseMs from 'ms';
import {
	type CommandContext,
	Declare,
	Middlewares,
	SubCommand,
	createAttachmentOption,
	createStringOption,
	createUserOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	user: createUserOption({
		required: true,
		description: 'Enter the @mention of the user to timeout',
		description_localizations: {
			'pt-BR': 'Insira a @menção do usuário para silenciar',
		},
	}),
	duration: createStringOption({
		required: true,
		description: 'Duration of the timeout, 3m format',
		description_localizations: {
			'pt-BR': 'Duração para o silencimento, no formato 3m',
		},
		autocomplete(interaction) {
			const input = interaction.getInput();
			const parsed = parseMs(input || 'x');

			if (!parsed)
				return interaction.respond([
					{
						value: 'invalid_time',
						name: 'Connections - Invalid timeout duration, try 3m format.',
						name_localizations: {
							'pt-BR':
								'Connections - Duração do silenciamento inválida, tente no formato 3m.',
						},
					},
				]);

			const THREE_MIN_IN_MS = 180000;
			const SEVEN_DAYS_IN_MS = 6.048e8;

			if (parsed < THREE_MIN_IN_MS || parsed > SEVEN_DAYS_IN_MS)
				return interaction.respond([
					{
						value: 'invalid_time',
						name: 'Connections - Duration must be beetwen 3 minutes and 7 days.',
						name_localizations: {
							'pt-BR':
								'Connections - A duração deve ser entre 3 minutos e 7 dias.',
						},
					},
				]);

			return interaction.respond([
				{
					value: String(parsed),
					name: `Connections - Use ${parsed} as the duration`,
					name_localizations: {
						'pt-BR': `Connections - Usar ${parsed} como a duração`,
					},
				},
			]);
		},
	}),
	connection: createStringOption({
		description: 'Enter the name of the connection',
		description_localizations: {
			'pt-BR': 'Insira o nome da conexão',
		},
	}),
	reason: createStringOption({
		min_length: 5,
		description: 'Enter the reason for the timeout',
		description_localizations: {
			'pt-BR': 'Insira a razão para o silenciamento',
		},
	}),
	proof: createAttachmentOption({
		description: 'An image or video to use as proof for this action',
		description_localization: {
			'pt-BR': 'Uma imagem ou vídeo para usar como prova desta ação',
		},
	}),
};

@Declare({
	name: 'add',
	description: createDesc('Add timeout in a user', ['mute']),
	props: {
		projection: {
			guild: { mods: true, cases: true, connections: true },
		},
	},
})
@Middlewares(['guild'])
export class AddTimeoutSubCommand extends SubCommand {
	async run(context: CommandContext<typeof options, 'guild'>) {
		const { guild } = context.metadata;
		const responses = context.t.get();

		if (!guild.mods.some((mod) => mod.id === context.author.id))
			return context.write({
				content: responses.userIsNotMod,
				flags: MessageFlags.Ephemeral,
			});

		const { connection: name = 'global' } = context.options;

		const connection = guild.connections?.find(
			(connection) => connection.name === name,
		);

		if (!connection)
			return context.write({
				content: responses.unknownConnection,
				flags: MessageFlags.Ephemeral,
			});

		const isConnectionLocked =
			connection.lockedAt ||
			connection.flags & ConnectedConnectionFlags.Inactive;

		if (isConnectionLocked)
			return context.write({
				content: responses.cannotTimeoutUserInLockedConnection,
				flags: MessageFlags.Ephemeral,
			});

		const duration = Number(context.options.duration);

		if (Number.isNaN(duration))
			return context.write({
				content: responses.invalidTimeoutDuration,
				flags: MessageFlags.Ephemeral,
			});

		const { user } = context.options;
		const isUserInvalid =
			user.bot || guild.mods.some((mod) => mod.id === user.id);

		if (isUserInvalid)
			return context.write({
				content: responses.cantTimeoutThisUser,
				flags: MessageFlags.Ephemeral,
			});

		const userCase = guild.cases?.find(
			(crrCase) =>
				crrCase.connection === connection.name && crrCase.targetId === user.id,
		);

		if (userCase) {
			if (userCase.type === CaseType.Ban)
				return context.write({
					content: responses.cannotTimeoutABannedUser,
					flags: MessageFlags.Ephemeral,
				});

			await context.write({
				content: responses.userAlreadyTimedOut,
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		const { proof } = context.options;

		if (proof && !isImageOrVideo(proof))
			return context.write({
				content: responses.invalidProof,
				flags: MessageFlags.Ephemeral,
			});

		await Promise.allSettled([
			context.write({
				content: responses.userTimedOut(user.id),
			}),
			guilds.updateOne(
				// @ts-expect-error This works perfectly
				{ _id: guild._id },
				{
					$push: {
						cases: {
							type: CaseType.Timeout,
							modId: context.author.id,
							reason: context.options.reason,
							targetId: user.id,
							connection: name,
							proof: proof?.url,
							lifetime: Date.now() + duration,
						},
					},
				},
			),
		]);
	}
}
