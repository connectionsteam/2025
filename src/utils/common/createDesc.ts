export const createDesc = (desc: string, aliases: string[]) =>
	`(${aliases.join(', ')}): ${desc}`;
