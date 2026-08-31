import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { ThumbnailItem } from '../types';
import { downloadThumbnailImage } from '../utils/youtube';

interface ThumbnailCardProps {
  thumbnail: ThumbnailItem;
  videoId: string;
  onFallbackNotice: (msg: string) => void;
}

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  thumbnail,
  videoId,
  onFallbackNotice,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [detectedDimensions, setDetectedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(thumbnail.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = thumbnail.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    const filename = `youtube_${videoId}_${thumbnail.key}_thumbnail.jpg`;
    
    await downloadThumbnailImage(thumbnail.url, filename, () => {
      onFallbackNotice(
        'Due to browser cross-origin policy, the image opened in a new tab. Long-press or right-click the image and select "Save Image".'
      );
    });

    setDownloading(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const w = target.naturalWidth;
    const h = target.naturalHeight;
    setDetectedDimensions({ width: w, height: h });
    setImgLoaded(true);

    if (thumbnail.key === 'maxres' && w <= 120 && h <= 90) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  };

  const isInvalidPlaceholder =
    hasError ||
    (thumbnail.key === 'maxres' &&
      detectedDimensions &&
      detectedDimensions.width <= 120);

  return (
    <div
      id={`thumbnail-card-${thumbnail.key}`}
      className={`border rounded-xl p-3 sm:p-3.5 flex flex-col bg-slate-50/60 hover:bg-white transition-all shadow-xs ${
        thumbnail.isBest && !isInvalidPlaceholder
          ? 'border-blue-300 ring-1 ring-blue-500/30'
          : 'border-slate-200'
      }`}
    >
      {/* Header Info */}
      <div className="flex justify-between items-start mb-2 gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
            {thumbnail.label}
          </span>
          {thumbnail.isBest && !isInvalidPlaceholder && (
            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded uppercase">
              Best
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono font-semibold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 shrink-0">
          {detectedDimensions
            ? isInvalidPlaceholder
              ? 'Unavailable'
              : `${detectedDimensions.width}×${detectedDimensions.height}`
            : thumbnail.expectedResolution.replace(' px', '')}
        </span>
      </div>

      {/* Image Preview Box */}
      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden mb-2.5 border border-slate-200 relative group flex items-center justify-center">
        {!isInvalidPlaceholder ? (
          <>
            <img
              src={thumbnail.url}
              alt={`${thumbnail.label} YouTube Thumbnail for video ${videoId}`}
              onLoad={handleImageLoad}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
            {!imgLoaded && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-900">
                <ImageIcon className="w-6 h-6 animate-pulse text-slate-500" />
                <span className="text-[10px]">Loading preview...</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-slate-300 gap-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <p className="text-xs font-semibold text-white">
              Max Resolution not uploaded
            </p>
            <p className="text-[10px] text-slate-400">
              Please use the Standard or HQ version below.
            </p>
          </div>
        )}
      </div>

      {/* URL & Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="bg-white border border-slate-200 rounded p-1.5 flex justify-between items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 truncate flex-1 select-all">
            {thumbnail.url}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={thumbnail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              title="Open direct image link in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              id={`copy-btn-${thumbnail.key}`}
              type="button"
              onClick={handleCopy}
              disabled={isInvalidPlaceholder}
              className={`text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                copied ? 'text-emerald-600 font-extrabold' : 'text-blue-600 hover:underline'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id={`copy-link-btn-${thumbnail.key}`}
            type="button"
            onClick={handleCopy}
            disabled={isInvalidPlaceholder}
            className={`w-full py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            id={`download-btn-${thumbnail.key}`}
            type="button"
            onClick={handleDownload}
            disabled={isInvalidPlaceholder || downloading}
            className={`w-full py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              thumbnail.isBest && !isInvalidPlaceholder
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {downloading
                ? 'Saving...'
                : thumbnail.isBest && !isInvalidPlaceholder
                ? 'Download HD'
                : 'Download'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

