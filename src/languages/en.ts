import { lang } from 'bing-translate-api';
import ms from 'ms';
import { ActionRow, type Button, type StringSelectMenu } from 'seyfert';
import { ButtonStyle, ComponentType } from 'seyfert/lib/types';

export default {
	//#region Connections
	unknownConnection: 'We could not find a connection with this name.',
	userCantLike(rest: number) {
		return `You cannot like in this connection now, wait ${ms(rest, { long: true })}.`;
	},
	connectionReachedGuildsLimit(
		name: string,
		isOwner: boolean,
		ownerId: string,
	) {
		return isOwner
			? {
					content: `Connection **${name}** reached the limit of guilds to join.\n-# Increase the limit (promoting)[https://connections.squareweb.app/promote] the connection.`,
					components: [
						new ActionRow<Button>({
							components: [
								{
									type: ComponentType.Button,
									style: ButtonStyle.Link,
									label: 'Go to Promotion',
									url: 'https://connections.squareweb.app/promote',
								},
							],
						}),
					],
				}
			: {
					content: `Connection **${name}** reached the limit of guilds to join.\n-# <@${ownerId}> can increase the limit.`,
					components: [
						new ActionRow<Button>({
							components: [
								{
									type: ComponentType.Button,
									style: ButtonStyle.Link,
									label: 'Ask to the Creator',
									url: `https://discord.com/users/${ownerId}`,
								},
							],
						}),
					],
				};
	},
	acceptConnectionRules(rules: string) {
		return {
			content: `Rules:\n\n${rules}`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Success,
							label: 'Accept',
							custom_id: 'accept',
						},
						{
							type: ComponentType.Button,
							style: ButtonStyle.Danger,
							label: 'Reject',
							custom_id: 'reject',
						},
					],
				}),
			],
		};
	},
	rulesRejected:
		'You have rejected the rules proposed by the connection. The connection was not connected.',
	invalidConnectionName: 'This name for a connection is not valid.',
	connectionWithSameNameExists:
		'A connection with the same name already exists.',
	connectionCreated(name: string) {
		return {
			content: `Your connection **${name}** has been created. Make it shine using the buttons bellow!`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							label: 'Make it Shine',
							style: ButtonStyle.Link,
							type: ComponentType.Button,
							emoji: {
								name: '✨',
							},
							url: 'https://connections.squareweb.app/promote',
						},
						{
							style: ButtonStyle.Link,
							label: "Let's Customize!",
							type: ComponentType.Button,
							url: 'https://connections.squareweb.app/dashboard',
						},
					],
				}),
			],
		};
	},
	//#endregion

	//#region Messages
	unknownMessage: 'We could not find this message...',
	cannotRepostOwnMessage: 'You can not repost you own message.',
	messageReposted(url: string) {
		return `<:repost:1312857720168382567> You just reposted ${url}.`;
	},
	messageBoosted(crrBoosts: number, url: string) {
		return `✨ You just boosted ${url}! Now this message has **${crrBoosts}** boosts!`;
	},
	userUnlikedMessage(message: string) {
		return `You unliked the message ${message}.`;
	},
	userLikedMessage(message: string, likeCount: number) {
		return `You just liked the message ${message}! Now it has **${likeCount}** likes!`;
	},
	unknownContent: 'Connections coult not find any content in this message.',
	couldNotTranslateMessage:
		'We could not translate the content of this message.',
	translateComponents: [
		new ActionRow<StringSelectMenu>({
			components: [
				{
					type: ComponentType.StringSelect,
					custom_id: 'language',
					placeholder: 'Choose a custom language to translate',
					options: [
						{
							value: lang.LANGS.pt,
							label: 'Portuguese (Brazil)',
							emoji: { name: '🇧🇷' },
						},
						{
							value: lang.LANGS['pt-PT'],
							label: 'Portuguese (Portugal)',
							emoji: { name: '🇵🇹' },
						},
						{
							value: lang.LANGS.es,
							label: 'Spanish',
							emoji: { name: '🇪🇸' },
						},
						{
							value: lang.LANGS.fr,
							label: 'French',
							emoji: { name: '🇫🇷' },
						},
						{
							value: lang.LANGS.lzh,
							label: 'Chinese (Literary)',
							emoji: { name: '🇨🇳' },
						},
						{
							value: lang.LANGS.ja,
							label: 'Japanese',
							emoji: { name: '🇯🇵' },
						},
						{
							value: lang.LANGS.en,
							label: 'English',
							emoji: { name: '🇺🇸' },
						},
						{
							value: lang.LANGS.tr,
							label: 'Turkish',
							emoji: { name: '🇹🇷' },
						},
						{
							value: lang.LANGS.uk,
							label: 'Ukrainian',
							emoji: { name: '🇺🇦' },
						},
						{
							value: lang.LANGS.tk,
							label: 'Turkmen',
							emoji: { name: '🇹🇲' },
						},
						{
							value: lang.LANGS.hr,
							label: 'Croatian',
							emoji: { name: '🇭🇷' },
						},
						{
							value: lang.LANGS.hi,
							label: 'Hindi',
							emoji: { name: '🇮🇳' },
						},
						{
							value: lang.LANGS.de,
							label: 'German',
							emoji: { name: '🇩🇪' },
						},
						{
							value: lang.LANGS.ar,
							label: 'Arabic',
							emoji: { name: '🇸🇦' },
						},
					],
				},
			],
		}),
	],
	translation(code: string, translation: string) {
		const languages = {
			[lang.LANGS.ar]: '🇸🇦',
			[lang.LANGS.de]: '🇩🇪',
			[lang.LANGS.hi]: '🇮🇳',
			[lang.LANGS.hr]: '🇭🇷',
			[lang.LANGS.tk]: '🇹🇲',
			[lang.LANGS.uk]: '🇺🇦',
			[lang.LANGS.tr]: '🇹🇷',
			[lang.LANGS.pt]: '🇧🇷',
			[lang.LANGS['pt-PT']]: '🇵🇹',
			[lang.LANGS.es]: '🇪🇸',
			[lang.LANGS.fr]: '🇫🇷',
			[lang.LANGS.lzh]: '🇨🇳',
			[lang.LANGS.ja]: '🇯🇵',
			[lang.LANGS.en]: '🇺🇸',
		};

		// @ts-expect-error
		return `${languages[code]} **${code}**: ${translation}`;
	},
	//#endregion

	//#region Guilds
	guildReachedConnectionsLimit: {
		content:
			'Unfortunatelly this server has reached the limit of connections. Buy [Connections For Guilds](https://connections.squareweb.app/premum)!',
		components: [
			new ActionRow<Button>({
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						label: 'Go to Premium',
						url: 'https://connections.squareweb.app/premium',
					},
				],
			}),
		],
	},
	connectionIsAlreadyConnected(name: string) {
		return {
			// TODO: Add Premium Button
			content: `Connection **${name}** is already connected in this guild.`,
		};
	},
	insufficientNumberOfMembers(minMembers: number) {
		return `This server must have at least *${minMembers}* to join in the connection.`;
	},
	someConnectionIsUsingTheChannel(channelId: string) {
		return `Some connection is already using the channel <#${channelId}>.`;
	},
	channelMustBeNSFW(channelId: string) {
		return {
			content: `The channel <#${channelId}> must be [NSFW](https://support.discord.com/hc/en-us/articles/115000084051-Age-Restricted-Channels-and-Content).`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: 'See Why',
							url: 'https://link-to-the-docs.com',
						},
					],
				}),
			],
		};
	},
	connectionConnected(name: string, channel: string) {
		return {
			content: `Connection **${name}** has been connected in the channel <#${channel}>`,
			components: [
				new ActionRow<Button>({
					components: [
						{
							style: ButtonStyle.Link,
							label: 'Go to Dashboard',
							type: ComponentType.Button,
							url: 'https://connections.squareweb.app/dashboard',
						},
					],
				}),
			],
		};
	},
	connectionConnectedFollowUp: {
		content: 'See about base any connection rules.',
		components: [
			new ActionRow<Button>({
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						label: 'See Rules',
						url: 'https://link-to-docs.com/rules',
					},
				],
			}),
		],
	},
	// #endregion
	//#region Users
	userDoesntHaveBoosts: {
		content: 'You do not have any boost yet. You can buy them in the website!',
		components: [
			new ActionRow<Button>({
				components: [
					{
						emoji: {
							name: '✨',
						},
						label: 'Go to Website',
						style: ButtonStyle.Link,
						type: ComponentType.Button,
						url: 'https://connections.squareweb.app/boosts',
					},
				],
			}),
		],
	},
	userReachedConnectionsLimit: 'You have reached your connections limit.',
	//#endregion
};
