import { Command, Declare, IgnoreCommand, Options } from 'seyfert';
import { PermissionFlagsBits } from 'seyfert/lib/types';
import { AddTimeoutSubCommand } from './add.command';

@Declare({
	name: 'timeout',
	contexts: ['Guild'],
	ignore: IgnoreCommand.Message,
	description: 'Add or Remove timeout from a user',
	defaultMemberPermissions:
		PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.MuteMembers,
})
@Options([AddTimeoutSubCommand])
export default class TimeoutCommand extends Command {}
