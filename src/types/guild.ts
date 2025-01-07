export interface Guild {
	id: string;
	prefix?: string;
	mods: GuildMod[];
	cases?: GuildCase[];
	premium?: GuildPremium;
	metadata?: GuildMetadata;
	connections?: ConnectedConnection[];
	threads?: { id: string; parent: string }[];
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
	/**
	 * @deprecated "Frozen" flag is deprecated
	 */
	Frozen = 1 << 1,
	AllowFiles = 1 << 2, // Ok
	AllowInvites = 1 << 3, // Ok
	AllowLinks = 1 << 4, // Ok
	NoIndentification = 1 << 5,
	AllowOrigin = 1 << 6, // Ok
	AllowWebhooks = 1 << 7,
	AllowEmojis = 1 << 8, // Ok
	CompactMode = 1 << 9,
	ConfirmActions = 1 << 10,
	AutoTranslate = 1 << 11,
	Inactive = 1 << 12,
	AllowMentions = 1 << 13, // Ok
	AllowWallOfText = 1 << 14, // Ok
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
	/**
	 * @deprecated Notes are useless
	 */
	Note = 4,
}

export type GuildBanCase = BaseCaseWithProof<CaseType.GuildBan>;
/**
 * @deprecated
 */
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
