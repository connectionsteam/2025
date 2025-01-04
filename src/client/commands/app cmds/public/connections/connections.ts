import { Command, Declare, IgnoreCommand, Options } from 'seyfert';
import { CreateConnectionSubcommand } from './create.command';
import { JoinConnectionSubcommand } from './join.command';

@Declare({
	name: 'connections',
	contexts: ['Guild'],
	ignore: IgnoreCommand.Message,
	description: 'Manage your connections.',
})
@Options([CreateConnectionSubcommand, JoinConnectionSubcommand])
export default class ConnectionsCommand extends Command {}
