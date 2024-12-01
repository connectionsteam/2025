export interface Guild {
	id: string;
	prefix?: string;
	mods: GuildMod[];
	cases?: GuildCase[];
	premium?: GuildPremium;
	metadata?: GuildMetadata;
	connections?: ConnectedConnection[];
}

export interface ConnectedConnection {
	name: string;
	webhook?: string;
	channelId: string;
	language?: string;
	lockedAt?: number;
	blockwords?: string[];
	logsChannelId?: string;
	flags: ConnectedConnectionFlags;
}

export enum ConnectedConnectionFlags {
	Frozen = 1 << 1,
	AllowFiles = 1 << 2,
	AllowInvites = 1 << 3,
	AllowLinks = 1 << 4,
	NoIndentification = 1 << 5,
	AllowOrigin = 1 << 6,
	AllowWebhooks = 1 << 7,
	AllowEmojis = 1 << 8,
	CompactModeEnabled = 1 << 9,
	ConfirmActions = 1 << 10,
	AutoTranslate = 1 << 11,
	Inactive = 1 << 12,
	AllowMentions = 1 << 13,
	AllowWallOfText = 1 << 14,
}

export interface GuildPremium {
	type: PremiumType;
	expiresAt: number;
}

export enum PremiumType {
	Normal = 1,
	Vip = 2,
}

export interface GuildMod {
	id: string;
	type: ModType;
}

export enum ModType {
	Owner = 1,
	TrustedAdmin = 2,
}

export interface GuildMetadata {
	invite?: string;
	maxChars?: number;
}

export type GuildCase = TimeoutCase | BanCase | GuildBanCase | NoteCase;

export enum CaseType {
	Timeout = 1,
	Ban = 2,
	GuildBan = 3,
	Note = 4,
}

export type GuildBanCase = BaseCaseWithProof<CaseType.GuildBan>;
export type NoteCase = BaseCase<CaseType.Note>;

export interface BaseCase<Type extends CaseType> {
	type: Type;
	id: string;
	modId: string;
	reason?: string;
	targetId: string;
	createdAt: number;
	connection: string;
}

interface BaseCaseWithProof<Type extends Exclude<CaseType, CaseType.Note>>
	extends BaseCase<Type> {
	proof?: string;
}

export interface TimeoutCase extends BaseCaseWithProof<CaseType.Timeout> {
	lifetime: number;
}

export type BanCase = BaseCaseWithProof<CaseType.Ban>;
