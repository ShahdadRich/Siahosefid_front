import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  AppView,
  ArtworkItem,
  ART_STYLES,
  ArtStyle,
  PlatformUser,
} from '../data/siahSefidData';
import {
  NewArtworkInput,
  validateArtworkInput,
  getStyleLabel,
} from '../utils/siahSefidLogic';
import { usePreferences } from '../context/PreferencesContext';
import { MeshDriftCanvas } from './MeshDriftCanvas';
import FoldText from './FoldText';
import { ThemeToggle } from './ui/theme-toggle';

interface ArtistStudioViewProps {
  artists: PlatformUser[];
  activeArtist: PlatformUser;
  onSelectArtist: (artistId: string) => void;
  artworks: ArtworkItem[];
  onAddArtwork: (input: NewArtworkInput) => void;
  onUpdateArtwork: (
    artworkId: string,
    updates: { title: string; price: number; story: string; style: ArtStyle }
  ) => void;
  onDeleteArtwork: (artworkId: string) => void;
  onNavigateView: (view: AppView) => void;
  onLogout?: () => void;
}

export const STUDIO_SAMPLE_IMAGES = [
  {
    labelFa: 'خطاطی و زغال',
    labelEn: 'Charcoal & Sumi Ink',
    url: '/images/art_charcoal_calligraphy_1793998760531.jpg',
  },
  {
    labelFa: 'شکاف اخرایی',
    labelEn: 'Ochre Fissure',
    url: '/images/art_crimson_void_canvas_1793998762808.jpg',
  },
  {
    labelFa: 'برنز و تراورتن',
    labelEn: 'Bronze & Travertine',
    url: '/images/art_brutalist_bronze_sculpture_1793998761500.jpg',
  },
  {
    labelFa: 'سیلور ژلاتین کویر',
    labelEn: 'Desert Silver Gelatin',
    url: '/images/art_silver_gelatin_desert_1793998763137.jpg',
  },
  {
    labelFa: 'پاویون بتن و سایه',
    labelEn: 'Concrete Pavilion',
    url: '/images/hero_architectural_monolith_1793991682371.jpg',
  },
];

