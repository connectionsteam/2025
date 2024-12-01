import ms from 'ms';

export default {
	//#region Connections
	unknownConnection: 'We could not find a connection with this name.',
	userCantLike(rest: number) {
		return `You cannot like in this connection now, wait ${ms(rest, { long: true })}`;
	},
	//#endregion
};
