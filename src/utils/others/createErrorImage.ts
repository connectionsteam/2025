import type { CommandContext } from 'seyfert';

export const createErrorImage = async (context: CommandContext) => {
	await context.editOrReply({
		attachments: [{}],
	});
};
