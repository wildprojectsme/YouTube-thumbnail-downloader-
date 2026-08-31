import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/faqData';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'how-to-download': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      id="faq-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          Frequently Asked Questions
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
          {FAQ_ITEMS.length} FAQs
        </span>
      </div>

      <div className="space-y-1.5">
        {FAQ_ITEMS.map((item) => {
          const isOpen = !!openItems[item.id];
          return (
            <div
              key={item.id}
              id={`faq-${item.id}`}
              className="border border-slate-200 rounded-lg overflow-hidden transition-all bg-slate-50/50"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                className="w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 font-bold text-slate-800 text-xs hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 text-slate-600 text-[11px] sm:text-xs leading-relaxed border-t border-slate-200/60 bg-white">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

