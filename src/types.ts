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
