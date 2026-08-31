import React from 'react';
import { Youtube, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-3.5 px-4 sm:px-6 text-xs flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
      <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
        <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-white">
          <Youtube className="w-3.5 h-3.5" />
        </div>
        <span>YouTube Thumbnail Downloader</span>
        <span className="text-slate-500 font-normal hidden sm:inline">• Free Web Tool</span>
      </div>

      <div className="flex items-center gap-4 text-slate-400 text-[11px]">
        <button
          onClick={() => onOpenLegal('privacy')}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <Shield className="w-3 h-3" />
          <span>Privacy Policy</span>
        </button>
        <span className="text-slate-700">•</span>
        <button
          onClick={() => onOpenLegal('terms')}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <FileText className="w-3 h-3" />
          <span>Terms of Use</span>
        </button>
      </div>

      <div className="text-[10px] text-slate-500 text-center sm:text-right">
        <span>© {new Date().getFullYear()} Not affiliated with YouTube / Google LLC.</span>
      </div>
    </footer>
  );
};

