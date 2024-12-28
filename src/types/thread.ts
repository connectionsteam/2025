export interface Thread {
	id: string;
	creatorId: string;
	children: string[];
	createdTimestamp: number;
}
