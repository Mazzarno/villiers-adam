export function openSecurePreview(options: {
  webUrl: string;
  previewUrlPath: string;
}) {
  const previewBase = options.webUrl.replace(/\/+$/, '');
  const previewPath = options.previewUrlPath.startsWith('/')
    ? options.previewUrlPath
    : `/${options.previewUrlPath}`;
  const previewUrl = `${previewBase}${previewPath}`;
  const previewWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
  return Boolean(previewWindow);
}
