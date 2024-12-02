export const executeWithBatches = async <Item>(
	fn: (item: Item) => unknown,
	items: Item[],
) => {
	const batchSize = 5;

	for (let i = 0; i < items.length; i += batchSize) {
		await Promise.all(items.slice(i, i + batchSize).map(fn));

		if (i + batchSize < items.length)
			await new Promise((r) => setTimeout(r, 2000));
	}
};
