import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface DemoNoticeProps {
  variant?: 'banner' | 'card' | 'inline';
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({ variant = 'banner' }) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300/80">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Demonstration concept data. Rates and inventory are illustrative.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-stone-900 border-b border-stone-800 text-stone-300 text-[11px] sm:text-xs py-2 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left min-w-0">
        <div className="flex items-start sm:items-center gap-2 justify-center min-w-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-snug break-words">
            <strong>Unofficial Concept Demo</strong> — A proposed website experience created for demonstration purposes. Not the official website of The Destination Resort.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-stone-400 text-[10px] sm:text-[11px] mt-1 sm:mt-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>Demo Environment · Tezpur, Assam</span>
        </div>
      </div>
    </div>
  );
};
