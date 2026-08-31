export type ThumbnailQualityKey = 'maxres' | 'hq' | 'sd' | 'mq' | 'default';

export interface ThumbnailItem {
  key: ThumbnailQualityKey;
  label: string;
  badge: string;
  expectedResolution: string;
  url: string;
  isAvailable?: boolean;
  actualWidth?: number;
  actualHeight?: number;
  isBest?: boolean;
}

export interface VideoData {
  videoId: string;
  originalInput: string;
  thumbnails: ThumbnailItem[];
  highestAvailableKey: ThumbnailQualityKey;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TranscriptSegment {
  time: string;
  seconds: number;
  text: string;
}

export interface VideoTranscriptData {
  videoId: string;
  title: string;
  source: 'youtube_captions' | 'ai_gemini';
  language?: string;
  segments: TranscriptSegment[];
  plainText: string;
  timestampedText: string;
  summary?: string;
}

