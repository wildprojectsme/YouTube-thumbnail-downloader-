import React, { useState } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  initialTab?: 'privacy' | 'terms';
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  initialTab = 'privacy',
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      id="legal-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Terms of Use
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Privacy Policy</h3>
              <p>
                <strong>No Data Collection:</strong> YouTube Thumbnail Downloader is designed with user privacy in mind. We do not require any account creation, login, or registration.
              </p>
              <p>
                <strong>No URL Storage:</strong> We do not log, track, or save the YouTube video links or video IDs you submit. All URL extraction is performed locally in your web browser.
              </p>
              <p>
                <strong>Direct Delivery:</strong> All thumbnail images are fetched directly from Google / YouTube image servers (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">img.youtube.com</code>).
              </p>
              <p>
                <strong>Cookies:</strong> This utility does not set first-party tracking cookies or store personal identifier data in your browser.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Terms of Use</h3>
              <p>
                <strong>Fair Use & Purpose:</strong> This service is provided free of charge for informational, educational, and fair-use purposes such as presentation referencing, media review, graphic design inspiration, and offline personal archiving.
              </p>
              <p>
                <strong>Intellectual Property:</strong> All thumbnail images, video titles, and visual branding are the property of their respective creators and copyright holders. Please respect the copyright of video owners when using downloaded assets.
              </p>
              <p>
                <strong>Disclaimer:</strong> YouTube Thumbnail Downloader is an independent utility and is not affiliated with, endorsed by, or sponsored by YouTube, Google LLC, or Alphabet Inc.
              </p>
              <p>
                <strong>Service Availability:</strong> The tool is provided &quot;as-is&quot; without warranties of any kind. Thumbnail availability depends entirely on YouTube&apos;s public CDN servers.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

