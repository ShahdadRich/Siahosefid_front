import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, SlidersHorizontal } from 'lucide-react';
import { BrandConfig } from '../data/studioData';
import { formatStudioClock } from '../utils/studioLogic';

interface FloatingHeaderProps {
  brandConfig: BrandConfig;
  onOpenEnquiry: () => void;
  onOpenCustomizer: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  brandConfig,
  onOpenEnquiry,
  onOpenCustomizer,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const zurichTime = formatStudioClock(now, 'Europe/Zurich');

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ease-editorial ${
          scrolled
            ? 'bg-[#F7F7F5]/95 border-b border-black/10'
            : 'bg-[#F7F7F5]/80 border-b border-black/10'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (single text element, one line) */}
          <a
            href="#top"
            className="text-base md:text-lg font-semibold text-[#111111] whitespace-nowrap shrink-0"
          >
            {brandConfig.brandName}
          </a>

          {/* Zone 2: Center Live Local Time/Location in Chivo Mono + concise nav links */}
          <div className="hidden lg:flex items-center gap-8">
            <span
              className="font-mono-label text-[#666666] whitespace-nowrap shrink-0"
              aria-label="Live studio location and time"
            >
              {brandConfig.primaryCity} / {brandConfig.secondaryCity} — {zurichTime} CET
            </span>
            <nav aria-label="Primary Navigation" className="flex items-center gap-6">
              <a
                href="#works"
                className="font-mono-label text-[#111111] hover:underline underline-offset-4 transition-all whitespace-nowrap shrink-0"
              >
                Works
              </a>
              <a
                href="#services"
                className="font-mono-label text-[#111111] hover:underline underline-offset-4 transition-all whitespace-nowrap shrink-0"
              >
                Services
              </a>
              <a
                href="#perspectives"
                className="font-mono-label text-[#111111] hover:underline underline-offset-4 transition-all whitespace-nowrap shrink-0"
              >
                Perspectives
              </a>
              <a
                href="#footer-cta"
                className="font-mono-label text-[#111111] hover:underline underline-offset-4 transition-all whitespace-nowrap shrink-0"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Zone 3: Minimal Pill-Shaped Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="px-5 py-2 rounded-full border border-[#111111] bg-transparent hover:bg-[#0A0A0A] hover:text-[#F7F7F5] text-[#111111] font-mono-label transition-colors duration-200 ease-editorial whitespace-nowrap shrink-0 cursor-pointer"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Editorial Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Studio Navigation Menu"
            className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#F7F7F5] flex flex-col justify-between px-6 md:px-12 py-6 overflow-y-auto"
          >
            {/* Top Bar inside Drawer */}
            <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between pb-6 border-b border-white/15">
              <span className="text-base md:text-lg font-semibold text-[#F7F7F5] whitespace-nowrap">
                {brandConfig.brandName}
              </span>
              <span className="font-mono-label text-neutral-400 hidden sm:inline whitespace-nowrap">
                INDEX — {brandConfig.primaryCity} {zurichTime}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu overlay"
                className="px-5 py-2 rounded-full border border-white/30 hover:bg-[#F7F7F5] hover:text-[#0A0A0A] font-mono-label transition-colors duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center Giant Editorial Links */}
            <div className="max-w-[1440px] w-full mx-auto my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-8 space-y-3">
                <p className="font-mono-label text-neutral-400 mb-6">
                  00 — DIRECTORY
                </p>
                {[
                  { index: '01', label: 'Selected works', href: '#works', count: '04 CASE STUDIES' },
                  { index: '02', label: 'Capabilities & services', href: '#services', count: '04 DISCIPLINES' },
                  { index: '03', label: 'Perspectives & essays', href: '#perspectives', count: '03 MONOGRAPHS' },
                  { index: '04', label: 'Studio ethos', href: '#ethos', count: 'MANIFESTO' },
                ].map((item) => (
                  <div
                    key={item.index}
                    className="border-b border-white/12 pb-3 group flex items-baseline justify-between gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      className="text-left text-3xl sm:text-5xl md:text-6xl font-medium leading-[0.95] text-[#F7F7F5] group-hover:translate-x-3 transition-transform duration-300 ease-editorial cursor-pointer"
                    >
                      <span className="font-mono-label text-neutral-500 mr-4 align-middle">
                        {item.index}
                      </span>
                      {item.label}
                    </button>
                    <span className="font-mono-label text-neutral-400 hidden sm:inline whitespace-nowrap">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Column: Actions & Brand Customizer Trigger */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/15 pt-8 lg:pt-0 lg:pl-10 space-y-8">
                <div>
                  <p className="font-mono-label text-neutral-400 mb-3">
                    NEW COMMISSIONS — Q1/Q2
                  </p>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                    We partner with four ambitious organizations per quarter across brand
                    architecture, flagship web platforms, and launch films.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenEnquiry();
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-[#F7F7F5] text-[#0A0A0A] hover:bg-neutral-200 font-mono-label flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Make an enquiry</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-6 border-t border-white/12">
                  <p className="font-mono-label text-neutral-400 mb-2">
                    BRAND IDENTITY CUSTOMIZER
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    Personalize the studio brand name, cities, and hero statement for your own
                    agency or subject.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenCustomizer();
                    }}
                    className="w-full py-3 px-5 rounded-full border border-white/25 hover:border-white text-[#F7F7F5] font-mono-label flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Customize Brand Identity</span>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Metadata Bar inside Drawer */}
            <div className="max-w-[1440px] w-full mx-auto pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-label text-neutral-400">
              <span>EST. {brandConfig.foundedYear} · SWISS EDITORIAL ARCHITECTURE</span>
              <span>{brandConfig.contactEmail}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
