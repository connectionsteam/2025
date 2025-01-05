export interface Connection {
	name: string;
	icon?: string;
	teamId?: string;
	invite?: string;
	pausedAt?: number;
	creatorId: string;
	createdAt: number;
	description?: string;
	type?: ConnectionType;
	promotingSince?: number;
	likes?: ConnectionLike[];
	metadata?: ConnectionMetadata;
}

export interface ConnectionMetadata {
	rules?: string;
	minMembers?: number;
	maxConnections?: number;
}

export interface ConnectionLike {
	user: string;
	count: number;
	lastLikeAt: number;
}

export enum ConnectionType {
	NSFW = 1,
}
