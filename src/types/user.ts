import type { MessageChild } from './messages';

export interface UserBookmark {
	shared?: true;
	members?: string[];
	msgs: MessageChild[];
}

export interface User {
	id: string;
	allowMentions?: boolean;
	blacklist?: UserBlacklist;
	achievements?: Achievement[];
	notifications?: Notification[];
	bookmarks: Record<string, UserBookmark>;
	follows: string[];
	/**
	 * Trending Top Messages counter
	 */
	ttmCount?: number;
	premium?: UserPremium;
}

export enum UserPremiumType {
	Plus = 1,
	Gang = 2,
}

type UserPremium =
	| {
			type: UserPremiumType.Plus;
			expiresAt: number;
	  }
	| { type: UserPremiumType.Gang; expiresAt: number; members: string[] };

export interface Achievement {
	unlockedAt: number;
	messageURL?: string;
	type: AchievementType;
	name: AchievementName;
}

export enum AchievementName {
	RealFriends = 'Real Friends',
	MakeSomeReplies = 'Reply? What is it?',
	TheCheese = 'Che ese',
	SendAMessageThatExceedsTheMaximumLength = 'Send a LOOOONG Message',
	ConnectionsFan = 'Votes Are Good',
	YouAreTheLimit = 'Break the Limits',
	// eslint-disable-next-line quotes
	KeepGoing = "I'm active",
	HowFarHaveWeReached = 'How Far Have We Reached?',
	NightTalker = 'Be Obscure',
	PressFForGlobal = 'Say "F Global"',
	BeWild = 'Use Lithuanian?',
	FullOfFlags = 'Flags are Flags',
}

export enum AchievementType {
	WithFriends = 1,
	Connections = 2,
	Website = 3,
}

export enum NotificationType {
	Reply = 1,
	Backup = 2,
	Internal = 3,
	TeamInvite = 4,
	Gift = 5,
}

interface BaseNotificationPayload<Type extends NotificationType> {
	id: string;
	type: Type;
	content: string;
	sentTimestamp: number;
}

interface MessageReplyNotification
	extends BaseNotificationPayload<NotificationType.Reply> {
	msgURL: string;
}

interface TeamInviteNotification
	extends BaseNotificationPayload<NotificationType.TeamInvite> {
	teamId: string;
}

interface BackupNotification
	extends BaseNotificationPayload<NotificationType.Backup> {
	backupId: string;
}

interface GiftNotification
	extends BaseNotificationPayload<NotificationType.Gift> {
	codeId: string;
}

export type Notification =
	| MessageReplyNotification
	| TeamInviteNotification
	| BackupNotification
	| GiftNotification
	| BaseNotificationPayload<NotificationType.Internal>;

interface UserBlacklist {
	devId: string;
	reason?: string;
	blacklistedAt: number;
}
