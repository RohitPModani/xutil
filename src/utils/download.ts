/** Hands a file to the browser's download flow. Strings become a Blob of `mime`. */
export function downloadBlob(content: Blob | string, fileName: string, mime = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  // Give the click a tick to start before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Downloads something that is already a URL (a data: URL from a canvas, say). */
export function downloadUrl(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
