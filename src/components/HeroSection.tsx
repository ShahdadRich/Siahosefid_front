import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, Play, Pause, SlidersHorizontal } from 'lucide-react';
import { BrandConfig, HERO_VISUAL } from '../data/studioData';

interface HeroSectionProps {
  brandConfig: BrandConfig;
  onOpenEnquiry: () => void;
  onOpenCustomizer: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  brandConfig,
  onOpenEnquiry,
  onOpenCustomizer,
}) => {
  const [reelActive, setReelActive] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="top"
      className="pt-20 pb-16 md:pt-24 md:pb-28 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-black/10"
    >
      {/* Top Archival Index Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-8 md:mb-10 border-b border-black/10">
        <div className="flex items-center gap-3 font-mono-label text-[#666666]">
          <span>00 — PROPOSITION</span>
          <span aria-hidden="true">·</span>
          <span>{brandConfig.brandTagline}</span>
        </div>

        <button
          type="button"
          onClick={onOpenCustomizer}
          className="font-mono-label text-[#111111] hover:text-[#666666] inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Personalize Brand Name</span>
        </button>
      </div>

      {/* Main Split-Screen Hero Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        {/* Left Column: Massive Typographic Statement Anchored at Bottom-Left */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl mb-8 lg:mb-12"
          >
            <p className="font-mono-label text-[#666666] mb-3">
              {HERO_VISUAL.architecturalLocation}
            </p>
            <p className="text-base md:text-lg text-[#111111] leading-relaxed font-normal">
              {brandConfig.heroSubcopy}
            </p>
          </motion.div>

          {/* Bottom-Left Anchored Monumental Headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-auto"
          >
            <h1 className="headline-giant font-medium text-[#111111] leading-[0.94]">
              <span className="block lowercase text-[#666666] font-normal">
                {brandConfig.heroStatementLower}
              </span>
              <span className="block mt-1">{brandConfig.heroStatementSentence}</span>
            </h1>

            <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenEnquiry}
                  className="px-6 py-3.5 rounded-full bg-[#0A0A0A] text-[#F7F7F5] hover:bg-[#222222] font-mono-label inline-flex items-center gap-2.5 transition-colors duration-200 ease-editorial whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Start a commission</span>
                  <ArrowDownRight className="w-4 h-4" />
                </button>
                <a
                  href="#works"
                  className="px-5 py-3.5 font-mono-label text-[#111111] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Explore Index (04)
                </a>
              </div>

              <span className="font-mono-label text-[#666666] whitespace-nowrap">
                SCROLL TO INSPECT ↓
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Asymmetrically Framed High-Impact Visual / Showreel Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="relative w-full h-full min-h-[420px] lg:min-h-[520px] bg-[#0A0A0A] overflow-hidden group border border-black/10 flex flex-col justify-between">
            {!imageError ? (
              <img
                src={HERO_VISUAL.image}
                alt="Monumental concrete architectural pavilion with geometric sunlight shadows"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-showcase ${
                  reelActive ? 'scale-105 brightness-75' : 'group-hover:scale-105'
                }`}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#111111] text-[#F7F7F5] p-8">
                <span className="font-mono-label">ARCHITECTURAL MONOLITH STUDY IV</span>
              </div>
            )}

            {/* Measured contrast scrim for legible overlay text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />

            {/* Top Frame Coordinates */}
            <div className="relative z-10 p-5 flex items-center justify-between text-[#F7F7F5] font-mono-label border-b border-white/15">
              <span>{HERO_VISUAL.captionIndex}</span>
              <span>{reelActive ? 'REEL PLAYING · 24FPS' : `SHOWREEL ${HERO_VISUAL.reelDuration}`}</span>
            </div>

            {/* Interactive Showreel Inspection Overlay when active */}
            <AnimatePresence>
              {reelActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 mx-5 my-auto p-5 bg-[#0A0A0A]/90 border border-white/20 text-[#F7F7F5]"
                >
                  <p className="font-mono-label text-neutral-400 mb-2">
                    [2026 ANTHOLOGY REEL — CHAPTERS]
                  </p>
                  <ul className="space-y-2 font-mono-label text-xs text-neutral-200">
                    <li className="flex justify-between border-b border-white/10 pb-1">
                      <span>00:00 — AUDIUM ACOUSTICS MONOLITH</span>
                      <span>BASEL</span>
                    </li>
                    <li className="flex justify-between border-b border-white/10 pb-1">
                      <span>00:28 — AETHER TYPE-01 COCKPIT HMI</span>
                      <span>MUNICH</span>
                    </li>
                    <li className="flex justify-between border-b border-white/10 pb-1">
                      <span>00:54 — CORPUS NO. 07 APOTHECARY</span>
                      <span>PARIS</span>
                    </li>
                    <li className="flex justify-between">
                      <span>01:19 — CALIBRE IX ESCAPEMENT STUDY</span>
                      <span>GENEVA</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Frame Trigger */}
            <div className="relative z-10 p-5 mt-auto flex items-center justify-between border-t border-white/15">
              <div className="font-mono-label text-neutral-200">
                <span>LEICA M11 · 35MM SUMMILUX</span>
              </div>
              <button
                type="button"
                onClick={() => setReelActive((prev) => !prev)}
                className="px-4 py-2 rounded-full bg-[#F7F7F5] text-[#0A0A0A] hover:bg-neutral-200 font-mono-label inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {reelActive ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Close Reel Breakdown</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Inspect Showreel ({HERO_VISUAL.reelDuration})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-Width 4-Column Quantified Proof Strip Below Hero Split */}
      <div className="mt-16 md:mt-24 pt-10 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {HERO_VISUAL.metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className={`${
              idx > 0 ? 'sm:border-l sm:border-black/10 sm:pl-8' : ''
            } flex flex-col justify-between`}
          >
            <span className="font-mono-label text-[#666666] mb-2">
              [0{idx + 1} — VERIFIED IMPACT]
            </span>
            <p className="text-3xl md:text-4xl font-medium text-[#111111] tabular-nums">
              {metric.value}
            </p>
            <p className="text-xs text-[#666666] mt-2 leading-relaxed">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
