import React, { useState } from 'react';
import { Clipboard, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { extractYouTubeVideoId } from '../utils/youtube';

interface ThumbnailFormProps {
  onExtract: (videoId: string, rawInput: string) => void;
  onClear: () => void;
  hasResults: boolean;
}

export const ThumbnailForm: React.FC<ThumbnailFormProps> = ({
  onExtract,
  onClear,
  hasResults,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a valid YouTube video URL.');
      return;
    }

    const videoId = extractYouTubeVideoId(trimmed);
    if (!videoId) {
      setError('Please enter a valid YouTube video URL.');
      return;
    }

    // Call extraction handler with extracted ID and original URL
    onExtract(videoId, trimmed);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text);
          setError(null);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 1500);

          // If pasted text is a valid YouTube URL, extract immediately
          const extracted = extractYouTubeVideoId(text.trim());
          if (extracted) {
            onExtract(extracted, text.trim());
          }
        }
      } else {
        setError('Please manually paste the URL into the input field.');
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      setError('Could not access clipboard. Please paste manually into the input box.');
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setError(null);
    onClear();
  };

  const loadSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    setError(null);
    const id = extractYouTubeVideoId(sampleUrl);
    if (id) {
      onExtract(id, sampleUrl);
    }
  };

  return (
    <section
      id="thumbnail-form-card"
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex-shrink-0"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          Paste YouTube Video URL
        </h2>
        {hasResults && (
          <button
            id="clear-top-btn"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="relative flex-1">
            <input
              id="youtube-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste YouTube URL here... (e.g. https://www.youtube.com/watch?v=1b5o6nfXM8M)"
              className="w-full pl-3.5 pr-20 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-slate-900 bg-white placeholder:text-slate-400"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {urlInput && (
                <button
                  id="clear-input-inline-btn"
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    setError(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="paste-clipboard-btn"
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3 h-3 text-slate-500" />
                <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="get-thumbnail-btn"
              type="submit"
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Get Thumbnail</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hasResults && (
              <button
                id="clear-btn-main"
                type="button"
                onClick={handleClear}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            id="form-error-alert"
            className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Quick sample chips for instant testing */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="font-semibold text-slate-600 flex items-center gap-1 text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-500" /> Samples:
        </span>
        <button
          type="button"
          onClick={() => loadSample('https://youtu.be/1b5o6nfXM8M')}
          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px] cursor-pointer"
        >
          youtu.be/1b5o6nfXM8M
        </button>
        <button
          type="button"
          onClick={() => loadSample('https://www.youtube.com/shorts/1b5o6nfXM8M')}
          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px] cursor-pointer"
        >
          shorts/1b5o6nfXM8M
        </button>
        <button
          type="button"
          onClick={() => loadSample('https://www.youtube.com/watch?v=1b5o6nfXM8M&t=30s')}
          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px] cursor-pointer"
        >
          watch?v=...&t=30s
        </button>
      </div>
    </section>
  );
};

