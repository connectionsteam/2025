export const isNewAccount = (createdTimestamp: number) => {
	const EIGHT_DAYS_IN_MILLISECONDS = 6.912e8;

	return createdTimestamp / 1000 < EIGHT_DAYS_IN_MILLISECONDS;
};
