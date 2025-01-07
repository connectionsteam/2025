import { guilds } from '@/models/guild.model';
import { CaseType } from '@/types/guild';
import { createDesc } from '@/utils/common/createDesc';
import {
	type CommandContext,
	Declare,
	Middlewares,
	SubCommand,
	createStringOption,
	createUserOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	user: createUserOption({
		required: true,
		description: 'Enter the @mention of the user',
		description_localizations: {
			'pt-BR': 'Insira a @menção do usuário',
		},
	}),
	connection: createStringOption({
		description: 'Enter the name of the connection',
		description_localizations: {
			'pt-BR': 'Insira o nome da conexão',
		},
	}),
	// TODO: Add reason option here later
};

@Declare({
	name: 'remove',
	props: {
		projection: {
			guild: { mods: true, cases: true, connections: true },
		},
	},
	description: createDesc('Remove timeout from a user', ['unmute']),
})
@Middlewares(['guild'])
export class RemoveTimeoutSubCommand extends SubCommand {
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

		const { user } = context.options;
		const userTimeout = guild.cases?.find(
			(crrCase) =>
				crrCase.connection === connection.name &&
				crrCase.type === CaseType.Timeout &&
				crrCase.targetId === user.id,
		);

		if (!userTimeout)
			return context.write({
				content: responses.userIsNotTimedOut,
				flags: MessageFlags.Ephemeral,
			});

		await Promise.allSettled([
			context.write({
				content: responses.userTimeoutRemoval,
			}),
			guilds.updateOne(
				{
					// @ts-expect-error this works
					_id: guild._id,
				},
				{ $pull: { cases: { id: userTimeout.id } } },
			),
		]);
	}
}
