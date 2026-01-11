export function buildContentDisposition(
  disposition: 'inline' | 'attachment',
  fileName: string,
): string {
  const encoded = encodeURIComponent(fileName);
  return `${disposition}; filename="${encoded}"; filename*=UTF-8''${encoded}`;
}

