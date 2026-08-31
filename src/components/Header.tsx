import React from 'react';
import { Youtube } from 'lucide-react';

interface HeaderProps {
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLegal }) => {
  return (
    <header className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 shadow-md border-b border-slate-800">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
          <Youtube className="w-4.5 h-4.5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
            <span>YouTube Thumbnail Downloader</span>
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider hidden md:inline-block">
              HD & 4K
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Download high-quality thumbnails from any YouTube video instantly
          </p>
        </div>
      </div>

      {onOpenLegal && (
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms of Use
          </button>
        </div>
      )}
    </header>
  );
};

