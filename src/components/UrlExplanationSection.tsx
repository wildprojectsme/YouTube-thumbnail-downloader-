import React from 'react';
import { Code2, Check } from 'lucide-react';

export const UrlExplanationSection: React.FC = () => {
  return (
    <section
      id="how-to-get-url-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex-shrink-0"
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>How YouTube Thumbnail URLs Work</span>
        </h3>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
          Google CDN
        </span>
      </div>

      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>
          YouTube generates multiple resolution assets for each video. Every video has a unique 11-character <strong>Video ID</strong> (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-[11px] font-bold">1b5o6nfXM8M</code>). Our tool parses your link and constructs direct links to Google&apos;s origin image CDN (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">img.youtube.com</code>).
        </p>

        {/* Code Breakdown Matrix */}
        <div className="bg-slate-950 rounded-lg p-3 text-slate-200 font-mono text-[11px] space-y-1.5 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-slate-800/80">
            <span className="text-slate-400 text-[10px]">Maximum (1080p/720p HD):</span>
            <span className="text-emerald-400 font-semibold break-all">
              https://img.youtube.com/vi/<span className="text-amber-300">VIDEO_ID</span>/maxresdefault.jpg
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-slate-800/80">
            <span className="text-slate-400 text-[10px]">Standard (640×480 px):</span>
            <span className="text-emerald-400 font-semibold break-all">
              https://img.youtube.com/vi/<span className="text-amber-300">VIDEO_ID</span>/sddefault.jpg
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-slate-800/80">
            <span className="text-slate-400 text-[10px]">High Quality (480×360 px):</span>
            <span className="text-emerald-400 font-semibold break-all">
              https://img.youtube.com/vi/<span className="text-amber-300">VIDEO_ID</span>/hqdefault.jpg
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 text-[10px]">Medium (320×180 px):</span>
            <span className="text-emerald-400 font-semibold break-all">
              https://img.youtube.com/vi/<span className="text-amber-300">VIDEO_ID</span>/mqdefault.jpg
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Original uncompressed resolution</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Direct CDN delivery with no re-encoding</span>
          </div>
        </div>
      </div>
    </section>
  );
};

