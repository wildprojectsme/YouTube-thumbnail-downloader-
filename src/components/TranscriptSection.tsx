import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  RefreshCw,
  Clock,
  BookOpen,
  List,
  AlertCircle,
  FileCode,
  Languages,
} from 'lucide-react';
import { VideoTranscriptData } from '../types';

interface TranscriptSectionProps {
  videoId: string;
}

type ViewMode = 'timestamps' | 'clean' | 'summary';

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({ videoId }) => {
  const [transcript, setTranscript] = useState<VideoTranscriptData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'clean' | 'timestamps' | 'summary' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('clean');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [customSummary, setCustomSummary] = useState<string | null>(null);

  // Fetch or generate transcript when videoId changes
  const fetchTranscript = async (forceAi = false) => {
    setLoading(true);
    setError(null);
    setCustomSummary(null);

    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, forceAi }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch video transcript.');
      }

      setTranscript(data);
    } catch (err: unknown) {
      console.error('Fetch transcript error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve transcript.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchTranscript(false);
    }
  }, [videoId]);

  // Copy handler with temporary feedback
  const handleCopy = async (type: 'clean' | 'timestamps' | 'summary') => {
    if (!transcript) return;

    let textToCopy = '';
    if (type === 'clean') {
      textToCopy = transcript.plainText;
    } else if (type === 'timestamps') {
      textToCopy = transcript.timestampedText;
    } else if (type === 'summary') {
      textToCopy = customSummary || transcript.summary || transcript.plainText;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback copy using textarea
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Download transcript as .txt file
  const handleDownloadTxt = (withTimestamps: boolean) => {
    if (!transcript) return;
    const content = withTimestamps ? transcript.timestampedText : transcript.plainText;
    const filename = `${transcript.videoId}_transcript_${withTimestamps ? 'timestamps' : 'plain'}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Download transcript as .srt format
  const handleDownloadSrt = () => {
    if (!transcript || !transcript.segments.length) return;
    let srtContent = '';
    transcript.segments.forEach((seg, idx) => {
      const nextSeg = transcript.segments[idx + 1];
      const startSec = seg.seconds;
      const endSec = nextSeg ? nextSeg.seconds : startSec + 4;

      const formatSrtTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
      };

      srtContent += `${idx + 1}\n`;
      srtContent += `${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n`;
      srtContent += `${seg.text}\n\n`;
    });

    const filename = `${transcript.videoId}_subtitles.srt`;
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Generate deeper AI summary
  const handleGenerateSummary = async () => {
    if (!transcript) return;
    setSummarizing(true);
    try {
      const res = await fetch('/api/summarize-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcript.plainText,
          videoTitle: transcript.title,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setCustomSummary(data.summary);
        setViewMode('summary');
      }
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setSummarizing(false);
    }
  };

  // Filtered segments based on search
  const filteredSegments = useMemo(() => {
    if (!transcript) return [];
    if (!searchQuery.trim()) return transcript.segments;
    const q = searchQuery.toLowerCase();
    return transcript.segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [transcript, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transcript || !transcript.plainText) return null;
    const words = transcript.plainText.trim().split(/\s+/).filter(Boolean).length;
    const chars = transcript.plainText.length;
    const readingTimeMin = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTimeMin };
  }, [transcript]);

  return (
    <div
      id="video-transcript-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-shrink-0"
    >
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Video Transcription & Script
              </h2>
              {transcript && (
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {transcript.source === 'youtube_captions' ? 'YouTube Captions' : 'AI Generated'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Extract, search, format, and copy full video transcriptions with one click
            </p>
          </div>
        </div>

        {/* Global Copy & Refresh Actions */}
        {transcript && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="copy-clean-transcript-btn"
              onClick={() => handleCopy('clean')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                copiedType === 'clean'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-98'
              }`}
              title="Copy clean continuous transcript text"
            >
              {copiedType === 'clean' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Transcript</span>
                </>
              )}
            </button>

            <button
              onClick={() => fetchTranscript(true)}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Re-generate with AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 sm:p-4 space-y-3.5">
        {/* Loading State */}
        {loading && (
          <div className="py-10 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-medium">
              Extracting spoken transcription & parsing subtitles...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Transcript Notice</span>
            </div>
            <p className="text-amber-700 leading-relaxed">{error}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => fetchTranscript(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate with Gemini AI</span>
              </button>
              <button
                onClick={() => fetchTranscript(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Captions</span>
              </button>
            </div>
          </div>
        )}

        {/* Loaded Transcript View */}
        {!loading && transcript && (
          <>
            {/* Toolbar: View Tabs, Search, Downloads */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
              {/* Tab switchers */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('clean')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'clean'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Clean Script</span>
                </button>
                <button
                  onClick={() => setViewMode('timestamps')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'timestamps'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Timestamps</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('summary');
                    if (!transcript.summary && !customSummary) {
                      handleGenerateSummary();
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'summary'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Summary</span>
                </button>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Copy Timestamps */}
                <button
                  onClick={() => handleCopy('timestamps')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
                  title="Copy transcript with [MM:SS] timestamps"
                >
                  {copiedType === 'timestamps' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy w/ Timestamps</span>
                    </>
                  )}
                </button>

                {/* Download Text */}
                <button
                  onClick={() => handleDownloadTxt(viewMode === 'timestamps')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
                  title="Download as .txt"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .TXT</span>
                </button>

                {/* Download SRT */}
                <button
                  onClick={handleDownloadSrt}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
                  title="Download SubRip subtitle format (.srt)"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .SRT</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {stats && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>
                    <strong>{stats.words.toLocaleString()}</strong> words
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{stats.chars.toLocaleString()}</strong> characters
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    ~{stats.readingTimeMin} min read
                  </span>
                </div>
                {transcript.language && (
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Languages className="w-3 h-3 text-blue-600" />
                    <span>{transcript.language}</span>
                  </div>
                )}
              </div>
            )}

            {/* Search within transcript */}
            {viewMode !== 'summary' && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search spoken words in this video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            )}

            {/* Content View 1: Clean Script */}
            {viewMode === 'clean' && (
              <div className="relative bg-slate-50/60 rounded-lg border border-slate-200/80 p-3 sm:p-4 max-h-[380px] overflow-y-auto">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-blue-100 font-normal">
                  {transcript.plainText}
                </p>
              </div>
            )}

            {/* Content View 2: Timestamps */}
            {viewMode === 'timestamps' && (
              <div className="bg-slate-50/60 rounded-lg border border-slate-200/80 p-2 sm:p-3 max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {filteredSegments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No matching dialogue found for &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-2 flex items-start gap-2.5 hover:bg-blue-50/50 rounded transition-colors text-xs"
                    >
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 border border-blue-100">
                        {seg.time}
                      </span>
                      <p className="text-slate-700 leading-normal flex-1">{seg.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Content View 3: AI Summary */}
            {viewMode === 'summary' && (
              <div className="bg-slate-50/60 rounded-lg border border-slate-200/80 p-4 max-h-[380px] overflow-y-auto space-y-3">
                {summarizing ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="text-xs text-slate-500 font-medium">
                      Gemini is reading the transcript & synthesizing key takeaways...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>AI Executive Summary & Chapters</span>
                      </h4>
                      <button
                        onClick={() => handleCopy('summary')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {copiedType === 'summary' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied Summary!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Summary</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {customSummary || transcript.summary || (
                        <div className="py-4 text-center space-y-2">
                          <p className="text-xs text-slate-500">
                            Generate a structured AI breakdown with chapters and key takeaways.
                          </p>
                          <button
                            onClick={handleGenerateSummary}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate AI Summary</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
