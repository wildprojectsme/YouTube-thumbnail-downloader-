import React from 'react';

interface AdPlaceholderProps {
  slotId?: string;
  className?: string;
  size?: 'banner' | 'rectangle';
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  slotId = 'ad-slot-default',
  className = '',
  size = 'banner',
}) => {
  return (
    <div
      id={slotId}
      className={`w-full flex-shrink-0 ${className}`}
      aria-label="Advertisement Container"
    >
      <div
        className={`w-full rounded-lg border border-blue-100/90 bg-blue-50/60 p-2.5 text-center flex flex-col items-center justify-center transition-colors ${
          size === 'rectangle' ? 'min-h-[120px]' : 'min-h-[56px]'
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700/80">
          Advertisement Space
        </span>
        <p className="text-[10px] text-blue-900/50">
          Reserved for Google AdSense / Sponsor
        </p>
      </div>
    </div>
  );
};

