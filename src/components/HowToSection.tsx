import React from 'react';
import { Copy, ArrowRight, Download, CheckCircle2 } from 'lucide-react';

export const HowToSection: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Copy Video URL',
      description: 'Copy the standard YouTube video, Shorts, or embed link from your browser or the YouTube App.',
      icon: Copy,
    },
    {
      step: '2',
      title: 'Paste into Tool',
      description: 'Paste into the search field above and click "Get Thumbnail" to automatically extract the video ID.',
      icon: ArrowRight,
    },
    {
      step: '3',
      title: 'Download or Copy',
      description: 'Select your preferred resolution (HD 1080p, SD, or HQ) and click "Download" or "Copy Link".',
      icon: Download,
    },
  ];

  return (
    <div
      id="how-to-download-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          How to Download
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
          3 Steps
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <Icon className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-semibold">No signup required</span>
        </div>
        <span className="text-slate-400 text-[10px]">100% Free & Direct</span>
      </div>
    </div>
  );
};

