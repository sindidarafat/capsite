const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
};

export const mimeFor = (ext: string) => TYPES[ext.toLowerCase()] ?? "application/octet-stream";

export const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
export const VIDEO_EXT = [".mp4", ".m4v", ".webm", ".mov"];
export const UPLOAD_EXT = [...IMAGE_EXT, ...VIDEO_EXT, ".mp3", ".wav", ".pdf"];

export const isVideo = (src: string) => VIDEO_EXT.some((e) => src.toLowerCase().split("?")[0].endsWith(e));
