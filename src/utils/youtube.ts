import { ThumbnailItem, VideoData } from '../types';

/**
 * Extracts YouTube Video ID from any standard YouTube URL or raw ID.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - URLs with additional params (?si=..., &t=..., &feature=..., etc.)
 * - Raw 11-character video IDs
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-char video ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex pattern for extracting 11-char ID from all known YouTube formats
  const regexPatterns = [
    // Standard watch URL: youtube.com/watch?v=ID or m.youtube.com/watch?v=ID
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
    // Shortened URL: youtu.be/ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
    // Shorts URL: youtube.com/shorts/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
    // Embed URL: youtube.com/embed/ID or youtube-nocookie.com/embed/ID
    /(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
    // Live stream URL: youtube.com/live/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
    // Legacy /v/ URL: youtube.com/v/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:&|\?|#|$)/i,
  ];

  for (const pattern of regexPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // General URL parser fallback
  try {
    const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    const url = new URL(urlStr);
    
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      // 1. Check search param 'v'
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      // 2. Check path segments
      const segments = url.pathname.split('/').filter(Boolean);
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg === 'shorts' || seg === 'embed' || seg === 'live' || seg === 'v') {
          const next = segments[i + 1];
          if (next && /^[a-zA-Z0-9_-]{11}$/.test(next)) {
            return next;
          }
        }
      }
      // 3. youtu.be/<id>
      if (url.hostname.includes('youtu.be') && segments[0] && /^[a-zA-Z0-9_-]{11}$/.test(segments[0])) {
        return segments[0];
      }
    }
  } catch {
    // Ignore URL parse error and continue
  }

  return null;
}

/**
 * Builds the full thumbnail collection for a given YouTube video ID.
 */
export function generateVideoThumbnails(videoId: string, originalInput: string): VideoData {
  const thumbnails: ThumbnailItem[] = [
    {
      key: 'maxres',
      label: 'Maximum Resolution (1080p / 720p HD)',
      badge: 'Max Ultra HD',
      expectedResolution: '1280 × 720 px',
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isBest: true,
    },
    {
      key: 'sd',
      label: 'Standard Definition (SD)',
      badge: 'Standard 480p',
      expectedResolution: '640 × 480 px',
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    },
    {
      key: 'hq',
      label: 'High Quality (HQ)',
      badge: 'High Quality',
      expectedResolution: '480 × 360 px',
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    },
    {
      key: 'mq',
      label: 'Medium Quality (MQ)',
      badge: 'Medium Quality',
      expectedResolution: '320 × 180 px',
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    },
  ];

  return {
    videoId,
    originalInput,
    thumbnails,
    highestAvailableKey: 'maxres',
  };
}

/**
 * Downloads an image directly or triggers fallback
 */
export async function downloadThumbnailImage(
  url: string,
  filename: string,
  onFallback?: (reason: string) => void
): Promise<boolean> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return true;
  } catch (err) {
    // If CORS or network prevents direct blob download, fallback gracefully
    console.warn('Direct blob download failed, falling back:', err);
    
    // Attempt iframe / anchor with download
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (onFallback) {
        onFallback('opened_in_tab');
      }
      return false;
    } catch {
      window.open(url, '_blank');
      if (onFallback) {
        onFallback('opened_in_tab');
      }
      return false;
    }
  }
}
