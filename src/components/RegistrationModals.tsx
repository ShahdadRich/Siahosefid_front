import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ART_STYLES, ArtStyle } from '../data/siahSefidData';
import {
  ArtistRegistrationInput,
  CollectorRegistrationInput,
  validateArtistRegistration,
  validateCollectorRegistration,
} from '../utils/siahSefidLogic';
import { usePreferences } from '../context/PreferencesContext';
import FoldText from './FoldText';

interface RegistrationModalProps {
  openRole: 'ARTIST' | 'COLLECTOR' | null;
  onClose: () => void;
  onRegisterArtist: (input: ArtistRegistrationInput) => void;
  onRegisterCollector: (input: CollectorRegistrationInput) => void;
  onSwitchRole: (role: 'ARTIST' | 'COLLECTOR') => void;
}

export const PRESET_TOP_UPS = [0, 25000000, 50000000, 100000000, 200000000];

export const RegistrationModals: React.FC<RegistrationModalProps> = ({
  openRole,
  onClose,
  onRegisterArtist,
  onRegisterCollector,
  onSwitchRole,
}) => {
  const { lang, isRtl, isDark, t } = usePreferences();

  const [artistForm, setArtistForm] = useState<ArtistRegistrationInput>({
    fullName: '',
    artisticAlias: '',
    artisticStyle: 'MINIMALISM',
    customStyle: '',
    phone: '',
    email: '',
  });
  const [artistErrors, setArtistErrors] = useState<
    Partial<Record<keyof ArtistRegistrationInput, string>>
  >({});

  const [collectorForm, setCollectorForm] = useState<CollectorRegistrationInput>({
    fullName: '',
    email: '',
    phone: '',
    initialTopUp: 50000000,
  });
  const [collectorErrors, setCollectorErrors] = useState<
    Partial<Record<keyof CollectorRegistrationInput, string>>
  >({});

  const [borderDrawn, setBorderDrawn] = useState(false);
  const [perimeterLength, setPerimeterLength] = useState(2600);
  const [displayedTopUp, setDisplayedTopUp] = useState<number>(50000000);
  const topUpValueRef = useRef<{ val: number }>({ val: 50000000 });

  const modalBoxRef = useRef<HTMLDivElement | null>(null);
  const dividerWrapRef = useRef<HTMLDivElement | null>(null);
  const dividerPathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    setArtistErrors({});
    setCollectorErrors({});
  }, [openRole]);

  // Trigger the progressive 1px top-right SVG perimeter border draw on open
  useEffect(() => {
    if (!openRole) {
      setBorderDrawn(false);
      return;
    }
    setBorderDrawn(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      if (modalBoxRef.current) {
        const rect = modalBoxRef.current.getBoundingClientRect();
        const exactPerim = Math.ceil((rect.width + rect.height) * 2) + 20;
        if (exactPerim > 200) {
          setPerimeterLength(exactPerim);
        }
      }
      raf2 = requestAnimationFrame(() => {
        setBorderDrawn(true);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [openRole]);

  // Keep perimeterLength synced if modal height changes when switching between Artist and Collector or revealing custom style
  useEffect(() => {
    if (!openRole || !modalBoxRef.current) return;
    const rect = modalBoxRef.current.getBoundingClientRect();
    const exactPerim = Math.ceil((rect.width + rect.height) * 2) + 20;
    if (exactPerim > 200) {
      setPerimeterLength(exactPerim);
    }
  }, [openRole, artistForm.artisticStyle, artistErrors, collectorErrors]);

  // Animate the elastic SVG divider string from scaleX(0) to scaleX(1) when opened or switched
  useEffect(() => {
    if (!openRole || !dividerWrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dividerWrapRef.current,
        { scaleX: 0, transformOrigin: 'right center' },
        {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          onComplete: () => {
            if (dividerWrapRef.current) {
              dividerWrapRef.current.style.transform = 'none';
            }
          },
        }
      );
    });
    return () => ctx.revert();
  }, [openRole]);

  // Live animated Persian numeral counter for collector initial wallet top-up
  useEffect(() => {
    const tween = gsap.to(topUpValueRef.current, {
      val: collectorForm.initialTopUp,
      duration: 0.55,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayedTopUp(Math.round(topUpValueRef.current.val));
      },
    });
    return () => {
      tween.kill();
    };
  }, [collectorForm.initialTopUp]);

  if (!openRole) return null;

  const handleDividerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = dividerWrapRef.current;
    const path = dividerPathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 1000;
    const offsetY = Math.max(
      -10,
      Math.min(10, (e.clientY - (rect.top + rect.height / 2)) * 0.65)
    );
    gsap.to(path, {
      attr: {
        d: `M 0 12 Q ${relX.toFixed(1)} ${(12 + offsetY).toFixed(1)} 1000 12`,
      },
      duration: 0.2,
      overwrite: 'auto',
    });
  };

  const handleDividerLeave = () => {
    const path = dividerPathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 0.75,
      ease: 'elastic.out(1, 0.35)',
      overwrite: 'auto',
    });
  };

  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateArtistRegistration(artistForm);
    if (!res.valid) {
      setArtistErrors(res.errors);
      return;
    }
    onRegisterArtist(artistForm);
  };

  const handleCollectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateCollectorRegistration(collectorForm);
    if (!res.valid) {
      setCollectorErrors(res.errors);
      return;
    }
    onRegisterCollector(collectorForm);
  };

  const formattedAnimatedBalance =
    lang === 'fa'
      ? `${displayedTopUp.toLocaleString('fa-IR')} تومان`
      : `${displayedTopUp.toLocaleString('en-US')} TOMAN`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={isRtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={
          openRole === 'ARTIST'
            ? t('ثبت‌نام هنرمند در سیاه و سفید', 'Artist Registration in Siah o Sefid')
            : t('ثبت‌نام هنردوست و کلکسیونر', 'Collector Registration')
        }
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      >
        <motion.div
          ref={modalBoxRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          data-testid="registration-modal-monolith"
          className="siah-light-surface relative w-full max-w-2xl bg-[#050505]/75 backdrop-blur-2xl rounded-none text-white p-7 sm:p-10 md:p-12 my-auto border-0"
        >
          {/* 1. Progressive 1px White SVG Perimeter Border Starting from Top-Right Corner (800ms cubic-bezier(0.22,1,0.36,1)) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-30 w-full h-full overflow-visible"
          >
            <path
              d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{
                strokeDasharray: perimeterLength + 400,
                strokeDashoffset: borderDrawn ? 0 : perimeterLength + 400,
                transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </svg>

          {/* 2. Top Role Switcher Bar (Clean Top Row for Close Trigger + Centered Pure Words Toggle Below) */}
          <div className="relative z-20 flex flex-col items-center pb-6 md:pb-7">
            {/* Clean Top Row for Close Button so it NEVER overlaps the role toggle at any screen width */}
            <div className="flex w-full justify-end mb-4 md:mb-2">
              <button
                type="button"
                onClick={onClose}
                aria-label={t('بستن پنجره ثبت‌نام', 'Close registration modal')}
                data-testid="modal-close-button"
                className="group border-0 bg-transparent px-1 py-1 text-xs sm:text-sm font-light text-white/75 hover:text-white inline-flex items-center gap-1.5 transition-colors duration-300 cursor-pointer rounded-none focus:outline-none"
              >
                <span>{t('بستن', 'Close')}</span>
                <span
                  aria-hidden="true"
                  className="inline-block text-base leading-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90"
                >
                  ×
                </span>
              </button>
            </div>

            {/* Sleek Centered Architectural Toggle: ONLY «هنرمندم» and «هنردوستم» */}
            <div
              role="tablist"
              aria-label={t('انتخاب نقش کاربری', 'Select User Role')}
              className="relative inline-grid grid-cols-2 border border-white/25 rounded-none bg-transparent p-0.5"
            >
              {/* Sliding Background Curtain */}
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: isDark ? '#ffffff' : '#131313',
                }}
                className={`pointer-events-none absolute inset-y-0.5 w-[calc(50%-2px)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isDark ? '!bg-white' : '!bg-[#131313]'
                } ${
                  isRtl
                    ? openRole === 'ARTIST'
                      ? 'right-0.5'
                      : 'right-[calc(50%+1px)]'
                    : openRole === 'ARTIST'
                    ? 'left-0.5'
                    : 'left-[calc(50%+1px)]'
                }`}
              />

              <button
                type="button"
                role="tab"
                aria-selected={openRole === 'ARTIST'}
                onClick={() => onSwitchRole('ARTIST')}
                data-testid="modal-switch-artist"
                style={{
                  color: openRole === 'ARTIST'
                    ? isDark ? '#050505' : '#fcfcfd'
                    : isDark ? 'rgba(255,255,255,0.65)' : '#000000',
                }}
                className={`relative z-10 px-6 sm:px-8 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors duration-500 cursor-pointer focus:outline-none ${
                  openRole === 'ARTIST'
                    ? isDark ? '!text-[#050505]' : '!text-[#fcfcfd]'
                    : isDark ? 'text-white/65 hover:text-white' : '!text-[#000000]'
                }`}
              >
                <span className="!text-inherit">{t('هنرمندم', 'Artist')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={openRole === 'COLLECTOR'}
                onClick={() => onSwitchRole('COLLECTOR')}
                data-testid="modal-switch-collector"
                style={{
                  color: openRole === 'COLLECTOR'
                    ? isDark ? '#050505' : '#fcfcfd'
                    : isDark ? 'rgba(255,255,255,0.65)' : '#000000',
                }}
                className={`relative z-10 px-6 sm:px-8 py-2 text-xs sm:text-sm font-bold rounded-none transition-colors duration-500 cursor-pointer focus:outline-none ${
                  openRole === 'COLLECTOR'
                    ? isDark ? '!text-[#050505]' : '!text-[#fcfcfd]'
                    : isDark ? 'text-white/65 hover:text-white' : '!text-[#000000]'
                }`}
              >
                <span className="!text-inherit">{t('هنردوستم', 'Collector')}</span>
              </button>
            </div>
          </div>

          {/* Centered Header with <FoldText /> & Elastic Mouse-Reactive SVG String Divider */}
          <div
            onPointerMove={handleDividerMove}
            onPointerLeave={handleDividerLeave}
            className="relative z-20 text-center mx-auto flex flex-col items-center justify-center space-y-3 pb-8 mb-6"
          >
            <h2
              key={`title-${openRole}`}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mx-auto flex flex-col items-center justify-center w-full"
            >
              <FoldText
                text={
                  openRole === 'ARTIST'
                    ? t(
                        'ثبت‌نام هنرمند و ایجاد استودیو شخصی',
                        'Artist Registration & Studio Setup'
                      )
                    : t(
                        'عضویت هنردوست و فعال‌سازی کیف‌پول',
                        'Collector Membership & Wallet Activation'
                      )
                }
                splitBy="word"
                foldStyle="paper"
                trigger="mount"
                hoverRefold={true}
                color="#FFFFFF"
                fontWeight={900}
                className="text-center justify-center"
                style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.3 }}
              />
            </h2>

            <p
              key={`subtitle-${openRole}`}
              className="text-xs sm:text-sm text-white/80 font-light leading-relaxed text-center max-w-lg mx-auto flex flex-col items-center justify-center w-full"
            >
              <FoldText
                text={
                  openRole === 'ARTIST'
                    ? t(
                        'پس از تکمیل اطلاعات، مستقیماً وارد پنل هنرمند خواهید شد و می‌توانید آثار خود را ثبت و قیمت‌گذاری کنید.',
                        'Upon registration, you will enter your personal Artist Studio to publish and price artworks.'
                      )
                    : t(
                        'با ثبت‌نام به عنوان هنردوست، می‌توانید حساب خود را شارژ کرده و آثار اصیل گالری را به صورت آنی خریداری نمایید.',
                        'Register as a collector to top up your wallet and acquire authentic artworks directly from the exhibition.'
                      )
                }
                splitBy="word"
                foldStyle="paper"
                trigger="mount"
                hoverRefold={true}
                color="#FFFFFF"
                fontWeight={300}
                className="text-center justify-center"
                style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.75 }}
              />
            </p>

            {/* Elastic Mouse-Reactive SVG String Divider */}
            <div
              ref={dividerWrapRef}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-[6px] inset-x-0 h-[24px] w-full overflow-visible"
            >
              <svg
                viewBox="0 0 1000 24"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <path
                  ref={dividerPathRef}
                  d="M 0 12 Q 500 12 1000 12"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          {openRole === 'ARTIST' ? (
            <form
              onSubmit={handleArtistSubmit}
              noValidate
              className="relative z-20 space-y-7"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="artist-fullname"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      artistForm.fullName.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('نام و نام خانوادگی:', 'Full Name:')}
                  </label>
                  <div className="relative">
                    <input
                      id="artist-fullname"
                      type="text"
                      value={artistForm.fullName}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, fullName: e.target.value })
                      }
                      placeholder={t('مثال: کیوان دولتشاهی', 'e.g., Keyvan Dolatshahi')}
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {artistErrors.fullName && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {artistErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Artistic Alias — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="artist-alias"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      artistForm.artisticAlias.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('نام هنری:', 'Artistic Alias:')}
                  </label>
                  <div className="relative">
                    <input
                      id="artist-alias"
                      type="text"
                      value={artistForm.artisticAlias}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, artisticAlias: e.target.value })
                      }
                      placeholder={t('مثال: سایه‌نگار', 'e.g., Shadow')}
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {artistErrors.artisticAlias && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {artistErrors.artisticAlias}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Interactive Architectural Style Monoliths (Zero <select>, Zero Static Border) */}
              <div className="space-y-3">
                <span
                  id="artist-style-label"
                  className="block text-xs font-medium text-white/75"
                >
                  {t('سبک هنری:', 'Primary Artistic Style:')}
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="artist-style-label"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5"
                >
                  {ART_STYLES.map((st) => {
                    const isSelected = artistForm.artisticStyle === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        data-testid={`style-tile-${st.key}`}
                        onClick={() =>
                          setArtistForm({
                            ...artistForm,
                            artisticStyle: st.key as ArtStyle,
                          })
                        }
                        style={{
                          backgroundColor: isSelected
                            ? isDark ? '#ffffff' : '#131313'
                            : 'transparent',
                          color: isSelected
                            ? isDark ? '#050505' : '#fcfcfd'
                            : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
                        }}
                        className={`group relative py-3 px-2 text-xs rounded-none border-0 transition-all duration-500 cursor-pointer focus:outline-none ${
                          isSelected
                            ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                            : isDark ? 'bg-transparent text-white/75 hover:text-white font-light' : 'bg-transparent !text-[#000000] font-light'
                        }`}
                      >
                        {/* Single Continuous 1px SVG Perimeter Hover Border Draw (Hidden when selected) */}
                        {!isSelected && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
                          >
                            <path
                              d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                              fill="none"
                              stroke={isDark ? 'rgba(255, 255, 255, 0.9)' : '#131313'}
                              strokeWidth="1"
                              vectorEffect="non-scaling-stroke"
                              className="[stroke-dasharray:460] [stroke-dashoffset:460] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            />
                          </svg>
                        )}
                        <span className="relative z-10 block text-center !text-inherit">
                          {lang === 'fa' ? st.labelFa : st.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Smoothly Revealed Custom Artistic Style Underline Input when «غیره» is selected */}
                <AnimatePresence initial={false}>
                  {artistForm.artisticStyle === 'OTHER' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden pt-2"
                    >
                      <div className="group relative">
                        <input
                          id="artist-custom-style"
                          data-testid="artist-custom-style-input"
                          type="text"
                          value={artistForm.customStyle || ''}
                          onChange={(e) =>
                            setArtistForm({
                              ...artistForm,
                              customStyle: e.target.value,
                            })
                          }
                          placeholder={t(
                            'نام سبک هنری خود را بنویسید...',
                            'Type your custom artistic style...'
                          )}
                          aria-label={t(
                            'نام سبک هنری دلخواه',
                            'Custom Artistic Style Name'
                          )}
                          className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none placeholder:text-white/25"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                      </div>
                      {artistErrors.customStyle && (
                        <p className="mt-1.5 text-xs text-red-400 font-light">
                          {artistErrors.customStyle}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone Number — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="artist-phone"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      artistForm.phone.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('شماره تماس:', 'Phone Number:')}
                  </label>
                  <div className="relative">
                    <input
                      id="artist-phone"
                      type="tel"
                      dir="ltr"
                      value={artistForm.phone}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, phone: e.target.value })
                      }
                      placeholder="09123456789"
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none text-left font-mono-archival placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {artistErrors.phone && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {artistErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="artist-email"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      artistForm.email.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('ایمیل:', 'Email Address:')}
                  </label>
                  <div className="relative">
                    <input
                      id="artist-email"
                      type="email"
                      dir="ltr"
                      value={artistForm.email}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, email: e.target.value })
                      }
                      placeholder="artist@siahosefid.art"
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none text-left font-mono-archival placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {artistErrors.email && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {artistErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Kinetic "Siah o Sefid" Submit Gateway Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  data-testid="submit-artist-registration"
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`group relative w-full py-4 px-8 rounded-none border text-sm sm:text-base font-bold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer overflow-hidden focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
                  >
                    <path
                      d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                      fill="none"
                      stroke={isDark ? '#FFFFFF' : '#131313'}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      className="[stroke-dasharray:1600] [stroke-dashoffset:1600] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </svg>
                  <span className="relative z-10 !text-inherit">
                    {t(
                      'ثبت‌نام هنرمند و ورود به استودیو',
                      'Complete Artist Registration'
                    )}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleCollectorSubmit}
              noValidate
              className="relative z-20 space-y-7"
            >
              {/* Full Name — Swiss Editorial Underline Field */}
              <div className="group relative pt-1">
                <label
                  htmlFor="collector-fullname"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    collectorForm.fullName.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t('نام و نام خانوادگی:', 'Full Name:')}
                </label>
                <div className="relative">
                  <input
                    id="collector-fullname"
                    type="text"
                    value={collectorForm.fullName}
                    onChange={(e) =>
                      setCollectorForm({ ...collectorForm, fullName: e.target.value })
                    }
                    placeholder={t('مثال: سارا نیازی', 'e.g., Sara Niazi')}
                    className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none placeholder:text-white/25"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
                {collectorErrors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400 font-light">
                    {collectorErrors.fullName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="collector-email"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      collectorForm.email.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('ایمیل:', 'Email Address:')}
                  </label>
                  <div className="relative">
                    <input
                      id="collector-email"
                      type="email"
                      dir="ltr"
                      value={collectorForm.email}
                      onChange={(e) =>
                        setCollectorForm({ ...collectorForm, email: e.target.value })
                      }
                      placeholder="collector@siahosefid.art"
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none text-left font-mono-archival placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {collectorErrors.email && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {collectorErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number — Swiss Editorial Underline Field */}
                <div className="group relative pt-1">
                  <label
                    htmlFor="collector-phone"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      collectorForm.phone.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('شماره تماس:', 'Phone Number:')}
                  </label>
                  <div className="relative">
                    <input
                      id="collector-phone"
                      type="tel"
                      dir="ltr"
                      value={collectorForm.phone}
                      onChange={(e) =>
                        setCollectorForm({ ...collectorForm, phone: e.target.value })
                      }
                      placeholder="09128889900"
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-lg focus:outline-none rounded-none text-left font-mono-archival placeholder:text-white/25"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                  {collectorErrors.phone && (
                    <p className="mt-1.5 text-xs text-red-400 font-light">
                      {collectorErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Architectural Amount Monoliths & Live Animated Persian Numeral Counter (Zero Static Border) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                  <span
                    id="collector-topup-label"
                    className="text-xs font-light text-white/65"
                  >
                    {t(
                      'شارژ اولیه حساب (اختیاری — جهت خرید آنی آثار):',
                      'Initial Wallet Deposit (Optional — for instant acquisition):'
                    )}
                  </span>
                  <div
                    data-testid="collector-animated-balance"
                    className="text-2xl sm:text-3xl font-black text-white tabular-nums"
                  >
                    {formattedAnimatedBalance}
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-labelledby="collector-topup-label"
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2.5"
                >
                  {PRESET_TOP_UPS.map((amt) => {
                    const isSelected = collectorForm.initialTopUp === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        data-testid={`topup-monolith-${amt}`}
                        onClick={() =>
                          setCollectorForm({ ...collectorForm, initialTopUp: amt })
                        }
                        style={{
                          backgroundColor: isSelected
                            ? isDark ? '#ffffff' : '#131313'
                            : 'transparent',
                          color: isSelected
                            ? isDark ? '#050505' : '#fcfcfd'
                            : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
                        }}
                        className={`group relative py-3 px-2.5 text-xs rounded-none border-0 transition-all duration-500 cursor-pointer focus:outline-none ${
                          isSelected
                            ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                            : isDark ? 'bg-transparent text-white/75 hover:text-white font-light' : 'bg-transparent !text-[#000000] font-light'
                        }`}
                      >
                        {/* Single Continuous 1px SVG Perimeter Hover Border Draw (Hidden when selected) */}
                        {!isSelected && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
                          >
                            <path
                              d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                              fill="none"
                              stroke={isDark ? 'rgba(255, 255, 255, 0.9)' : '#131313'}
                              strokeWidth="1"
                              vectorEffect="non-scaling-stroke"
                              className="[stroke-dasharray:460] [stroke-dashoffset:460] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            />
                          </svg>
                        )}
                        <span className="relative z-10 block text-center !text-inherit">
                          {amt === 0
                            ? t('بدون شارژ', 'No Deposit')
                            : lang === 'fa'
                            ? `${(amt / 1000000).toLocaleString('fa-IR')} میلیون`
                            : `${amt / 1000000}M Toman`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Kinetic "Siah o Sefid" Submit Gateway Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  data-testid="submit-collector-registration"
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`group relative w-full py-4 px-8 rounded-none border text-sm sm:text-base font-bold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer overflow-hidden focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
                  >
                    <path
                      d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                      fill="none"
                      stroke={isDark ? '#FFFFFF' : '#131313'}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      className="[stroke-dasharray:1600] [stroke-dashoffset:1600] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </svg>
                  <span className="relative z-10 !text-inherit">
                    {t(
                      'تکمیل عضویت و ورود به گالری آثار',
                      'Complete Collector Registration'
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

