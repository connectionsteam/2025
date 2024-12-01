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
		required: false,
		async autocomplete(interaction) {
			const shards = [...interaction.client.gateway.keys()].map((shard) => ({
				value: shard,
				name: `See about shard #${shard}`,
			}));

			await interaction.respond(shards);
		},
		description: 'See about an especific Connections shard',
	}),
};

@Declare({
	name: 'ping',
	description: 'See the Connections latency.',
	contexts: ['Guild'],
	aliases: ['latency'],
})
@Options(options)
export default class PingCommand extends Command {
	async run(context: CommandContext<typeof options>) {
		const shardId = context.options.shard ?? 0;
		const shard = context.client.gateway.get(shardId);

		if (!shard)
			return context.write({
				content: `We could not find shard **${shardId}**... You can try without this option.`,
				flags: MessageFlags.Ephemeral,
			});

		await context.write({
			content: `Ping: ${(await shard.ping()).toFixed(1)}`,
		});
	}
}
