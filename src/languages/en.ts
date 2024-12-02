import ms from 'ms';

export default {
	//#region Connections
	unknownConnection: 'We could not find a connection with this name.',
	userCantLike(rest: number) {
		return `You cannot like in this connection now, wait ${ms(rest, { long: true })}`;
	},
	//#endregion
	//#region Messages
	unknownMessage: 'We could not find this message...',
	cannotRepostOwnMessage: 'You can not repost you own message.',
	messageReposted(url: string) {
		return `<:repost:1312857720168382567> You just reposted ${url}.`;
	},
	//#endregion
};
