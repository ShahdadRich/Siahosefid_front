import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ProjectWork, WorkCategory } from '../data/studioData';
import { filterWorksByCategory, getCategoryCounts } from '../utils/studioLogic';

interface SelectedWorksSectionProps {
  works: ProjectWork[];
  onSelectWork: (work: ProjectWork) => void;
}

const CATEGORIES: { key: WorkCategory; label: string }[] = [
  { key: 'ALL', label: 'All Works' },
  { key: 'BRAND', label: 'Brand' },
  { key: 'DIGITAL', label: 'Digital' },
  { key: 'CONTENT', label: 'Content' },
  { key: 'MOTION', label: 'Motion' },
];

export const SelectedWorksSection: React.FC<SelectedWorksSectionProps> = ({
  works,
  onSelectWork,
}) => {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('ALL');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredWorks = filterWorksByCategory(works, activeCategory);
  const counts = getCategoryCounts(works);

  return (
    <section
      id="works"
      className="py-24 md:py-36 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-black/10"
    >
      {/* Section Header & Interactive Category Filter */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 mb-16 border-b border-black/10">
        <div>
          <p className="font-mono-label text-[#666666] mb-4">01 — SELECTED WORKS</p>
          <h2 className="headline-giant font-medium text-[#111111]">
            <span className="lowercase text-[#666666] font-normal">curated </span>
            <span>Monographs.</span>
          </h2>
        </div>

        {/* Interactive Filter Controls (Functional Buttons) */}
        <div
          role="group"
          aria-label="Filter projects by discipline"
          className="flex flex-wrap items-center gap-2"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 font-mono-label transition-colors duration-200 ease-editorial whitespace-nowrap shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#0A0A0A] text-[#F7F7F5] border-[#0A0A0A]'
                    : 'bg-transparent text-[#111111] border-black/15 hover:border-[#111111]'
                }`}
              >
                {cat.label} ({String(counts[cat.key]).padStart(2, '0')})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Asymmetric Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-x-12 items-start">
        {filteredWorks.map((work, idx) => {
          // Asymmetric 12-column distribution (7 cols vs 5 cols with vertical offset on odd items)
          const isEvenRow = Math.floor(idx / 2) % 2 === 0;
          const isLeftColumn = idx % 2 === 0;

          let colSpanClass = 'md:col-span-6';
          if (filteredWorks.length > 1) {
            if (isEvenRow) {
              colSpanClass = isLeftColumn
                ? 'md:col-span-7'
                : 'md:col-span-5 md:mt-24';
            } else {
              colSpanClass = isLeftColumn
                ? 'md:col-span-5'
                : 'md:col-span-7 md:mt-20';
            }
          } else {
            colSpanClass = 'md:col-span-8';
          }

          const aspectClass =
            work.aspectRatio === '3/4'
              ? 'aspect-[3/4]'
              : work.aspectRatio === '16/9'
              ? 'aspect-[16/9]'
              : 'aspect-[4/3]';

          return (
            <motion.article
              key={work.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.7,
                delay: (idx % 2) * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`${colSpanClass} group`}
            >
              <button
                type="button"
                onClick={() => onSelectWork(work)}
                aria-label={`Inspect case study: ${work.title}`}
                className="w-full text-left block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] cursor-pointer"
              >
                {/* Top Unboxed Metadata Line */}
                <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-black/10 font-mono-label text-[#666666]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#111111]">{work.index}</span>
                    <span aria-hidden="true">—</span>
                    <span>{work.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{work.location}</span>
                  </div>
                  <span>{work.year}</span>
                </div>

                {/* Large Aspect-Ratio Media Container with 700ms cubic-bezier(0.16, 1, 0.3, 1) scale-105 */}
                <div
                  className={`relative w-full ${aspectClass} overflow-hidden bg-[#0A0A0A] border border-black/10`}
                >
                  {!failedImages[work.id] ? (
                    <img
                      src={work.image}
                      alt={`${work.title} — ${work.subtitle}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [work.id]: true }))
                      }
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111111] text-[#F7F7F5] p-8">
                      <span className="font-mono-label">{work.title}</span>
                    </div>
                  )}

                  {/* Subtle Bottom-Right Inspect Prompt on Hover */}
                  <div className="absolute bottom-4 right-4 px-3.5 py-2 bg-[#0A0A0A]/90 text-[#F7F7F5] font-mono-label inline-flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <span>Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Project Title in Inter + Short Punchy Subtitle & Quantified Proof */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-medium text-[#111111] group-hover:underline underline-offset-4">
                      {work.title}
                    </h3>
                    <p className="text-sm text-[#666666] mt-1.5 max-w-md leading-relaxed">
                      {work.subtitle}
                    </p>
                  </div>

                  {/* Primary Quantified Outcome Unboxed */}
                  {work.metrics[0] && (
                    <div className="shrink-0 sm:text-right pt-2 sm:pt-0">
                      <span className="font-mono-label text-[#111111] block">
                        {work.metrics[0].value}
                      </span>
                      <span className="font-mono-label text-[#666666] text-[11px]">
                        {work.metrics[0].label}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};