export const ArtistStudioView: React.FC<ArtistStudioViewProps> = ({
  activeArtist,
  artworks,
  onAddArtwork,
  onUpdateArtwork,
  onDeleteArtwork,
  onNavigateView,
  onLogout,
}) => {
  const { lang, isRtl, isDark, toggleTheme, t, formatPrice } = usePreferences();
  const artistWorks = artworks.filter((a) => a.artistId === activeArtist.id);

  const [newArt, setNewArt] = useState<NewArtworkInput>({
    title: '',
    titleEn: '',
    style: activeArtist.artisticStyle || 'MINIMALISM',
    customStyle: '',
    price: 45000000,
    dimensions: '120 × 160 cm',
    medium: 'مرکب و زغال فشرده روی بوم کتان',
    story: '',
    image: STUDIO_SAMPLE_IMAGES[0].url,
  });

  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof NewArtworkInput, string>>
  >({});
  const [addedBanner, setAddedBanner] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    price: number;
    story: string;
    style: ArtStyle;
  }>({
    title: '',
    price: 0,
    story: '',
    style: 'MINIMALISM',
  });

  // Elastic SVG String Divider Refs
  const navLineWrapRef = useRef<HTMLDivElement | null>(null);
  const navLinePathRef = useRef<SVGPathElement | null>(null);
  const headerLineWrapRef = useRef<HTMLDivElement | null>(null);
  const headerLinePathRef = useRef<SVGPathElement | null>(null);
  const formLineWrapRef = useRef<HTMLDivElement | null>(null);
  const formLinePathRef = useRef<SVGPathElement | null>(null);
  const listLineWrapRef = useRef<HTMLDivElement | null>(null);
  const listLinePathRef = useRef<SVGPathElement | null>(null);

  // Animated Persian Numeral Counters for the 4 Stats Monoliths
  const registeredCountRef = useRef<HTMLSpanElement | null>(null);
  const soldCountRef = useRef<HTMLSpanElement | null>(null);
  const revenueCountRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wraps = [
      navLineWrapRef.current,
      headerLineWrapRef.current,
      formLineWrapRef.current,
      listLineWrapRef.current,
    ].filter(Boolean);

    const ctx = gsap.context(() => {
      wraps.forEach((w, idx) => {
        gsap.fromTo(
          w,
          { scaleX: 0, transformOrigin: 'right center' },
          {
            scaleX: 1,
            duration: 1.05,
            delay: idx * 0.1,
            ease: 'power3.out',
            onComplete: () => {
              if (w) w.style.transform = 'none';
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [activeArtist.id]);

  useEffect(() => {
    const counterObj = {
      works: 0,
      sold: 0,
      revenue: 0,
    };
    const tween = gsap.to(counterObj, {
      works: artistWorks.length,
      sold: activeArtist.totalSalesCount,
      revenue: activeArtist.totalSalesRevenue,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => {
        if (registeredCountRef.current) {
          registeredCountRef.current.textContent = Math.round(
            counterObj.works
          ).toLocaleString('fa-IR');
        }
        if (soldCountRef.current) {
          soldCountRef.current.textContent = Math.round(
            counterObj.sold
          ).toLocaleString('fa-IR');
        }
        if (revenueCountRef.current) {
          const rev = Math.round(counterObj.revenue);
          revenueCountRef.current.textContent =
            lang === 'fa'
              ? `${rev.toLocaleString('fa-IR')} تومان`
              : `${rev.toLocaleString('en-US')} TOMAN`;
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [
    artistWorks.length,
    activeArtist.totalSalesCount,
    activeArtist.totalSalesRevenue,
    lang,
  ]);

  const handleElasticLineMove = (
    e: React.PointerEvent<HTMLElement>,
    wrapRef: React.RefObject<HTMLDivElement | null>,
    pathRef: React.RefObject<SVGPathElement | null>
  ) => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
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

  const handleElasticLineLeave = (
    pathRef: React.RefObject<SVGPathElement | null>
  ) => {
    const path = pathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 0.75,
      ease: 'elastic.out(1, 0.35)',
      overwrite: 'auto',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPreviewUrl(reader.result);
        setNewArt((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateArtworkInput(newArt);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});
    onAddArtwork(newArt);
    setNewArt({
      ...newArt,
      title: '',
      titleEn: '',
      story: '',
    });
    setAddedBanner(true);
    setTimeout(() => setAddedBanner(false), 4000);
  };

  const startEdit = (art: ArtworkItem) => {
    setEditingId(art.id);
    setEditDraft({
      title: art.title,
      price: art.price,
      story: art.story,
      style: art.style,
    });
  };

  const saveEdit = (artId: string) => {
    if (editDraft.title.trim().length >= 2 && editDraft.price >= 100000) {
      onUpdateArtwork(artId, editDraft);
      setEditingId(null);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="isolated-artist-workspace"
      className="siah-light-surface relative min-h-screen bg-[#050505] text-white pb-24 overflow-hidden select-none"
    >
      {/* Animated WebGL1 "Mesh drift" Blobs Shader Background */}
      <MeshDriftCanvas isDark={isDark} />
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/25" />

      {/* =====================================================================
       * 1. WHISPER-CLEAN ARCHITECTURAL TOP NAVBAR (No Rounded Pills, No Clutter)
       * =================================================================== */}
      <header
        onPointerMove={(e) => handleElasticLineMove(e, navLineWrapRef, navLinePathRef)}
        onPointerLeave={() => handleElasticLineLeave(navLinePathRef)}
        className="sticky top-0 z-30 w-full bg-[#050505]/70 backdrop-blur-xl px-4 md:px-12 h-16 md:h-20 flex items-center mb-8 md:mb-12"
      >
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between gap-3 md:grid md:grid-cols-3">
          {/* Right (Start in RTL): Brand Wordmark «سیاه و سفید» */}
          <div className="justify-self-start shrink-0">
            <button
              type="button"
              onClick={() => onNavigateView('landing')}
              data-testid="workspace-brand-wordmark"
              className="text-start font-black text-base sm:text-xl md:text-2xl text-white hover:opacity-80 transition-opacity cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap"
            >
              {t('سیاه و سفید', 'Siah o Sefid')}
            </button>
          </div>

          {/* Center: Clean Borderless Editorial Link «گالری آثار» */}
          <nav aria-label={t('ناوبری گالری آثار', 'Exhibition Navigation')} className="justify-self-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigateView('gallery')}
              data-testid="workspace-back-gallery-btn"
              className="group relative py-1.5 px-1 text-xs sm:text-sm md:text-base font-medium text-white/85 hover:text-white transition-colors cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap"
            >
              <span>{t('گالری آثار', 'Exhibition Gallery')}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </button>
          </nav>

          {/* Left (End in RTL): ThemeToggle + «خروج از حساب» & «بازگشت به صفحه اصلی ↖» */}
          <div className="justify-self-end flex items-center gap-3 md:gap-5 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                data-testid="workspace-logout-btn"
                className="group relative py-1.5 px-1 text-xs sm:text-sm font-light text-white/60 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap"
              >
                <span>{t('خروج از حساب', 'Logout')}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateView('landing')}
              data-testid="workspace-back-home-btn"
              className="group relative py-1.5 px-1 text-xs sm:text-sm font-light text-white/75 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap"
            >
              <span className="md:hidden">{t('بازگشت ↖', 'Home ↖')}</span>
              <span className="hidden md:inline">{t('بازگشت به صفحه اصلی ↖', 'Back to Main Page ↖')}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </button>
          </div>
        </div>

        {/* Elastic Mouse-Reactive Bottom SVG Hairline */}
        <div
          ref={navLineWrapRef}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[12px] inset-x-0 h-[24px] w-full overflow-visible"
        >
          <svg
            viewBox="0 0 1000 24"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <path
              ref={navLinePathRef}
              d="M 0 12 Q 500 12 1000 12"
              fill="none"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </header>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-14">
        {/* =====================================================================
         * 2. CENTERED STUDIO HEADER WITH <FoldText /> & ELASTIC DIVIDER
         * (Artist Switcher Dropdown & Bracketed Labels Purged)
         * =================================================================== */}
        <div
          onPointerMove={(e) =>
            handleElasticLineMove(e, headerLineWrapRef, headerLinePathRef)
          }
          onPointerLeave={() => handleElasticLineLeave(headerLinePathRef)}
          className="relative text-center mx-auto flex flex-col items-center justify-center space-y-4 pb-10"
        >
          <h1
            key={`studio-title-${activeArtist.id}`}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white text-center mx-auto flex flex-col items-center justify-center w-full"
          >
            <FoldText
              text={t(
                `استودیوی اختصاصی: ${activeArtist.fullName}`,
                `Personal Studio: ${activeArtist.fullName}`
              )}
              splitBy="word"
              foldStyle="paper"
              trigger="mount"
              hoverRefold={true}
              color="#FFFFFF"
              fontWeight={900}
              className="text-center justify-center"
              style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.25 }}
            />
          </h1>

          <p className="text-sm sm:text-base font-light text-white text-center mx-auto">
            {t('نام هنری:', 'Artistic Alias:')} {activeArtist.artisticAlias}
            <span className="mx-3 opacity-50">·</span>
            {t('سبک تخصصی:', 'Primary Style:')}{' '}
            {getStyleLabel(activeArtist.artisticStyle || 'MINIMALISM', lang)}
          </p>

          {/* Elastic Mouse-Reactive SVG String Divider */}
          <div
            ref={headerLineWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[12px] inset-x-0 h-[24px] w-full overflow-visible"
          >
            <svg
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <path
                ref={headerLinePathRef}
                d="M 0 12 Q 500 12 1000 12"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* =====================================================================
         * 3. 4-COLUMN BORDERLESS INTERACTIVE STATS MONOLITHS
         * =================================================================== */}
        <div
          data-testid="studio-stats-monoliths"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-transparent"
        >
          {/* Monolith 1: شناسنامه هنرمند */}
          <div
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            className="group relative bg-transparent rounded-none border-0 py-10 px-6 flex flex-col items-center justify-center text-center"
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
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 100%)',
              }}
              className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-light text-white/65">
                {t('شناسنامه هنرمند', 'Artist Identity')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                <FoldText
                  text={activeArtist.fullName}
                  splitBy="word"
                  foldStyle="paper"
                  trigger="mount"
                  hoverRefold={true}
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                />
              </div>
              <p className="font-mono-archival text-xs text-white/60">
                {activeArtist.email} · {activeArtist.phone}
              </p>
            </div>
          </div>

          {/* Monolith 2: آثار ثبت‌شده */}
          <div
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            className="group relative bg-transparent rounded-none border-0 py-10 px-6 flex flex-col items-center justify-center text-center"
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
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 100%)',
              }}
              className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-light text-white/65">
                {t('آثار ثبت‌شده', 'Registered Works')}
              </span>
              <span
                ref={registeredCountRef}
                className="text-4xl sm:text-5xl font-black text-white tabular-nums leading-none"
              >
                {artistWorks.length.toLocaleString('fa-IR')}
              </span>
              <p className="text-xs font-light text-white/55">
                {t('آثار ثبت‌شده در گالری سیاه و سفید', 'Works registered in Siah o Sefid')}
              </p>
            </div>
          </div>

          {/* Monolith 3: آثار فروخته‌شده */}
          <div
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            className="group relative bg-transparent rounded-none border-0 py-10 px-6 flex flex-col items-center justify-center text-center"
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
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 100%)',
              }}
              className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-light text-white/65">
                {t('آثار فروخته‌شده', 'Sold Works')}
              </span>
              <span
                ref={soldCountRef}
                className="text-4xl sm:text-5xl font-black text-white tabular-nums leading-none"
              >
                {activeArtist.totalSalesCount.toLocaleString('fa-IR')}
              </span>
              <p className="text-xs font-light text-white/55">
                {t('آثار فروخته‌شده به کلکسیونرها', 'Works acquired by collectors')}
              </p>
            </div>
          </div>

          {/* Monolith 4: مجموع عواید فروش */}
          <div
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            className="group relative bg-transparent rounded-none border-0 py-10 px-6 flex flex-col items-center justify-center text-center"
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
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 100%)',
              }}
              className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-light text-white/65">
                {t('مجموع عواید فروش', 'Total Sales Revenue')}
              </span>
              <span
                ref={revenueCountRef}
                className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-tight"
              >
                {formatPrice(activeArtist.totalSalesRevenue)}
              </span>
              <p className="text-xs font-light text-white/55">
                {t('مجموع عواید حاصل از فروش آثار', 'Total studio sales revenue')}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================================
         * MAIN 2-COLUMN STUDIO WORKSPACE
         * Column 1 (5 cols): Submit New Artwork Monolith Form
         * Column 2 (7 cols): Your Registered Artworks Section
         * =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* =================================================================
           * 4. REDESIGNED "SUBMIT NEW ARTWORK" FORM MONOLITH
           * =============================================================== */}
          <div
            data-testid="submit-artwork-monolith"
            className="group/form relative lg:col-span-5 bg-[#050505]/70 backdrop-blur-xl rounded-none border-0 p-7 sm:p-9 space-y-7"
          >
            {/* Top-Right Progressive SVG Perimeter Border Draw on Hover/Focus-Within */}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
            >
              <path
                d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:4800] [stroke-dashoffset:4800] opacity-0 group-hover/form:opacity-100 group-focus-within/form:opacity-100 group-hover/form:[stroke-dashoffset:0] group-focus-within/form:[stroke-dashoffset:0] transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>

            {/* Centered Clean Header + Elastic SVG String Divider */}
            <div
              onPointerMove={(e) =>
                handleElasticLineMove(e, formLineWrapRef, formLinePathRef)
              }
              onPointerLeave={() => handleElasticLineLeave(formLinePathRef)}
              className="relative pb-6 text-center flex flex-col items-center justify-center"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white text-center mx-auto flex flex-col items-center justify-center">
                <FoldText
                  text={t(
                    'ثبت و قیمت‌گذاری اثر هنری جدید',
                    'Register & Price New Artwork'
                  )}
                  splitBy="word"
                  foldStyle="paper"
                  trigger="mount"
                  hoverRefold={true}
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                  style={{ textAlign: 'center', lineHeight: 1.35 }}
                />
              </h2>

              <div
                ref={formLineWrapRef}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[10px] inset-x-0 h-[24px] w-full overflow-visible"
              >
                <svg
                  viewBox="0 0 1000 24"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    ref={formLinePathRef}
                    d="M 0 12 Q 500 12 1000 12"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {addedBanner && (
              <div
                role="status"
                className="p-3.5 bg-white text-[#050505] rounded-none text-xs font-bold text-center"
              >
                {t(
                  'اثر جدید با موفقیت در گالری و شمارنده آرشیو ثبت شد.',
                  'New artwork successfully registered in the exhibition & archive counter.'
                )}
              </div>
            )}

            <form onSubmit={handleCreateArtwork} noValidate className="relative z-10 space-y-6">
              {/* Artwork Title — Bottom-Line Architectural Input */}
              <div className="group relative pt-1">
                <label
                  htmlFor="new-art-title"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    newArt.title.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t('عنوان اثر:', 'Artwork Title:')}
                </label>
                <div className="relative">
                  <input
                    id="new-art-title"
                    type="text"
                    value={newArt.title}
                    onChange={(e) => setNewArt({ ...newArt, title: e.target.value })}
                    placeholder={t(
                      'مثال: منظومه خاکستر شماره ۱۲',
                      'e.g., Ash Constellation No. 12'
                    )}
                    className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-base sm:text-lg focus:outline-none rounded-none placeholder:text-white/25"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
                {formErrors.title && (
                  <p className="mt-1.5 text-xs text-red-400 font-light">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Artistic Style — Interactive Sharp-Cornered Style Tiles (Zero <select>, Zero Static Border) */}
              <div className="space-y-3">
                <span
                  id="new-art-style-label"
                  className="block text-xs font-medium text-white/75"
                >
                  {t('سبک هنری:', 'Artistic Style:')}
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="new-art-style-label"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                >
                  {ART_STYLES.map((st) => {
                    const isSelected = newArt.style === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        data-testid={`studio-style-tile-${st.key}`}
                        onClick={() =>
                          setNewArt({
                            ...newArt,
                            style: st.key as ArtStyle,
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
                        className={`group relative py-2.5 px-2 text-xs rounded-none border-0 transition-all duration-500 cursor-pointer focus:outline-none ${
                          isSelected
                            ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                            : isDark ? 'bg-transparent text-white/75 hover:text-white font-light' : 'bg-transparent !text-[#000000] font-light'
                        }`}
                      >
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

                {/* Custom Style Underline Input when «غیره» is selected */}
                <AnimatePresence initial={false}>
                  {newArt.style === 'OTHER' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden pt-1"
                    >
                      <div className="group relative">
                        <input
                          id="new-art-custom-style"
                          data-testid="studio-custom-style-input"
                          type="text"
                          value={newArt.customStyle || ''}
                          onChange={(e) =>
                            setNewArt({ ...newArt, customStyle: e.target.value })
                          }
                          placeholder={t(
                            'نام سبک هنری خود را بنویسید...',
                            'Type your custom artistic style...'
                          )}
                          aria-label={t(
                            'نام سبک هنری دلخواه',
                            'Custom Artistic Style Name'
                          )}
                          className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-base focus:outline-none rounded-none placeholder:text-white/25"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price (Toman) — Bottom-Line Architectural Input */}
              <div className="group relative pt-1">
                <label
                  htmlFor="new-art-price"
                  className="block text-xs font-medium text-white transition-all duration-300"
                >
                  {t('قیمت اثر (تومان):', 'Valuation (Toman):')}
                </label>
                <div className="relative">
                  <input
                    id="new-art-price"
                    type="number"
                    dir="ltr"
                    step={1000000}
                    value={newArt.price}
                    onChange={(e) =>
                      setNewArt({ ...newArt, price: Number(e.target.value) })
                    }
                    className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-base sm:text-lg font-mono-archival text-left focus:outline-none rounded-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
                {formErrors.price && (
                  <p className="mt-1.5 text-xs text-red-400 font-light">
                    {formErrors.price}
                  </p>
                )}
              </div>

              {/* Dimensions & Medium — 2-Column Bottom-Line Architectural Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group relative pt-1">
                  <label
                    htmlFor="new-art-dims"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      newArt.dimensions.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('ابعاد اثر:', 'Dimensions:')}
                  </label>
                  <div className="relative">
                    <input
                      id="new-art-dims"
                      type="text"
                      dir="ltr"
                      value={newArt.dimensions}
                      onChange={(e) =>
                        setNewArt({ ...newArt, dimensions: e.target.value })
                      }
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-sm font-mono-archival text-left focus:outline-none rounded-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                </div>

                <div className="group relative pt-1">
                  <label
                    htmlFor="new-art-medium"
                    className={`block text-xs font-medium transition-all duration-300 ${
                      newArt.medium.trim().length > 0
                        ? '-translate-y-1 text-white'
                        : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                    }`}
                  >
                    {t('تکنیک و متریال:', 'Medium & Technique:')}
                  </label>
                  <div className="relative">
                    <input
                      id="new-art-medium"
                      type="text"
                      value={newArt.medium}
                      onChange={(e) =>
                        setNewArt({ ...newArt, medium: e.target.value })
                      }
                      className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-sm focus:outline-none rounded-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                </div>
              </div>

              {/* Architectural Image Uploader & Visual Thumbnail Selector (Zero <select>) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/75">
                    {t('تصویر اثر هنری:', 'Artwork Image:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="studio-upload-image-btn"
                    className="group relative py-1.5 px-3 text-xs font-medium text-white/85 hover:text-white bg-transparent border-0 rounded-none cursor-pointer focus:outline-none"
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
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        className="[stroke-dasharray:400] [stroke-dashoffset:400] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      />
                    </svg>
                    <span>
                      {uploadedFileName
                        ? `${t('تصویر بارگذاری‌شده:', 'Uploaded:')} ${uploadedFileName}`
                        : t('بارگذاری تصویر از دستگاه +', 'Upload Image from Device +')}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    aria-label={t('بارگذاری فایل تصویر اثر', 'Upload artwork image file')}
                    className="hidden"
                  />
                </div>

                {/* Live High-Contrast Preview Frame */}
                <div className="relative aspect-[16/9] w-full bg-black overflow-hidden rounded-none">
                  <img
                    src={newArt.image}
                    alt={t('پیش‌نمایش تصویر اثر', 'Selected artwork preview')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover contrast-125 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="pointer-events-none absolute inset-0 border border-white/15" />
                </div>

                {/* Visual Thumbnail Cards of Curated Studio Presets */}
                <div
                  role="radiogroup"
                  aria-label={t(
                    'انتخاب تصویر از آرشیو استودیو',
                    'Select Studio Preset Image'
                  )}
                  className="grid grid-cols-5 gap-2"
                >
                  {STUDIO_SAMPLE_IMAGES.map((img) => {
                    const isSelected = newArt.image === img.url;
                    return (
                      <button
                        key={img.url}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={t(img.labelFa, img.labelEn)}
                        data-testid={`studio-preset-thumb-${img.labelEn.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => {
                          setUploadedPreviewUrl(null);
                          setUploadedFileName('');
                          setNewArt({ ...newArt, image: img.url });
                        }}
                        className={`group relative aspect-square bg-black overflow-hidden rounded-none border-0 cursor-pointer focus:outline-none transition-opacity duration-300 ${
                          isSelected
                            ? 'opacity-100 ring-1 ring-white'
                            : 'opacity-55 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={t(img.labelFa, img.labelEn)}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                        />
                      </button>
                    );
                  })}
                </div>
                {uploadedPreviewUrl && (
                  <p className="text-[11px] font-light text-white/60">
                    {t(
                      'پیش‌نمایش سیاه و سفید با کنتراست بالا از فایل انتخابی شما فعال است.',
                      'High-contrast monochrome preview of your uploaded file is active.'
                    )}
                  </p>
                )}
              </div>

              {/* Story & Curatorial Concept — Bottom-Line Architectural Textarea */}
              <div className="group relative pt-1">
                <label
                  htmlFor="new-art-story"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    newArt.story.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t(
                    'داستان، کانسپت و توضیحات اثر:',
                    'Curatorial Concept & Story:'
                  )}
                </label>
                <div className="relative">
                  <textarea
                    id="new-art-story"
                    rows={3}
                    value={newArt.story}
                    onChange={(e) => setNewArt({ ...newArt, story: e.target.value })}
                    placeholder={t(
                      'روایت خلق اثر، تکنیک و مفهوم نهفته در آن را بنویسید...',
                      'Describe the curatorial concept, technique, and provenance...'
                    )}
                    className="peer w-full bg-transparent border-0 border-b border-white/25 px-0 py-3 text-white text-sm leading-relaxed focus:outline-none rounded-none placeholder:text-white/25 resize-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
                {formErrors.story && (
                  <p className="mt-1.5 text-xs text-red-400 font-light">
                    {formErrors.story}
                  </p>
                )}
              </div>

              {/* Submit Button: Sharp 90deg Corners, Pure White Fill -> Transparent Inversion on Hover */}
              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="studio-submit-artwork-btn"
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`group relative w-full py-4 px-6 rounded-none border text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <span className="!text-inherit">
                    {t(
                      'ثبت اثر در نمایشگاه سیاه و سفید',
                      'Publish Artwork to Exhibition'
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* =================================================================
           * 5. REDESIGNED "YOUR REGISTERED ARTWORKS" SECTION
           * =============================================================== */}
          <div className="lg:col-span-7 space-y-8">
            <div
              onPointerMove={(e) =>
                handleElasticLineMove(e, listLineWrapRef, listLinePathRef)
              }
              onPointerLeave={() => handleElasticLineLeave(listLinePathRef)}
              className="relative pb-6 text-center flex flex-col items-center justify-center"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white text-center mx-auto flex flex-col items-center justify-center">
                <FoldText
                  text={t(
                    'آثار ثبت‌شده شما در نمایشگاه',
                    'Your Registered Exhibition Works'
                  )}
                  splitBy="word"
                  foldStyle="paper"
                  trigger="mount"
                  hoverRefold={true}
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                  style={{ textAlign: 'center', lineHeight: 1.35 }}
                />
              </h2>

              <div
                ref={listLineWrapRef}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[10px] inset-x-0 h-[24px] w-full overflow-visible"
              >
                <svg
                  viewBox="0 0 1000 24"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    ref={listLinePathRef}
                    d="M 0 12 Q 500 12 1000 12"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {artistWorks.length === 0 ? (
              <div
                data-testid="studio-empty-artworks"
                className="group relative p-14 bg-transparent rounded-none border-0 text-center flex flex-col items-center justify-center space-y-3"
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
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    className="[stroke-dasharray:1800] [stroke-dashoffset:1800] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </svg>
                <p className="text-sm sm:text-base font-light text-white/70 max-w-md leading-relaxed">
                  {t(
                    'هنوز اثری برای این استودیو ثبت نشده است. از فرم مقابل نخستین اثر خود را به آرشیو نمایشگاه اضافه کنید.',
                    'No artworks registered in this studio yet. Use the form opposite to publish your first work.'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {artistWorks.map((art) => {
                  const isEditing = editingId === art.id;
                  return (
                    <article
                      key={art.id}
                      data-testid={`studio-artwork-card-${art.id}`}
                      className="group relative bg-[#050505]/70 backdrop-blur-xl rounded-none border-0 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
                    >
                      {/* Top-Right Progressive SVG Perimeter Border Draw on Hover */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
                      >
                        <path
                          d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.9)"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                          className="[stroke-dasharray:3200] [stroke-dashoffset:3200] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                      </svg>

                      {/* Large Aspect-Ratio Image with Subtle Hover Scale */}
                      <div className="sm:col-span-4 aspect-[4/3] bg-black overflow-hidden rounded-none">
                        <img
                          src={art.image}
                          alt={t(art.title, art.titleEn)}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                      </div>

                      <div className="relative z-10 sm:col-span-8 space-y-4">
                        <div className="flex items-center justify-between text-xs font-light text-white/60">
                          <span>
                            {art.accessionCode} ·{' '}
                            {art.styleLabel || getStyleLabel(art.style, lang)}
                          </span>
                          <span
                            className={
                              art.sold
                                ? 'text-white/50 font-medium'
                                : 'text-white font-medium'
                            }
                          >
                            {art.sold
                              ? t('فروخته شد', 'SOLD')
                              : t('موجود در گالری', 'Available in Gallery')}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-5 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="relative">
                                <label
                                  htmlFor={`edit-title-${art.id}`}
                                  className="block text-[11px] font-light text-white/65 mb-1"
                                >
                                  {t('عنوان اثر:', 'Title:')}
                                </label>
                                <input
                                  id={`edit-title-${art.id}`}
                                  type="text"
                                  aria-label={t('ویرایش عنوان اثر', 'Edit artwork title')}
                                  value={editDraft.title}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      title: e.target.value,
                                    })
                                  }
                                  className="peer w-full bg-transparent border-0 border-b border-white/30 px-0 py-2 text-white text-sm focus:outline-none rounded-none"
                                />
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                />
                              </div>

                              <div className="relative">
                                <label
                                  htmlFor={`edit-price-${art.id}`}
                                  className="block text-[11px] font-light text-white/65 mb-1"
                                >
                                  {t('قیمت اثر (تومان):', 'Price (Toman):')}
                                </label>
                                <input
                                  id={`edit-price-${art.id}`}
                                  type="number"
                                  dir="ltr"
                                  aria-label={t('ویرایش قیمت اثر', 'Edit artwork price')}
                                  value={editDraft.price}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      price: Number(e.target.value),
                                    })
                                  }
                                  className="peer w-full bg-transparent border-0 border-b border-white/30 px-0 py-2 text-white text-sm font-mono-archival text-left focus:outline-none rounded-none"
                                />
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                />
                              </div>
                            </div>

                            <div className="relative">
                              <label
                                htmlFor={`edit-story-${art.id}`}
                                className="block text-[11px] font-light text-white/65 mb-1"
                              >
                                {t('داستان و توضیحات اثر:', 'Story & Concept:')}
                              </label>
                              <textarea
                                id={`edit-story-${art.id}`}
                                rows={2}
                                aria-label={t('ویرایش توضیحات اثر', 'Edit artwork story')}
                                value={editDraft.story}
                                onChange={(e) =>
                                  setEditDraft({
                                    ...editDraft,
                                    story: e.target.value,
                                  })
                                }
                                className="peer w-full bg-transparent border-0 border-b border-white/30 px-0 py-2 text-white text-xs leading-relaxed focus:outline-none rounded-none resize-none"
                              />
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                              />
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => saveEdit(art.id)}
                                className="px-5 py-2 rounded-none bg-white text-[#050505] hover:bg-transparent hover:text-white border border-white text-xs font-semibold transition-all duration-300 cursor-pointer"
                              >
                                {t('ذخیره تغییرات', 'Save Changes')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 rounded-none bg-transparent text-white/70 hover:text-white border-0 text-xs font-light cursor-pointer"
                              >
                                {t('انصراف', 'Cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg sm:text-xl font-black text-white">
                              {t(art.title, art.titleEn)}
                            </h3>
                            <p className="text-xs sm:text-sm font-light text-white/70 line-clamp-2 leading-relaxed">
                              {art.story}
                            </p>
                            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                              <span className="text-base sm:text-lg font-black text-white tabular-nums">
                                {formatPrice(art.price)}
                              </span>
                              <div className="flex items-center gap-5">
                                <button
                                  type="button"
                                  onClick={() => startEdit(art)}
                                  className="py-1 px-0 bg-transparent border-0 rounded-none text-xs font-medium text-white/75 hover:text-white border-b border-transparent hover:border-white transition-all cursor-pointer"
                                >
                                  {t('ویرایش اثر و قیمت', 'Edit Work & Price')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteArtwork(art.id)}
                                  aria-label={t(
                                    `حذف اثر ${art.title}`,
                                    `Delete ${art.titleEn}`
                                  )}
                                  className="py-1 px-0 bg-transparent border-0 rounded-none text-xs font-light text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  {t('حذف اثر ×', 'Delete ×')}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

