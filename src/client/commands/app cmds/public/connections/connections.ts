import { Command, Declare, IgnoreCommand, Options } from 'seyfert';
import { CreateConnectionSubcommand } from './create.command';
import { JoinConnectionSubcommand } from './join.command';

@Declare({
	name: 'connections',
	description: 'Connections commands.',
	contexts: ['Guild'],
	ignore: IgnoreCommand.Message,
})
@Options([CreateConnectionSubcommand, JoinConnectionSubcommand])
export default class ConnectionsCommand extends Command {}
