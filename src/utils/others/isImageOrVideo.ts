export const isImageOrVideo = ({ contentType }: { contentType?: string }) =>
	contentType?.startsWith('image/') || contentType?.startsWith('video/');
