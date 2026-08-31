import React, { useState } from 'react';
import { VideoData } from '../types';
import { ThumbnailCard } from './ThumbnailCard';
import { Copy, Check, ExternalLink, X, Info, Download, Film } from 'lucide-react';
import { downloadThumbnailImage } from '../utils/youtube';

interface ThumbnailResultsProps {
  data: VideoData;
  onClear: () => void;
}

export const ThumbnailResults: React.FC<ThumbnailResultsProps> = ({
  data,
  onClear,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [fallbackToast, setFallbackToast] = useState<string | null>(null);
  const [quickDownloading, setQuickDownloading] = useState(false);

  const handleCopyVideoId = async () => {
    try {
      await navigator.clipboard.writeText(data.videoId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownloadBest = async () => {
    setQuickDownloading(true);
    const bestThumb = data.thumbnails[0];
    const filename = `youtube_${data.videoId}_maxres_thumbnail.jpg`;

    await downloadThumbnailImage(bestThumb.url, filename, () => {
      setFallbackToast(
        'Due to browser cross-origin policy, the image opened in a new tab. Long-press or right-click the image and select "Save Image".'
      );
    });

    setQuickDownloading(false);
  };

  return (
    <section
      id="results-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col flex-1 min-h-0 animate-fadeIn"
    >
      {/* Toast Notification if fallback is triggered */}
      {fallbackToast && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start justify-between gap-2 shadow-xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-950">Notice for Image Download</p>
              <p className="text-amber-800 mt-0.5">{fallbackToast}</p>
            </div>
          </div>
          <button
            onClick={() => setFallbackToast(null)}
            className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <Film className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Results for Video ID:
          </span>
          <code className="text-xs sm:text-sm font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {data.videoId}
          </code>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
            Valid
          </span>

          <button
            id="copy-video-id-btn"
            type="button"
            onClick={handleCopyVideoId}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
            title="Copy Video ID"
          >
            {copiedId ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy ID</span>
              </>
            )}
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${data.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            <span>Watch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="download-best-quick-btn"
            type="button"
            onClick={handleDownloadBest}
            disabled={quickDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{quickDownloading ? 'Downloading...' : 'Quick Download (HD)'}</span>
          </button>

          <button
            id="clear-results-btn"
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Grid of Available Thumbnail Qualities in High Density */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {data.thumbnails.map((thumb) => (
          <ThumbnailCard
            key={thumb.key}
            thumbnail={thumb}
            videoId={data.videoId}
            onFallbackNotice={(msg) => setFallbackToast(msg)}
          />
        ))}
      </div>
    </section>
  );
};

