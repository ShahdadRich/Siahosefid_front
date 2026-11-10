import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { BrandConfig } from '../data/studioData';

interface FooterSectionProps {
  brandConfig: BrandConfig;
  submittedCount: number;
  onOpenEnquiry: () => void;
  onOpenCustomizer: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  brandConfig,
  submittedCount,
  onOpenEnquiry,
  onOpenCustomizer,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.22;
    const deltaY = (e.clientY - centerY) * 0.28;
    setMagneticOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  return (
    <footer
      id="footer-cta"
      className="bg-[#0A0A0A] text-[#F7F7F5] pt-24 pb-16 md:pt-36 md:pb-20 px-6 md:px-12"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Top Index & Availability Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-10 mb-14 md:mb-20 border-b border-white/12 font-mono-label text-neutral-400">
          <span>05 — INITIATE DIALOGUE</span>
          <span>
            Q1 / Q2 COMMISSION ALLOCATION —{' '}
            {submittedCount > 0
              ? `${submittedCount} ENQUIRY LOGGED IN SESSION`
              : '2 SLOTS AVAILABLE'}
          </span>
        </div>

        {/* Giant Call-To-Action ("It starts here") + Magnetic Pill Button */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-24 md:pb-32 border-b border-white/12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <h2 className="headline-footer font-medium leading-[0.93] text-[#F7F7F5]">
              <span className="lowercase text-neutral-500 font-normal block">
                ready to build?
              </span>
              <span>It starts here.</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-400 mt-8 max-w-xl leading-relaxed">
              Direct access to our founding creative directors in {brandConfig.primaryCity} and{' '}
              {brandConfig.secondaryCity}. Share your timeline, ambition, and scope.
            </p>
          </motion.div>

          {/* Magnetic Pill Button ("Make an enquiry") */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
            <motion.button
              ref={buttonRef}
              type="button"
              onClick={onOpenEnquiry}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ x: magneticOffset.x, y: magneticOffset.y }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.5 }}
              className="px-9 py-5 rounded-full bg-[#F7F7F5] text-[#0A0A0A] hover:bg-white font-mono-label text-sm inline-flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Make an enquiry</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>

            <button
              type="button"
              onClick={onOpenCustomizer}
              className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/60 text-neutral-300 font-mono-label inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit Studio Brand Name</span>
            </button>
          </div>
        </div>

        {/* Structured 4-Column Monospace Sitemap */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/12 font-mono-label">
          {/* Col 1: Index */}
          <div className="space-y-4">
            <p className="text-neutral-500">01 — SITEMAP</p>
            <ul className="space-y-2.5 text-neutral-200">
              <li>
                <a href="#top" className="hover:underline underline-offset-4">
                  00 — Proposition
                </a>
              </li>
              <li>
                <a href="#works" className="hover:underline underline-offset-4">
                  01 — Selected Works (04)
                </a>
              </li>
              <li>
                <a href="#services" className="hover:underline underline-offset-4">
                  02 — Capabilities & Services
                </a>
              </li>
              <li>
                <a href="#perspectives" className="hover:underline underline-offset-4">
                  03 — Perspectives & Research
                </a>
              </li>
              <li>
                <a href="#ethos" className="hover:underline underline-offset-4">
                  04 — Studio Ethos
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Studios */}
          <div className="space-y-4">
            <p className="text-neutral-500">02 — STUDIOS</p>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <div>
                <p className="text-[#F7F7F5]">{brandConfig.primaryCity} HQ</p>
                <p className="text-neutral-400">Talstrasse 82, 8001</p>
              </div>
              <div>
                <p className="text-[#F7F7F5]">{brandConfig.secondaryCity} ATELIER</p>
                <p className="text-neutral-400">Fereshteh Blvd, Architectural Wing</p>
              </div>
            </div>
          </div>

          {/* Col 3: Direct Channels */}
          <div className="space-y-4">
            <p className="text-neutral-500">03 — DIRECT CHANNELS</p>
            <ul className="space-y-2.5 text-neutral-300">
              <li>
                <button
                  type="button"
                  onClick={onOpenEnquiry}
                  className="hover:underline underline-offset-4 text-left cursor-pointer text-[#F7F7F5]"
                >
                  {brandConfig.contactEmail}
                </button>
              </li>
              <li>
                <a
                  href="#works"
                  className="hover:underline underline-offset-4 text-neutral-400"
                >
                  Archive Monograph PDF (2026)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="hover:underline underline-offset-4 text-left cursor-pointer text-neutral-400"
                >
                  Brand Identity Configurator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Colophon */}
          <div className="space-y-4">
            <p className="text-neutral-500">04 — COLOPHON</p>
            <p className="text-neutral-400 leading-relaxed">
              TYPESET IN YEKAN. ENGINEERED WITH SWISS EDITORIAL PROPORTION.
            </p>
            <p className="text-neutral-300">
              © {new Date().getFullYear()} {brandConfig.brandName} ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>

        {/* Bottom Giant Monospace Brand Signature */}
        <div className="pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-label text-neutral-500">
          <span>{brandConfig.brandName} — INDEPENDENT CREATIVE DIRECTION</span>
          <a href="#top" className="text-neutral-300 hover:text-white transition-colors">
            BACK TO TOP ↑
          </a>
        </div>
      </div>
    </footer>
  );
};
