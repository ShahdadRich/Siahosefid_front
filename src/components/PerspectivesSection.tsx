import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PerspectiveArticle, BrandConfig } from '../data/studioData';

interface PerspectivesSectionProps {
  articles: PerspectiveArticle[];
  brandConfig: BrandConfig;
  onSelectArticle: (article: PerspectiveArticle) => void;
}

export const PerspectivesSection: React.FC<PerspectivesSectionProps> = ({
  articles,
  brandConfig,
  onSelectArticle,
}) => {
  return (
    <>
      {/* 03 — Perspectives & Editorial Essays (3-Column Grid) */}
      <section
        id="perspectives"
        className="py-24 md:py-36 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-black/10"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 mb-16 border-b border-black/10">
          <div>
            <p className="font-mono-label text-[#666666] mb-4">
              [03 — PERSPECTIVES & RESEARCH]
            </p>
            <h2 className="headline-giant font-medium text-[#111111]">
              <span className="lowercase text-[#666666] font-normal">written </span>
              <span>Positions.</span>
            </h2>
          </div>
          <p className="font-mono-label text-[#666666] max-w-xs">
            ARCHIVAL ESSAYS ON DESIGN SYSTEMS, TYPOGRAPHIC TENSION, AND KINETIC PHYSICS.
          </p>
        </div>

        {/* Clean 3-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-0 lg:divide-x lg:divide-black/10">
          {articles.map((article, idx) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0.9, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`${
                idx === 0
                  ? 'lg:pr-10'
                  : idx === 1
                  ? 'lg:px-10'
                  : 'lg:pl-10'
              } flex flex-col justify-between group`}
            >
              <div>
                {/* Top Monospace Category Tag + Date + Read Time (Unboxed, Zero Pill) */}
                <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-black/10 font-mono-label text-[#666666]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#111111]">{article.index}</span>
                    <span aria-hidden="true">—</span>
                    <span className="text-[#111111] font-medium">{article.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Bold Typographic Title */}
                <h3 className="text-2xl md:text-[28px] font-medium leading-[1.15] text-[#111111] mb-4 group-hover:underline underline-offset-4">
                  {article.title}
                </h3>

                <p className="text-sm text-[#666666] leading-relaxed mb-8">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-6 border-t border-black/10 flex items-center justify-between gap-4">
                <div className="font-mono-label text-[#666666]">
                  <span className="text-[#111111]">{article.author}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{article.authorRole}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectArticle(article)}
                  aria-label={`Read essay: ${article.title}`}
                  className="font-mono-label text-[#111111] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Read Essay</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 04 — Studio Ethos & Architectural Principles */}
      <section
        id="ethos"
        className="py-24 md:py-32 px-6 md:px-12 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <p className="font-mono-label text-[#666666] mb-3">04 — STUDIO ETHOS</p>
            <p className="font-mono-label text-[#111111]">
              {brandConfig.brandName} ARCHITECTURAL DOCTRINE
            </p>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <p className="text-2xl sm:text-3xl md:text-4xl font-medium leading-[1.12] text-[#111111] text-balance">
              We reject the disposable agency model. Every commission is led directly by
              founding principals—treating typography as structural concrete, whitespace as
              acoustic insulation, and code as precision horology.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-black/10">
              <div>
                <p className="font-mono-label text-[#111111] mb-2">
                  01. DIRECT PRINCIPAL AUTHORSHIP
                </p>
                <p className="text-sm text-[#666666] leading-relaxed">
                  No account managers or junior handoffs. You work directly with the
                  architects designing your identity, writing your shaders, and directing your
                  film.
                </p>
              </div>
              <div>
                <p className="font-mono-label text-[#111111] mb-2">
                  02. VERIFIABLE COMMERCIAL GRAVITY
                </p>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Aesthetic rigor exists to drive commercial asymmetry: faster collector
                  allocations, higher pricing power, and unmistakable category separation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
