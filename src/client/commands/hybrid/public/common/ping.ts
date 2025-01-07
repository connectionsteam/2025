import { createDesc } from '@/utils/common/createDesc';
import {
	Command,
	type CommandContext,
	Declare,
	Options,
	createIntegerOption,
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
	shard: createIntegerOption({
		description: 'See about an especific shard',
		description_localizations: {
			'pt-BR': 'Veja sobre um fragmento específico',
		},
	}),
};

@Declare({
	name: 'ping',
	contexts: ['Guild'],
	aliases: ['latency', 'status'],
	description: createDesc('See the Connections latency.', [
		'ping',
		'status',
		'latency',
	]),
})
@Options(options)
export default class PingCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		const responses = context.t.get();
		const shardId = context.options.shard ?? 0;
		const shard = context.client.gateway.get(shardId);

		if (!shard)
			return context.write({
				content: responses.couldntFindShard,
				flags: MessageFlags.Ephemeral,
			});

		await context.write({
			content: `Ping: ${(await shard.ping()).toFixed(1)}`,
		});
	}
}
