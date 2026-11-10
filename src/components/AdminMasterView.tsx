import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import {
  PlatformUser,
  ArtworkItem,
  WalletTransaction,
  AppView,
} from '../data/siahSefidData';
import { getStyleLabel } from '../utils/siahSefidLogic';
import { usePreferences } from '../context/PreferencesContext';
import { MeshDriftCanvas } from './MeshDriftCanvas';
import FoldText from './FoldText';
import { ThemeToggle } from './ui/theme-toggle';

interface AdminMasterViewProps {
  users: PlatformUser[];
  artworks: ArtworkItem[];
  transactions: WalletTransaction[];
  metrics: {
    totalMembers: number;
    activeArtists: number;
    curatedArtworks: number;
    availableArtworks: number;
    soldArtworks: number;
    totalWalletBalance: number;
  };
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onToggleArtworkFeatured: (artworkId: string) => void;
  onDeleteArtwork: (artworkId: string) => void;
  onNavigateView: (view: AppView) => void;
}

type AdminActiveTab = 'USERS' | 'ARTWORKS';

export const AdminMasterView: React.FC<AdminMasterViewProps> = ({
  users,
  artworks,
  metrics,
  onToggleUserStatus,
  onDeleteUser,
  onToggleArtworkFeatured,
  onDeleteArtwork,
  onNavigateView,
}) => {
  const { lang, isRtl, isDark, toggleTheme, t, formatPrice } = usePreferences();

  const [activeTab, setActiveTab] = useState<AdminActiveTab>('USERS');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ARTIST' | 'COLLECTOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Elastic SVG String Divider Refs
  const navLineWrapRef = useRef<HTMLDivElement | null>(null);
  const navLinePathRef = useRef<SVGPathElement | null>(null);
  const headerLineWrapRef = useRef<HTMLDivElement | null>(null);
  const headerLinePathRef = useRef<SVGPathElement | null>(null);
  const controlLineWrapRef = useRef<HTMLDivElement | null>(null);
  const controlLinePathRef = useRef<SVGPathElement | null>(null);

  // Animated Persian Numeral Counters for the 4 Borderless Monochrome Monoliths
  const membersCountRef = useRef<HTMLSpanElement | null>(null);
  const artistsCountRef = useRef<HTMLSpanElement | null>(null);
  const artworksCountRef = useRef<HTMLSpanElement | null>(null);
  const liquidityCountRef = useRef<HTMLSpanElement | null>(null);

  const totalSalesVolume = useMemo(
    () =>
      artworks
        .filter((a) => a.sold)
        .reduce((sum, a) => sum + a.price, 0),
    [artworks]
  );

  // Combined platform liquidity + transaction volume
  const totalLiquidityAndVolume = metrics.totalWalletBalance + totalSalesVolume;

  useEffect(() => {
    const wraps = [
      navLineWrapRef.current,
      headerLineWrapRef.current,
      controlLineWrapRef.current,
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
  }, []);

  // GSAP Persian Numeral Counter Animation for 4 Platform Metrics
  useEffect(() => {
    const counterObj = {
      members: 0,
      artists: 0,
      artworksCount: 0,
      liquidity: 0,
    };

    const tween = gsap.to(counterObj, {
      members: metrics.totalMembers,
      artists: metrics.activeArtists,
      artworksCount: metrics.curatedArtworks,
      liquidity: totalLiquidityAndVolume,
      duration: 1.15,
      ease: 'power3.out',
      onUpdate: () => {
        if (membersCountRef.current) {
          membersCountRef.current.textContent =
            lang === 'fa'
              ? Math.round(counterObj.members).toLocaleString('fa-IR')
              : Math.round(counterObj.members).toLocaleString('en-US');
        }
        if (artistsCountRef.current) {
          artistsCountRef.current.textContent =
            lang === 'fa'
              ? Math.round(counterObj.artists).toLocaleString('fa-IR')
              : Math.round(counterObj.artists).toLocaleString('en-US');
        }
        if (artworksCountRef.current) {
          artworksCountRef.current.textContent =
            lang === 'fa'
              ? Math.round(counterObj.artworksCount).toLocaleString('fa-IR')
              : Math.round(counterObj.artworksCount).toLocaleString('en-US');
        }
        if (liquidityCountRef.current) {
          const liq = Math.round(counterObj.liquidity);
          liquidityCountRef.current.textContent =
            lang === 'fa'
              ? `${liq.toLocaleString('fa-IR')} تومان`
              : `${liq.toLocaleString('en-US')} TOMAN`;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [
    metrics.totalMembers,
    metrics.activeArtists,
    metrics.curatedArtworks,
    totalLiquidityAndVolume,
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
    if (rect.width <= 0) return;
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const qx = xRatio * 1000;
    const deltaY = Math.max(
      -20,
      Math.min(20, (e.clientY - (rect.top + rect.height / 2)) * 0.65)
    );
    const qy = 12 + deltaY;
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${qx.toFixed(1)} ${qy.toFixed(1)} 1000 12` },
      duration: 0.18,
      ease: 'power2.out',
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
      duration: 1.15,
      ease: 'elastic.out(1.2, 0.25)',
      overwrite: 'auto',
    });
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.role !== 'ADMIN')
      .filter((u) => (roleFilter === 'ALL' ? true : u.role === roleFilter))
      .filter((u) => {
        if (!normalizedQuery) return true;
        return (
          u.fullName.toLowerCase().includes(normalizedQuery) ||
          (u.artisticAlias &&
            u.artisticAlias.toLowerCase().includes(normalizedQuery)) ||
          u.email.toLowerCase().includes(normalizedQuery) ||
          u.phone.toLowerCase().includes(normalizedQuery)
        );
      });
  }, [users, roleFilter, normalizedQuery]);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      if (!normalizedQuery) return true;
      return (
        art.title.toLowerCase().includes(normalizedQuery) ||
        art.titleEn.toLowerCase().includes(normalizedQuery) ||
        art.artistName.toLowerCase().includes(normalizedQuery) ||
        art.artistAlias.toLowerCase().includes(normalizedQuery) ||
        art.accessionCode.toLowerCase().includes(normalizedQuery) ||
        art.styleLabel.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [artworks, normalizedQuery]);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="isolated-admin-workspace"
      className="siah-light-surface relative min-h-screen bg-[#050505] text-white pb-24 overflow-hidden select-none"
    >
      {/* Animated WebGL1 "Mesh drift" Blobs Shader Background */}
      <MeshDriftCanvas isDark={isDark} />
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/25" />

      {/* =====================================================================
       * 1. UNIFIED MINIMAL TOP NAVBAR (Zero Rounded Pills, Zero Brackets)
       * Right: «سیاه و سفید» | Center: «گالری آثار» | Left: «بازگشت به صفحه اصلی ↖»
       * =================================================================== */}
      <header
        onPointerMove={(e) => handleElasticLineMove(e, navLineWrapRef, navLinePathRef)}
        onPointerLeave={() => handleElasticLineLeave(navLinePathRef)}
        className="sticky top-0 z-30 w-full bg-[#050505]/75 backdrop-blur-xl px-4 md:px-12 h-16 md:h-20 flex items-center mb-8 md:mb-12"
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
          <nav
            aria-label={t('ناوبری گالری آثار', 'Exhibition Navigation')}
            className="justify-self-center shrink-0"
          >
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

          {/* Left (End in RTL): ThemeToggle + «بازگشت به صفحه اصلی ↖» */}
          <div className="justify-self-end flex items-center gap-3 md:gap-5 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button
              type="button"
              onClick={() => onNavigateView('landing')}
              data-testid="workspace-back-home-btn"
              className="group relative py-1.5 px-1 text-xs sm:text-sm font-light text-white/75 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap"
            >
              <span className="md:hidden">{t('بازگشت ↖', 'Home ↖')}</span>
              <span className="hidden md:inline">
                {t('بازگشت به صفحه اصلی ↖', 'Back to Main Page ↖')}
              </span>
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

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 space-y-14">
        {/* ===================================================================
         * 2. CENTERED <FoldText /> HEADER & ELASTIC SVG DIVIDER
         * ================================================================= */}
        <div
          onPointerMove={(e) =>
            handleElasticLineMove(e, headerLineWrapRef, headerLinePathRef)
          }
          onPointerLeave={() => handleElasticLineLeave(headerLinePathRef)}
          className="relative text-center mx-auto flex flex-col items-center justify-center space-y-3 pb-10"
        >
          <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] text-white text-center mx-auto">
            <FoldText
              text={t(
                'کنسول مدیریت ارشد «سیاه و سفید»',
                'Master Admin Console — Siah o Sefid'
              )}
              splitBy="word"
              foldStyle="paper"
              trigger="mount"
              hoverRefold={false}
              stagger={0.07}
              duration={0.9}
              color="#FFFFFF"
              className="justify-center text-center mx-auto"
            />
          </h1>

          <p className="text-sm md:text-base font-light text-white/75 max-w-2xl mx-auto leading-relaxed">
            {t(
              'پایش زنده شاخص‌های پلتفرم، مدیریت اعضا و هنرمندان، و کیوریشن آثار برگزیده گالری.',
              'Live platform telemetry, member and artist governance, and featured gallery curation.'
            )}
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
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* ===================================================================
         * 3. 4-COLUMN PLATFORM METRICS (Borderless Monochrome Monoliths)
         * ================================================================= */}
        <section
          aria-label={t('شاخص‌های کلان پلتفرم', 'Platform Macro Metrics')}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {/* Metric 1: کل اعضای پلتفرم */}
          <div
            data-testid="admin-metric-members"
            className="group relative py-8 px-6 text-center flex flex-col items-center justify-center bg-transparent border-0 rounded-none transition-colors duration-500 hover:bg-white/[0.03]"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <rect
                x="0.5"
                y="0.5"
                width="calc(100% - 1px)"
                height="calc(100% - 1px)"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                className="[stroke-dasharray:2400] [stroke-dashoffset:2400] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <span className="text-xs md:text-sm font-light text-white/65 mb-3">
              {t('کل اعضای پلتفرم', 'Total Platform Members')}
            </span>
            <span
              ref={membersCountRef}
              className="font-black text-4xl md:text-5xl text-white tabular-nums leading-none"
            >
              {lang === 'fa'
                ? metrics.totalMembers.toLocaleString('fa-IR')
                : metrics.totalMembers.toLocaleString('en-US')}
            </span>
          </div>

          {/* Metric 2: هنرمندان فعال */}
          <div
            data-testid="admin-metric-artists"
            className="group relative py-8 px-6 text-center flex flex-col items-center justify-center bg-transparent border-0 rounded-none transition-colors duration-500 hover:bg-white/[0.03]"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <rect
                x="0.5"
                y="0.5"
                width="calc(100% - 1px)"
                height="calc(100% - 1px)"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                className="[stroke-dasharray:2400] [stroke-dashoffset:2400] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <span className="text-xs md:text-sm font-light text-white/65 mb-3">
              {t('هنرمندان فعال', 'Active Artists')}
            </span>
            <span
              ref={artistsCountRef}
              className="font-black text-4xl md:text-5xl text-white tabular-nums leading-none"
            >
              {lang === 'fa'
                ? metrics.activeArtists.toLocaleString('fa-IR')
                : metrics.activeArtists.toLocaleString('en-US')}
            </span>
          </div>

          {/* Metric 3: آثار ثبت‌شده در آرشیو */}
          <div
            data-testid="admin-metric-artworks"
            className="group relative py-8 px-6 text-center flex flex-col items-center justify-center bg-transparent border-0 rounded-none transition-colors duration-500 hover:bg-white/[0.03]"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <rect
                x="0.5"
                y="0.5"
                width="calc(100% - 1px)"
                height="calc(100% - 1px)"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                className="[stroke-dasharray:2400] [stroke-dashoffset:2400] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <span className="text-xs md:text-sm font-light text-white/65 mb-3">
              {t('آثار ثبت‌شده در آرشیو', 'Archived Artworks')}
            </span>
            <span
              ref={artworksCountRef}
              className="font-black text-4xl md:text-5xl text-white tabular-nums leading-none"
            >
              {lang === 'fa'
                ? metrics.curatedArtworks.toLocaleString('fa-IR')
                : metrics.curatedArtworks.toLocaleString('en-US')}
            </span>
          </div>

          {/* Metric 4: نقدینگی و حجم معاملات */}
          <div
            data-testid="admin-metric-liquidity"
            className="group relative py-8 px-6 text-center flex flex-col items-center justify-center bg-transparent border-0 rounded-none transition-colors duration-500 hover:bg-white/[0.03]"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <rect
                x="0.5"
                y="0.5"
                width="calc(100% - 1px)"
                height="calc(100% - 1px)"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                className="[stroke-dasharray:2400] [stroke-dashoffset:2400] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <span className="text-xs md:text-sm font-light text-white/65 mb-3">
              {t('نقدینگی و حجم معاملات', 'Liquidity & Trade Volume')}
            </span>
            <span
              ref={liquidityCountRef}
              className="font-black text-2xl sm:text-3xl md:text-4xl text-white tabular-nums leading-none"
            >
              {formatPrice(totalLiquidityAndVolume)}
            </span>
          </div>
        </section>

        {/* ===================================================================
         * 4. CENTERED ARCHITECTURAL TAB SWITCHER + BOTTOM-LINE SEARCH INPUT
         * ================================================================= */}
        <section
          onPointerMove={(e) =>
            handleElasticLineMove(e, controlLineWrapRef, controlLinePathRef)
          }
          onPointerLeave={() => handleElasticLineLeave(controlLinePathRef)}
          className="relative pb-8 space-y-8"
        >
          {/* Centered Architectural Tab Switcher: مدیریت اعضا و هنرمندان | مدیریت آثار گالری */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'USERS'}
              onClick={() => setActiveTab('USERS')}
              data-testid="admin-tab-users"
              style={{
                backgroundColor: activeTab === 'USERS'
                  ? isDark ? '#ffffff' : '#131313'
                  : 'transparent',
                color: activeTab === 'USERS'
                  ? isDark ? '#050505' : '#fcfcfd'
                  : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
              }}
              className={`group relative w-full sm:w-auto min-w-[240px] px-8 py-4 text-sm md:text-base font-bold transition-colors duration-300 cursor-pointer rounded-none border-0 focus:outline-none ${
                activeTab === 'USERS'
                  ? isDark ? '!bg-white !text-[#050505]' : '!bg-[#131313] !text-[#fcfcfd]'
                  : isDark ? 'bg-transparent text-white/75 hover:text-white hover:bg-white/[0.04]' : 'bg-transparent !text-[#000000] hover:bg-black/[0.04]'
              }`}
            >
              {activeTab !== 'USERS' && (
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="calc(100% - 1px)"
                    height="calc(100% - 1px)"
                    fill="none"
                    stroke={isDark ? '#FFFFFF' : '#131313'}
                    strokeWidth="1"
                    className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </svg>
              )}
              <span className="!text-inherit">
                {t('مدیریت اعضا و هنرمندان', 'Members & Artists Governance')}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ARTWORKS'}
              onClick={() => setActiveTab('ARTWORKS')}
              data-testid="admin-tab-artworks"
              style={{
                backgroundColor: activeTab === 'ARTWORKS'
                  ? isDark ? '#ffffff' : '#131313'
                  : 'transparent',
                color: activeTab === 'ARTWORKS'
                  ? isDark ? '#050505' : '#fcfcfd'
                  : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
              }}
              className={`group relative w-full sm:w-auto min-w-[240px] px-8 py-4 text-sm md:text-base font-bold transition-colors duration-300 cursor-pointer rounded-none border-0 focus:outline-none ${
                activeTab === 'ARTWORKS'
                  ? isDark ? '!bg-white !text-[#050505]' : '!bg-[#131313] !text-[#fcfcfd]'
                  : isDark ? 'bg-transparent text-white/75 hover:text-white hover:bg-white/[0.04]' : 'bg-transparent !text-[#000000] hover:bg-black/[0.04]'
              }`}
            >
              {activeTab !== 'ARTWORKS' && (
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="calc(100% - 1px)"
                    height="calc(100% - 1px)"
                    fill="none"
                    stroke={isDark ? '#FFFFFF' : '#131313'}
                    strokeWidth="1"
                    className="[stroke-dasharray:1200] [stroke-dashoffset:1200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </svg>
              )}
              <span className="!text-inherit">
                {t('مدیریت آثار گالری', 'Gallery Artworks Curatorship')}
              </span>
            </button>
          </div>

          {/* Search Line + Sub-Role Filter (When on Users Tab) */}
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6">
            <div className="flex-1">
              <label
                htmlFor="admin-search-input"
                className="block text-xs font-light text-white/60 mb-2"
              >
                {t('جستجو در اعضا / آثار:', 'Search Members / Artworks:')}
              </label>
              <input
                id="admin-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'جستجو در اعضا / آثار...',
                  'Search members, artists, or artworks...'
                )}
                data-testid="admin-search-input"
                className="w-full bg-transparent border-0 border-b border-white/30 focus:border-white py-2.5 text-sm md:text-base text-white placeholder:text-white/35 focus:outline-none transition-colors rounded-none"
              />
            </div>

            {activeTab === 'USERS' && (
              <div className="flex items-center gap-2 shrink-0">
                {(
                  [
                    { key: 'ALL', labelFa: 'همه نقش‌ها', labelEn: 'All Roles' },
                    { key: 'ARTIST', labelFa: 'هنرمندان', labelEn: 'Artists' },
                    {
                      key: 'COLLECTOR',
                      labelFa: 'هنردوستان',
                      labelEn: 'Collectors',
                    },
                  ] as const
                ).map((tab) => {
                  const active = roleFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setRoleFilter(tab.key)}
                      data-testid={`admin-role-filter-${tab.key.toLowerCase()}`}
                      style={{
                        backgroundColor: active
                          ? isDark ? '#ffffff' : '#131313'
                          : 'transparent',
                        color: active
                          ? isDark ? '#050505' : '#fcfcfd'
                          : isDark ? 'rgba(255,255,255,0.65)' : '#000000',
                      }}
                      className={`group relative px-4 py-2 text-xs font-medium transition-colors duration-300 cursor-pointer rounded-none border-0 focus:outline-none ${
                        active
                          ? isDark ? '!bg-white !text-[#050505] font-bold' : '!bg-[#131313] !text-[#fcfcfd] font-bold'
                          : isDark ? 'bg-transparent text-white/65 hover:text-white' : 'bg-transparent !text-[#000000]'
                      }`}
                    >
                      {!active && (
                        <svg
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            width="calc(100% - 1px)"
                            height="calc(100% - 1px)"
                            fill="none"
                            stroke={isDark ? '#FFFFFF' : '#131313'}
                            strokeWidth="1"
                            className="[stroke-dasharray:600] [stroke-dashoffset:600] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          />
                        </svg>
                      )}
                      <span className="!text-inherit">{t(tab.labelFa, tab.labelEn)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Elastic Mouse-Reactive SVG String Divider */}
          <div
            ref={controlLineWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[12px] inset-x-0 h-[24px] w-full overflow-visible"
          >
            <svg
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <path
                ref={controlLinePathRef}
                d="M 0 12 Q 500 12 1000 12"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </section>

        {/* ===================================================================
         * 5. PURE MONOCHROME ARCHITECTURAL ROWS (Zero Red/Green/Navy/Icons)
         * ================================================================= */}
        {activeTab === 'USERS' ? (
          <section
            aria-label={t('فهرست اعضا و هنرمندان', 'Members & Artists Directory')}
            className="space-y-0"
          >
            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-sm font-light text-white/50 border-b border-white/10">
                {t(
                  'هیچ کاربری مطابق با جستجوی شما یافت نشد.',
                  'No members matched your search criteria.'
                )}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSuspended = user.status === 'SUSPENDED';
                return (
                  <div
                    key={user.id}
                    data-testid={`admin-user-row-${user.id}`}
                    className="group relative py-6 px-4 md:px-6 border-b border-white/10 bg-transparent hover:bg-white/[0.025] transition-colors duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-none"
                  >
                    {/* Top-right 1px SVG perimeter border highlight on hover */}
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="calc(100% - 1px)"
                        height="calc(100% - 1px)"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        className="[stroke-dasharray:3200] [stroke-dashoffset:3200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      />
                    </svg>

                    {/* Primary Identity & Role Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 min-w-0">
                      <div className="min-w-[200px]">
                        <p
                          className={`font-bold text-base md:text-lg ${
                            isSuspended
                              ? 'text-white/40 line-through'
                              : 'text-white'
                          }`}
                        >
                          {user.fullName}
                        </p>
                        {user.artisticAlias && (
                          <p className="text-xs font-light text-white/60 mt-0.5">
                            {t('نام هنری:', 'Alias:')} {user.artisticAlias}
                          </p>
                        )}
                      </div>

                      {/* Role & Style */}
                      <div className="min-w-[150px]">
                        <span className="text-xs font-medium text-white/80 block">
                          {user.role === 'ARTIST'
                            ? t('نقش: هنرمند', 'Role: Artist')
                            : t('نقش: هنردوست', 'Role: Collector')}
                        </span>
                        {user.artisticStyle && (
                          <span className="text-xs font-light text-white/55 block mt-0.5">
                            {t('سبک:', 'Style:')}{' '}
                            {getStyleLabel(user.artisticStyle, lang)}
                          </span>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="min-w-[190px] text-xs font-light text-white/65 space-y-0.5">
                        <p className="truncate">{user.email}</p>
                        <p className="tabular-nums">{user.phone}</p>
                      </div>
                    </div>

                    {/* Wallet Balance + Pure Monochrome Status + Architectural Action Triggers */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 sm:gap-8 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                      {/* Wallet Balance */}
                      <div className="text-start lg:text-end min-w-[140px]">
                        <span className="block text-[11px] font-light text-white/50">
                          {t('موجودی کیف پول:', 'Wallet Balance:')}
                        </span>
                        <span className="font-bold text-sm md:text-base text-white tabular-nums">
                          {formatPrice(user.walletBalance)}
                        </span>
                      </div>

                      {/* Pure Monochrome Status Indicator (فعال with 4px solid white square dot OR معلق in muted line-through) */}
                      <div className="min-w-[75px] flex items-center gap-2">
                        {!isSuspended ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="w-1 h-1 bg-white rounded-none inline-block shrink-0"
                            />
                            <span className="text-xs font-bold text-white">
                              {t('فعال', 'Active')}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-light text-white/40 line-through">
                            {t('معلق', 'Suspended')}
                          </span>
                        )}
                      </div>

                      {/* Monochrome Sharp-Cornered Action Triggers (Zero Colored Icons) */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleUserStatus(user.id)}
                          data-testid={`admin-toggle-user-${user.id}`}
                          className="text-xs font-medium text-white/70 hover:bg-white hover:text-[#050505] transition-colors duration-300 px-3 py-1.5 rounded-none border-0 bg-transparent cursor-pointer focus:outline-none whitespace-nowrap"
                        >
                          {isSuspended
                            ? t('فعال‌سازی', 'Activate')
                            : t('تعلیق', 'Suspend')}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.id)}
                          data-testid={`admin-delete-user-${user.id}`}
                          className="text-xs font-medium text-white/70 hover:bg-white hover:text-[#050505] transition-colors duration-300 px-3 py-1.5 rounded-none border-0 bg-transparent cursor-pointer focus:outline-none whitespace-nowrap"
                        >
                          {t('حذف', 'Remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        ) : (
          <section
            aria-label={t('فهرست آثار گالری', 'Exhibition Artworks Directory')}
            className="space-y-0"
          >
            {filteredArtworks.length === 0 ? (
              <div className="py-16 text-center text-sm font-light text-white/50 border-b border-white/10">
                {t(
                  'هیچ اثری مطابق با جستجوی شما یافت نشد.',
                  'No artworks matched your search criteria.'
                )}
              </div>
            ) : (
              filteredArtworks.map((art) => (
                <div
                  key={art.id}
                  data-testid={`admin-artwork-row-${art.id}`}
                  className="group relative py-6 px-4 md:px-6 border-b border-white/10 bg-transparent hover:bg-white/[0.025] transition-colors duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-none"
                >
                  {/* Top-right 1px SVG perimeter border highlight on hover */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 w-full h-full overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="calc(100% - 1px)"
                      height="calc(100% - 1px)"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      className="[stroke-dasharray:3200] [stroke-dashoffset:3200] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </svg>

                  {/* Artwork Thumbnail + Title & Artist Info (Zero Rounded Corners, Zero Brackets) */}
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className="w-14 h-16 md:w-16 md:h-20 bg-white/5 shrink-0 overflow-hidden rounded-none">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover rounded-none"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-base md:text-lg text-white truncate">
                        {lang === 'fa' ? art.title : art.titleEn}
                      </p>
                      <p className="text-xs font-light text-white/65 truncate">
                        {art.artistName} — {getStyleLabel(art.style, lang)}
                      </p>
                      <p className="text-[11px] font-light text-white/45">
                        {t('شناسه آرشیو:', 'Accession:')} {art.accessionCode} ·{' '}
                        {art.dimensions}
                      </p>
                    </div>
                  </div>

                  {/* Valuation + Pure Monochrome Status + Architectural Action Triggers */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 sm:gap-8 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    {/* Price */}
                    <div className="text-start lg:text-end min-w-[140px]">
                      <span className="block text-[11px] font-light text-white/50">
                        {t('ارزش اثر:', 'Valuation:')}
                      </span>
                      <span className="font-bold text-sm md:text-base text-white tabular-nums">
                        {formatPrice(art.price)}
                      </span>
                    </div>

                    {/* Availability Status Indicator (Pure White Typography) */}
                    <div className="min-w-[95px] flex items-center gap-2">
                      {!art.sold ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="w-1 h-1 bg-white rounded-none inline-block shrink-0"
                          />
                          <span className="text-xs font-bold text-white">
                            {t('فعال', 'Available')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-light text-white/40 line-through">
                          {t('واگذارشده', 'Acquired')}
                        </span>
                      )}
                    </div>

                    {/* Monochrome Sharp-Cornered Action Triggers (Zero Colored Icons) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleArtworkFeatured(art.id)}
                        data-testid={`admin-feature-art-${art.id}`}
                        className={`text-xs font-medium transition-colors duration-300 px-3 py-1.5 rounded-none border-0 cursor-pointer focus:outline-none whitespace-nowrap ${
                          art.featured
                            ? 'bg-white text-[#050505] font-bold'
                            : 'bg-transparent text-white/70 hover:bg-white hover:text-[#050505]'
                        }`}
                      >
                        {art.featured
                          ? t('برگزیده در لندینگ ✓', 'Featured on Landing ✓')
                          : t('برگزیده در لندینگ', 'Feature on Landing')}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteArtwork(art.id)}
                        data-testid={`admin-delete-art-${art.id}`}
                        className="text-xs font-medium text-white/70 hover:bg-white hover:text-[#050505] transition-colors duration-300 px-3 py-1.5 rounded-none border-0 bg-transparent cursor-pointer focus:outline-none whitespace-nowrap"
                      >
                        {t('حذف', 'Remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
};
