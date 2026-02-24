const REMOTE_IMAGE_RE = /^https?:\/\//i;

export function buildImageProxyUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

export function buildPlaceholderUrl(title: string): string {
  return `/api/placeholder?title=${encodeURIComponent(title)}`;
}

export function getDisplayImageUrl(
  imageUrl: string | undefined,
  title: string
): string {
  if (!imageUrl) {
    return buildPlaceholderUrl(title);
  }

  if (
    imageUrl.startsWith("/api/image") ||
    imageUrl.startsWith("/api/placeholder") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  if (REMOTE_IMAGE_RE.test(imageUrl)) {
    return buildImageProxyUrl(imageUrl);
  }

  return buildPlaceholderUrl(title);
}

