import { useState } from 'react';
import { Header } from './components/Header';
import { ThumbnailForm } from './components/ThumbnailForm';
import { ThumbnailResults } from './components/ThumbnailResults';
import { TranscriptSection } from './components/TranscriptSection';
import { AdPlaceholder } from './components/AdPlaceholder';
import { HowToSection } from './components/HowToSection';
import { UrlExplanationSection } from './components/UrlExplanationSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { VideoData } from './types';
import { generateVideoThumbnails } from './utils/youtube';

export default function App() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    tab: 'privacy' | 'terms';
  }>({
    isOpen: false,
    tab: 'privacy',
  });

  const handleExtract = (videoId: string, rawInput: string) => {
    const data = generateVideoThumbnails(videoId, rawInput);
    setVideoData(data);

    // Smooth scroll to results on mobile / smaller viewports
    setTimeout(() => {
      const el = document.getElementById('results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleClear = () => {
    setVideoData(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* High Density Dark Header */}
      <Header
        onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab })}
      />

      {/* Main High Density Responsive Grid */}
      <main className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 items-start">
          {/* Main Primary Column (Form, Results, Explanation) */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4 flex flex-col">
            {/* Input card */}
            <ThumbnailForm
              onExtract={handleExtract}
              onClear={handleClear}
              hasResults={!!videoData}
            />

            {/* Results section */}
            {videoData && (
              <>
                <ThumbnailResults data={videoData} onClear={handleClear} />
                <TranscriptSection videoId={videoData.videoId} />
              </>
            )}

            {/* In-feed Ad Banner */}
            <AdPlaceholder
              slotId="ad-slot-main-banner"
              size="banner"
            />

            {/* Technical URL explanation breakdown */}
            <UrlExplanationSection />
          </div>

          {/* High Density Sidebar Column (How-to, FAQs, Rectangle Ad) */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 flex flex-col">
            {/* Step-by-step instructions */}
            <HowToSection />

            {/* Interactive FAQs accordion */}
            <FaqSection />

            {/* Sidebar Rectangle Ad Placement */}
            <AdPlaceholder
              slotId="ad-slot-sidebar"
              size="rectangle"
            />
          </div>
        </div>
      </main>

      {/* Compact High Density Footer */}
      <Footer
        onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab })}
      />

      {/* Privacy Policy & Terms Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() =>
          setLegalModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}

