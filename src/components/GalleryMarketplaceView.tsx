import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ArtworkItem,
  ArtStyle,
  ART_STYLES,
  PlatformUser,
} from '../data/siahSefidData';
import {
  PriceFilterKey,
  filterArtworks,
  evaluateArtworkPurchase,
  getStyleLabel,
} from '../utils/siahSefidLogic';
import { usePreferences } from '../context/PreferencesContext';
import { MeshDriftCanvas } from './MeshDriftCanvas';
import FoldText from './FoldText';

interface GalleryMarketplaceViewProps {
  artworks: ArtworkItem[];
  artists: PlatformUser[];
  activeCollector: PlatformUser;
  selectedArtwork: ArtworkItem | null;
  onSelectArtwork: (art: ArtworkItem | null) => void;
  onPurchaseArtwork: (artwork: ArtworkItem) => void;
  onQuickTopUp: (amount: number) => void;
}

const PRICE_FILTERS: { key: PriceFilterKey; labelFa: string; labelEn: string }[] = [
  { key: 'ALL', labelFa: 'همه بازه‌ها', labelEn: 'All Prices' },
  { key: 'UNDER_45M', labelFa: 'زیر ۴۵ میلیون', labelEn: 'Under 45M' },
  { key: '45M_TO_70M', labelFa: '۴۵ تا ۷۰ میلیون', labelEn: '45M – 70M' },
  { key: 'OVER_70M', labelFa: 'بالای ۷۰ میلیون', labelEn: 'Over 70M' },
];

/**
 * Reusable Sharp-Cornered Architectural Filter Tile
 * - Zero border at rest (border-0 rounded-none)
 * - Top-right 1px SVG perimeter border draw on hover when unselected
 * - Solid white inversion (bg-white text-[#050505]) when active
 */
interface ArchitecturalTileButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
  ariaLabel?: string;
}

const ArchitecturalTileButton: React.FC<ArchitecturalTileButtonProps> = ({
  active,
  onClick,
  children,
  testId,
  ariaLabel,
}) => {
  const { isDark } = usePreferences();
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{
        backgroundColor: active
          ? isDark ? '#ffffff' : '#131313'
          : 'transparent',
        color: active
          ? isDark ? '#050505' : '#fcfcfd'
          : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
      }}
      className={`group relative px-3 py-1.5 rounded-none border-0 text-xs transition-colors duration-300 cursor-pointer focus:outline-none whitespace-nowrap ${
        active
          ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
          : isDark ? 'bg-transparent text-white/75 hover:text-white font-light' : 'bg-transparent !text-[#000000] font-light'
      }`}
    >
      {!active && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-10 w-full h-full overflow-visible"
        >
          <path
            d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.85)' : '#131313'}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="[stroke-dasharray:460] [stroke-dashoffset:460] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </svg>
      )}
      <span className="relative z-20 !text-inherit">{children}</span>
    </button>
  );
};

export const GalleryMarketplaceView: React.FC<GalleryMarketplaceViewProps> = ({
  artworks,
  artists,
  activeCollector,
  selectedArtwork,
  onSelectArtwork,
  onPurchaseArtwork,
  onQuickTopUp,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | 'ALL'>('ALL');
  const [priceFilter, setPriceFilter] = useState<PriceFilterKey>('ALL');
  const [selectedArtistId, setSelectedArtistId] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'carousel' | 'museum'>('carousel');
  const [purchaseSuccessId, setPurchaseSuccessId] = useState<string | null>(null);

  // Mobile collapsible filter drawer state (< 768px)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Touch swipe tracking for mobile slider
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Lightbox SVG perimeter animation state
  const [modalPerimeterReady, setModalPerimeterReady] = useState(false);

  // Elastic SVG String Divider refs
  const headerLineWrapRef = useRef<HTMLDivElement>(null);
  const headerLinePathRef = useRef<SVGPathElement>(null);

  const { lang, isRtl, isDark, t, formatPrice } = usePreferences();

  const handleElasticLineMove = (e: React.PointerEvent<HTMLElement>) => {
    const wrap = headerLineWrapRef.current;
    const path = headerLinePathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width <= 0) return;
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const qx = xRatio * 1000;
    const deltaY = Math.max(-22, Math.min(22, (e.clientY - (rect.top + rect.height / 2)) * 0.7));
    const qy = 12 + deltaY;
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${qx.toFixed(1)} ${qy.toFixed(1)} 1000 12` },
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleElasticLineLeave = () => {
    const path = headerLinePathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 1.15,
      ease: 'elastic.out(1.2, 0.25)',
      overwrite: 'auto',
    });
  };

  useEffect(() => {
    if (selectedArtwork) {
      setModalPerimeterReady(false);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => setModalPerimeterReady(true));
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setModalPerimeterReady(false);
    }
  }, [selectedArtwork]);

  const filtered = filterArtworks(artworks, {
    style: selectedStyle,
    priceFilter,
    artistId: selectedArtistId,
    searchQuery,
  });

  // Keep currentSlide in bounds when filters change
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedStyle, priceFilter, selectedArtistId, searchQuery]);

  const safeSlideIndex =
    filtered.length > 0 ? ((currentSlide % filtered.length) + filtered.length) % filtered.length : 0;
  const activeSlideArtwork = filtered[safeSlideIndex] || null;

  const goToNextSlide = useCallback(() => {
    if (filtered.length <= 1) return;
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % filtered.length);
  }, [filtered.length]);

  const goToPrevSlide = useCallback(() => {
    if (filtered.length <= 1) return;
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const goToSlide = (idx: number) => {
    if (idx === safeSlideIndex) return;
    setSlideDirection(idx > safeSlideIndex ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Horizontal Touch Swipe Handlers for Mobile Slider
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Trigger horizontal swipe if horizontal movement dominates and exceeds 38px
    if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
  };

  // Keyboard navigation for the carousel
  useEffect(() => {
    if (viewMode !== 'carousel' || selectedArtwork) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedArtwork, goToNextSlide, goToPrevSlide]);

  const handleConfirmPurchase = (art: ArtworkItem) => {
    const check = evaluateArtworkPurchase(art, activeCollector);
    if (!check.allowed) return;
    onPurchaseArtwork(art);
    setPurchaseSuccessId(art.id);
  };

  const galleryStyles = ART_STYLES.filter((st) => st.key !== 'OTHER');
  const activeFilterCount =
    (selectedStyle !== 'ALL' ? 1 : 0) +
    (priceFilter !== 'ALL' ? 1 : 0) +
    (selectedArtistId !== 'ALL' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="exhibition-gallery-view"
      className="siah-light-surface relative min-h-[calc(100vh-4rem)] bg-[#050505] text-white pt-3 md:pt-7 pb-24 px-4 md:px-12 overflow-hidden select-none"
    >
      {/* Animated WebGL1 "Mesh drift" Blobs Shader Background */}
      <MeshDriftCanvas isDark={isDark} />
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/25" />

      <div className="relative z-10 max-w-[1440px] mx-auto space-y-3 md:space-y-6">
        {/* ===================================================================
         * 1. CENTERED GALLERY HEADER WITH <FoldText /> & ELASTIC SVG DIVIDER
         * ================================================================= */}
        <div
          onPointerMove={handleElasticLineMove}
          onPointerLeave={handleElasticLineLeave}
          className="relative text-center mx-auto flex flex-col items-center justify-center space-y-1.5 md:space-y-2 pb-3 md:pb-5"
        >
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white text-center mx-auto flex flex-col items-center justify-center w-full">
            <FoldText
              text={t('گالری آثار و بازارگاه «سیاه و سفید»', 'Siah o Sefid Exhibition Portfolio')}
              splitBy="word"
              foldStyle="paper"
              trigger="mount"
              hoverRefold={false}
              color="#FFFFFF"
              fontWeight={900}
              className="text-center justify-center"
              style={{ textAlign: 'center', lineHeight: 1.25 }}
            />
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm font-light text-white/75 text-center mx-auto max-w-2xl leading-relaxed">
            {t(
              'نمایش کیوریتوری آثار منتخب با امکان ورق‌زدن، بررسی شناسنامه اصالت و خرید آنی با موجودی کیف پول.',
              'Curated showcase with provenance inspection and instant collector wallet acquisition.'
            )}
          </p>

          {/* Elastic Mouse-Reactive SVG String Divider */}
          <div
            ref={headerLineWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[10px] inset-x-0 h-[24px] w-full overflow-visible"
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

        {/* ===================================================================
         * MOBILE COMPACT TOP BAR + COLLAPSIBLE FILTER DRAWER (< 768px / md:hidden)
         * ================================================================= */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/15">
            {/* Collapsible Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              data-testid="mobile-filter-drawer-toggle"
              aria-expanded={mobileFiltersOpen}
              style={{
                backgroundColor: (mobileFiltersOpen || activeFilterCount > 0)
                  ? isDark ? '#ffffff' : '#131313'
                  : 'transparent',
                color: (mobileFiltersOpen || activeFilterCount > 0)
                  ? isDark ? '#050505' : '#fcfcfd'
                  : isDark ? 'rgba(255,255,255,0.85)' : '#000000',
              }}
              className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors cursor-pointer focus:outline-none ${
                mobileFiltersOpen || activeFilterCount > 0
                  ? isDark
                    ? '!bg-white !text-[#050505] font-semibold'
                    : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                  : isDark
                  ? 'bg-transparent text-white/85 border border-white/25'
                  : 'bg-transparent !text-[#000000] border border-[#131313]/25'
              }`}
            >
              <span className="!text-inherit">
                {mobileFiltersOpen
                  ? t('بستن فیلترها −', 'Close Filters −')
                  : activeFilterCount > 0
                  ? t(
                      `فیلتر و جستجوی آثار (${activeFilterCount.toLocaleString('fa-IR')}) +`,
                      `Filters & Search (${activeFilterCount}) +`
                    )
                  : t('فیلتر و جستجوی آثار +', 'Filters & Search +')}
              </span>
            </button>

            {/* Compact Mobile View Mode Switcher: اسلایدر | موزه‌ای */}
            <div
              role="group"
              aria-label={t('تغییر حالت نمایش گالری', 'Switch gallery view mode')}
              className={`flex items-center rounded-none p-0.5 border ${
                isDark ? 'border-white/25' : 'border-[#131313]/25'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                data-testid="mobile-view-mode-carousel"
                aria-pressed={viewMode === 'carousel'}
                style={{
                  backgroundColor: viewMode === 'carousel'
                    ? isDark ? '#ffffff' : '#131313'
                    : 'transparent',
                  color: viewMode === 'carousel'
                    ? isDark ? '#050505' : '#fcfcfd'
                    : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
                }}
                className={`px-3 py-1 rounded-none text-xs transition-colors cursor-pointer ${
                  viewMode === 'carousel'
                    ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                    : isDark ? 'bg-transparent text-white/75 font-light' : 'bg-transparent !text-[#000000] font-light'
                }`}
              >
                <span className="!text-inherit">{t('اسلایدر', 'Slider')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('museum')}
                data-testid="mobile-view-mode-museum"
                aria-pressed={viewMode === 'museum'}
                style={{
                  backgroundColor: viewMode === 'museum'
                    ? isDark ? '#ffffff' : '#131313'
                    : 'transparent',
                  color: viewMode === 'museum'
                    ? isDark ? '#050505' : '#fcfcfd'
                    : isDark ? 'rgba(255,255,255,0.75)' : '#000000',
                }}
                className={`px-3 py-1 rounded-none text-xs transition-colors cursor-pointer ${
                  viewMode === 'museum'
                    ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                    : isDark ? 'bg-transparent text-white/75 font-light' : 'bg-transparent !text-[#000000] font-light'
                }`}
              >
                <span className="!text-inherit">{t('موزه‌ای', 'Museum')}</span>
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                data-testid="mobile-filter-drawer-panel"
                className="overflow-hidden bg-[#050505]/95 border-b border-white/20 pb-3 space-y-3"
              >
                {/* Search Input */}
                <div className="relative pt-1">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t(
                      'جستجوی نام اثر، هنرمند یا کد...',
                      'Search title, artist, or code...'
                    )}
                    aria-label={t('جستجوی آثار هنری', 'Search artworks')}
                    className="peer w-full bg-transparent border-0 border-b border-white/25 rounded-none px-0 py-1.5 text-xs text-white placeholder:text-white/35 focus:outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] bg-white scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>

                {/* Style Tiles */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-medium text-white/60">
                    {t('سبک هنری:', 'Art Style:')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <ArchitecturalTileButton
                      active={selectedStyle === 'ALL'}
                      onClick={() => setSelectedStyle('ALL')}
                    >
                      {t('همه سبک‌ها', 'All')}
                    </ArchitecturalTileButton>
                    {galleryStyles.map((st) => (
                      <ArchitecturalTileButton
                        key={st.key}
                        active={selectedStyle === st.key}
                        onClick={() => setSelectedStyle(st.key)}
                      >
                        {t(st.labelFa, st.labelEn)}
                      </ArchitecturalTileButton>
                    ))}
                  </div>
                </div>

                {/* Price Tiles */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-medium text-white/60">
                    {t('محدوده قیمت:', 'Price Range:')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {PRICE_FILTERS.map((pf) => (
                      <ArchitecturalTileButton
                        key={pf.key}
                        active={priceFilter === pf.key}
                        onClick={() => setPriceFilter(pf.key)}
                      >
                        {t(pf.labelFa, pf.labelEn)}
                      </ArchitecturalTileButton>
                    ))}
                  </div>
                </div>

                {/* Artist Tiles */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-medium text-white/60">
                    {t('فیلتر هنرمند:', 'Artist:')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <ArchitecturalTileButton
                      active={selectedArtistId === 'ALL'}
                      onClick={() => setSelectedArtistId('ALL')}
                    >
                      {t('همه هنرمندان', 'All Artists')}
                    </ArchitecturalTileButton>
                    {artists.map((a) => (
                      <ArchitecturalTileButton
                        key={a.id}
                        active={selectedArtistId === a.id}
                        onClick={() => setSelectedArtistId(a.id)}
                      >
                        {a.fullName}
                      </ArchitecturalTileButton>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================================================================
         * DESKTOP ARCHITECTURAL FILTER BAR (hidden md:block)
         * ================================================================= */}
        <div
          data-testid="architectural-filter-bar"
          className="hidden md:block bg-transparent rounded-none border-0 space-y-3 pb-2"
        >
          {/* Row 1: Style Filter Tiles + Bottom-Line Search + View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Style Filter Tiles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-white/60 me-1">
                {t('سبک هنری:', 'Art Style:')}
              </span>
              <ArchitecturalTileButton
                active={selectedStyle === 'ALL'}
                onClick={() => setSelectedStyle('ALL')}
                testId="filter-style-ALL"
              >
                {t(`همه سبک‌ها (${artworks.length.toLocaleString('fa-IR')})`, `All Styles (${artworks.length})`)}
              </ArchitecturalTileButton>
              {galleryStyles.map((st) => (
                <ArchitecturalTileButton
                  key={st.key}
                  active={selectedStyle === st.key}
                  onClick={() => setSelectedStyle(st.key)}
                  testId={`filter-style-${st.key}`}
                >
                  {t(st.labelFa, st.labelEn)}
                </ArchitecturalTileButton>
              ))}
            </div>

            {/* Right/End Cluster: Bottom-Line Search Input + Sharp View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto justify-between lg:justify-end">
              {/* Sleek Bottom-Line Architectural Search Input */}
              <div className="relative w-full sm:w-60">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'جستجوی نام اثر، هنرمند یا کد...',
                    'Search title, artist, or code...'
                  )}
                  aria-label={t('جستجوی آثار هنری', 'Search artworks')}
                  className="peer w-full bg-transparent border-0 border-b border-white/25 rounded-none px-0 py-1.5 text-xs text-white placeholder:text-white/35 focus:outline-none"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] bg-white scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>

              {/* View Mode Switcher: Sharp 90deg Borderless Tiles */}
              <div
                role="group"
                aria-label={t('تغییر حالت نمایش گالری', 'Switch gallery view mode')}
                className="flex items-center gap-1"
              >
                <ArchitecturalTileButton
                  active={viewMode === 'carousel'}
                  onClick={() => setViewMode('carousel')}
                  testId="view-mode-carousel"
                >
                  {t('نمای اسلایدر', 'Slider View')}
                </ArchitecturalTileButton>
                <ArchitecturalTileButton
                  active={viewMode === 'museum'}
                  onClick={() => setViewMode('museum')}
                  testId="view-mode-museum"
                >
                  {t('نمای موزه‌ای', 'Museum View')}
                </ArchitecturalTileButton>
              </div>
            </div>
          </div>

          {/* Row 2: Price Range Tiles + Clickable Sharp-Cornered Artist Name Tiles (Zero <select>) */}
          <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            {/* Price Filter Tiles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-white/60 me-1">
                {t('محدوده قیمت:', 'Price Range:')}
              </span>
              {PRICE_FILTERS.map((pf) => (
                <ArchitecturalTileButton
                  key={pf.key}
                  active={priceFilter === pf.key}
                  onClick={() => setPriceFilter(pf.key)}
                  testId={`filter-price-${pf.key}`}
                >
                  {t(pf.labelFa, pf.labelEn)}
                </ArchitecturalTileButton>
              ))}
            </div>

            {/* Artist Filter Tiles (Replaced Native <select> Dropdown) */}
            <div
              role="group"
              aria-label={t('فیلتر هنرمند:', 'Artist Filter:')}
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="text-xs font-medium text-white/60 me-1">
                {t('فیلتر هنرمند:', 'Artist:')}
              </span>
              <ArchitecturalTileButton
                active={selectedArtistId === 'ALL'}
                onClick={() => setSelectedArtistId('ALL')}
                testId="filter-artist-ALL"
              >
                {t(`همه هنرمندان (${artists.length.toLocaleString('fa-IR')})`, `All Artists (${artists.length})`)}
              </ArchitecturalTileButton>
              {artists.map((a) => (
                <ArchitecturalTileButton
                  key={a.id}
                  active={selectedArtistId === a.id}
                  onClick={() => setSelectedArtistId(a.id)}
                  testId={`filter-artist-${a.id}`}
                >
                  {a.fullName}
                </ArchitecturalTileButton>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
         * EMPTY FILTER STATE
         * ================================================================= */}
        {filtered.length === 0 ? (
          <div className="group relative py-14 px-6 text-center rounded-none border-0 bg-transparent max-w-2xl mx-auto space-y-4">
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-10 w-full h-full overflow-visible"
            >
              <path
                d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="[stroke-dasharray:2200] [stroke-dashoffset:2200] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>
            <p className="text-base sm:text-lg font-medium text-white/85">
              {t(
                'اثری با فیلترهای انتخابی شما یافت نشد.',
                'No artworks match your selected filters.'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('ALL');
                setPriceFilter('ALL');
                setSelectedArtistId('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-none bg-white text-[#050505] hover:bg-transparent hover:text-white border border-white text-xs font-semibold transition-all duration-300 cursor-pointer"
            >
              {t('بازنشانی تمام فیلترها', 'Reset All Filters')}
            </button>
          </div>
        ) : viewMode === 'carousel' && activeSlideArtwork ? (
          /* ===================================================================
           * 2. REDESIGNED "SLIDER VIEW" (نمای اسلایدر)
           * - Mobile (< 768px): Unified Single-Screen Card (h-auto) with Touch Swipe
           *   + Instant Prev/Next Bar directly between image and title!
           * - Desktop (>= 768px): Side-by-Side Split Stage (md:h-[58vh] md:max-h-[520px])
           * ================================================================= */
          <div
            data-testid="portfolio-carousel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-center max-w-6xl mx-auto h-auto md:h-[58vh] md:max-h-[520px]"
          >
            {/* Image Stage (7 Columns on md:+): Sharp 90deg corners, uncropped object-contain */}
            <div
              onClick={() => {
                setPurchaseSuccessId(null);
                onSelectArtwork(activeSlideArtwork);
              }}
              className="md:col-span-7 h-56 sm:h-64 md:h-full md:max-h-[500px] w-full bg-[#050505]/60 rounded-none flex items-center justify-center overflow-hidden relative group cursor-pointer"
            >
              {/* Top-Right 1px SVG Perimeter Draw on Hover */}
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
                  className="[stroke-dasharray:2600] [stroke-dashoffset:2600] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                <motion.div
                  key={activeSlideArtwork.id}
                  custom={slideDirection}
                  initial={{ opacity: 0, x: slideDirection * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection * -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full flex items-center justify-center p-2 sm:p-4"
                >
                  <img
                    src={activeSlideArtwork.image}
                    alt={t(activeSlideArtwork.title, activeSlideArtwork.titleEn)}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full w-full h-full object-contain object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* MOBILE-ONLY Instant Prev/Next Navigation Bar Directly Between Image & Title (md:hidden) */}
            <div
              data-testid="mobile-slider-controls-bar"
              className="flex md:hidden items-center justify-between gap-3 py-2 px-3 border-y border-white/15 bg-[#050505]/85"
            >
              <button
                type="button"
                onClick={goToPrevSlide}
                data-testid="mobile-carousel-prev-btn"
                aria-label={t('اثر قبلی', 'Previous artwork')}
                style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#000000' }}
                className="py-1 px-2 rounded-none border-0 bg-transparent text-xs font-medium cursor-pointer focus:outline-none whitespace-nowrap"
              >
                {t('→ قبلی', '← PREV')}
              </button>

              <div
                className="flex-1 flex items-center justify-center gap-1.5 isolate mix-blend-normal"
                style={{ mixBlendMode: 'normal' }}
                data-testid="mobile-slider-controls-bar"
              >
                {filtered.map((art, idx) => {
                  const isActive = idx === safeSlideIndex;
                  return (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`${t('اسلاید', 'Slide')} ${idx + 1}`}
                      style={{
                        background: 'transparent',
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '4px 0',
                        cursor: 'pointer',
                        mixBlendMode: 'normal',
                      }}
                      className="rounded-none border-0 p-0 cursor-pointer bg-transparent focus:outline-none isolate mix-blend-normal"
                    >
                      <span
                        className={isActive ? 'slider-dash-active' : 'slider-dash-inactive'}
                        style={{
                          display: 'block',
                          width: isActive ? '32px' : '14px',
                          height: '0px',
                          borderTop: isActive
                            ? (isDark ? '3px solid #ffffff' : '3px solid #000000')
                            : (isDark ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(0,0,0,0.32)'),
                          background: 'transparent',
                          backgroundColor: 'transparent',
                          mixBlendMode: 'normal',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goToNextSlide}
                data-testid="mobile-carousel-next-btn"
                aria-label={t('اثر بعدی', 'Next artwork')}
                style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#000000' }}
                className="py-1 px-2 rounded-none border-0 bg-transparent text-xs font-medium cursor-pointer focus:outline-none whitespace-nowrap"
              >
                {t('بعدی ←', 'NEXT →')}
              </button>
            </div>

            {/* Artwork Plaque & Purchase Panel (5 Columns on md:+): Compact on Mobile, Full Plaque on Desktop */}
            <div className="group/plaque relative md:col-span-5 h-auto md:h-full md:max-h-[500px] bg-transparent rounded-none border-0 p-4 sm:p-5 md:p-7 flex flex-col justify-between gap-3 md:gap-4">
              {/* Top-Right 1px SVG Perimeter Draw */}
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
                  className="[stroke-dasharray:2400] [stroke-dashoffset:2400] opacity-0 group-hover/plaque:opacity-100 group-hover/plaque:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* Top Curatorial Metadata & FoldText Title */}
              <div className="relative z-10 space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-[11px] md:text-xs font-light text-white/60 border-b border-white/15 pb-1.5 md:pb-2.5">
                  <span>
                    {t('اثر', 'Work')} {(safeSlideIndex + 1).toLocaleString('fa-IR')}{' '}
                    {t('از', 'of')} {filtered.length.toLocaleString('fa-IR')} ·{' '}
                    {activeSlideArtwork.accessionCode}
                  </span>
                  <span className="text-white/75">
                    {activeSlideArtwork.dimensions}
                  </span>
                </div>

                <h2
                  key={`slide-title-${activeSlideArtwork.id}`}
                  className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight"
                >
                  <FoldText
                    text={t(activeSlideArtwork.title, activeSlideArtwork.titleEn)}
                    splitBy="word"
                    foldStyle="paper"
                    trigger="mount"
                    hoverRefold={false}
                    color="#FFFFFF"
                    fontWeight={900}
                    style={{ lineHeight: 1.25 }}
                  />
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                  <span>
                    {t('هنرمند:', 'Artist:')} {activeSlideArtwork.artistName} (
                    {activeSlideArtwork.artistAlias})
                  </span>
                  <span className="opacity-40">·</span>
                  <span>
                    {activeSlideArtwork.styleLabel ||
                      getStyleLabel(activeSlideArtwork.style, lang)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-light text-white/70 leading-relaxed line-clamp-2 md:line-clamp-3">
                  {activeSlideArtwork.story}
                </p>
              </div>

              {/* Price + Sharp Purchase Button + Desktop Slider Controls */}
              <div className="relative z-10 space-y-3 md:space-y-4 pt-2.5 md:pt-3 border-t border-white/15">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xs font-light text-white/60">
                    {t('ارزش ثبت‌شده اثر:', 'Registered Valuation:')}
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-white tabular-nums">
                    {formatPrice(activeSlideArtwork.price)}
                  </span>
                </div>

                <button
                  type="button"
                  data-testid="carousel-inspect-buy-btn"
                  onClick={() => {
                    setPurchaseSuccessId(null);
                    onSelectArtwork(activeSlideArtwork);
                  }}
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`w-full py-3 md:py-3.5 px-5 md:px-6 rounded-none border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <span className="!text-inherit">
                    {activeSlideArtwork.sold
                      ? t('مشاهده شناسنامه اثر ↖', 'View Provenance ↖')
                      : t('بررسی شناسنامه و خرید اثر ↖', 'Inspect Provenance & Acquire ↖')}
                  </span>
                </button>

                {/* Desktop-Only Sharp Architectural Navigation Triggers & Hairline Progress Bars (hidden md:flex) */}
                <div className="hidden md:flex pt-2 items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={goToPrevSlide}
                    data-testid="carousel-prev-btn"
                    aria-label={t('اثر قبلی', 'Previous artwork')}
                    style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#000000' }}
                    className="py-1 px-2 rounded-none border-0 bg-transparent text-xs font-mono-archival hover:opacity-100 transition-colors cursor-pointer focus:outline-none whitespace-nowrap"
                  >
                    {t('→ قبلی', '← PREV')}
                  </button>

                  {/* Clean Hairline Progress Bars */}
                  <div
                    role="tablist"
                    aria-label={t('انتخاب اسلاید اثر هنری', 'Select artwork slide')}
                    className="flex-1 flex items-center justify-center gap-1.5 isolate mix-blend-normal"
                    style={{ mixBlendMode: 'normal' }}
                  >
                    {filtered.map((art, idx) => {
                      const isActive = idx === safeSlideIndex;
                      return (
                        <button
                          key={art.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`${t('اسلاید', 'Slide')} ${idx + 1}: ${t(
                            art.title,
                            art.titleEn
                          )}`}
                          data-testid={`carousel-dot-${idx}`}
                          onClick={() => goToSlide(idx)}
                          style={{
                            background: 'transparent',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '4px 0',
                            cursor: 'pointer',
                            mixBlendMode: 'normal',
                          }}
                          className="rounded-none border-0 p-0 cursor-pointer bg-transparent focus:outline-none isolate mix-blend-normal"
                        >
                          <span
                            className={isActive ? 'slider-dash-active' : 'slider-dash-inactive'}
                            style={{
                              display: 'block',
                              width: isActive ? '32px' : '14px',
                              height: '0px',
                              borderTop: isActive
                                ? (isDark ? '3px solid #ffffff' : '3px solid #000000')
                                : (isDark ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(0,0,0,0.32)'),
                              background: 'transparent',
                              backgroundColor: 'transparent',
                              mixBlendMode: 'normal',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={goToNextSlide}
                    data-testid="carousel-next-btn"
                    aria-label={t('اثر بعدی', 'Next artwork')}
                    style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#000000' }}
                    className="py-1 px-2 rounded-none border-0 bg-transparent text-xs font-mono-archival hover:opacity-100 transition-colors cursor-pointer focus:outline-none whitespace-nowrap"
                  >
                    {t('بعدی ←', 'NEXT →')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================
           * 3. REDESIGNED "MUSEUM VIEW" (نمای موزه‌ای)
           * Proportionate Editorial Grid (1-Col / 2-Col Mobile & Tablet, 3-Col Desktop)
           * ================================================================= */
          <div
            data-testid="museum-exhibition-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto pt-1 md:pt-2"
          >
            {filtered.map((art) => (
              <article
                key={art.id}
                data-testid={`museum-artwork-card-${art.id}`}
                onClick={() => {
                  setPurchaseSuccessId(null);
                  onSelectArtwork(art);
                }}
                className="max-h-[540px] flex flex-col justify-between p-4 sm:p-5 md:p-6 bg-transparent relative group rounded-none border-0 cursor-pointer"
              >
                {/* Hover Perimeter Draw: Single Continuous 1px White SVG Border from Top-Right (700ms) */}
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
                    className="[stroke-dasharray:2200] [stroke-dashoffset:2200] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </svg>

                {/* Top Section: Fixed Well-Proportioned Gallery Frame */}
                <div className="space-y-3 md:space-y-4">
                  <div className="aspect-[4/3] h-[215px] md:h-[250px] w-full overflow-hidden rounded-none bg-black/40">
                    <img
                      src={art.image}
                      alt={t(art.title, art.titleEn)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </div>

                  {/* Artwork Title, Artist Name & Style */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-xs font-light text-white/60">
                      <span>
                        {art.artistName} · {art.styleLabel || getStyleLabel(art.style, lang)}
                      </span>
                      <span className="text-[11px] text-white/65">
                        {art.dimensions}
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-black text-white truncate">
                      {t(art.title, art.titleEn)}
                    </h2>

                    <p className="text-xs font-light text-white/65 line-clamp-2 leading-relaxed">
                      {art.story}
                    </p>
                  </div>
                </div>

                {/* Card Footer (Always Visible Without Scrolling): Price + Instant Purchase Trigger */}
                <div className="pt-3.5 mt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                  <span className="text-base sm:text-lg font-black text-white tabular-nums">
                    {formatPrice(art.price)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPurchaseSuccessId(null);
                      onSelectArtwork(art);
                    }}
                    data-testid={`museum-buy-btn-${art.id}`}
                    style={{
                      backgroundColor: isDark ? '#ffffff' : '#131313',
                      color: isDark ? '#050505' : '#fcfcfd',
                    }}
                    className={`px-4 py-2 rounded-none border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                    }`}
                  >
                    <span className="!text-inherit">
                      {art.sold
                        ? t('شناسنامه اثر ↖', 'Provenance ↖')
                        : t('مشاهده و خرید اثر ↖', 'Inspect & Acquire ↖')}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
       * 4. INSPECTION & PURCHASE MODAL (Mobile Bottom-Sheet / Full-Screen + Sticky Buy Bar)
       * =================================================================== */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onSelectArtwork(null)}
            role="dialog"
            aria-modal="true"
            aria-label={t(
              `شناسنامه و خرید اثر ${selectedArtwork.title}`,
              `Provenance and acquisition for ${selectedArtwork.titleEn}`
            )}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md text-white p-2 sm:p-4 md:p-8 flex items-end md:items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              data-testid="artwork-inspection-modal"
              className="relative max-w-5xl w-full rounded-none bg-[#050505]/90 backdrop-blur-2xl border-0 my-0 md:my-auto"
            >
              {/* Top-Right Progressive 1px White SVG Perimeter Border Draw on Open */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-30 w-full h-full overflow-visible"
              >
                <path
                  d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeDasharray: 3600,
                    strokeDashoffset: modalPerimeterReady ? 0 : 3600,
                    transition:
                      'stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </svg>

              <div className="max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-4 sm:p-6 md:p-9">
                {/* Top Bar: Archival Code + Minimal Architectural Close Trigger «بستن ×» */}
                <div className="relative z-10 flex items-center justify-between gap-4 pb-3 md:pb-4 mb-4 md:mb-6 border-b border-white/15">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs font-light text-white/70 truncate">
                    <span className="text-white font-medium truncate">
                      {t('شناسنامه اصالت اثر:', 'Certificate of Authenticity:')}{' '}
                      {selectedArtwork.accessionCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">
                      {selectedArtwork.styleLabel ||
                        getStyleLabel(selectedArtwork.style, lang)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectArtwork(null)}
                    aria-label={t('بستن شناسنامه اثر', 'Close artwork modal')}
                    data-testid="close-inspection-modal-btn"
                    className="group shrink-0 inline-flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-light text-white/75 hover:text-white transition-colors cursor-pointer bg-transparent border-0 rounded-none focus:outline-none"
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

                {/* Side-by-Side Split Layout Fitting Within 85vh */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-center">
                  {/* Side 1: Artwork High-Res Image */}
                  <div className="lg:col-span-6 h-[220px] sm:h-[300px] lg:h-[420px] rounded-none bg-black/60 flex items-center justify-center overflow-hidden p-2 sm:p-3">
                    <img
                      src={selectedArtwork.image}
                      alt={t(selectedArtwork.title, selectedArtwork.titleEn)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full max-h-[400px] object-contain object-center"
                    />
                  </div>

                  {/* Side 2: Certificate of Authenticity & One-Click Wallet Acquisition */}
                  <div className="lg:col-span-6 space-y-4 md:space-y-5">
                    <div>
                      <p className="text-xs font-light text-white/65 mb-1">
                        {t('هنرمند:', 'Artist:')} {selectedArtwork.artistName} (
                        {selectedArtwork.artistAlias})
                      </p>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                        <FoldText
                          text={t(selectedArtwork.title, selectedArtwork.titleEn)}
                          splitBy="word"
                          foldStyle="paper"
                          trigger="mount"
                          hoverRefold={false}
                          color="#FFFFFF"
                          fontWeight={900}
                          style={{ lineHeight: 1.25 }}
                        />
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm font-light text-white/75 leading-relaxed">
                      {selectedArtwork.story}
                    </p>

                    {/* Accession Metadata Definition List */}
                    <dl className="grid grid-cols-2 gap-3 md:gap-4 py-3 border-y border-white/15 text-xs">
                      <div>
                        <dt className="text-white/55 font-light mb-0.5">
                          {t('سبک هنری:', 'Style:')}
                        </dt>
                        <dd className="font-semibold text-white">
                          {selectedArtwork.styleLabel ||
                            getStyleLabel(selectedArtwork.style, lang)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/55 font-light mb-0.5">
                          {t('ابعاد اثر:', 'Dimensions:')}
                        </dt>
                        <dd className="font-semibold text-white">
                          {selectedArtwork.dimensions}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-white/55 font-light mb-0.5">
                          {t('تکنیک و متریال:', 'Medium:')}
                        </dt>
                        <dd className="font-semibold text-white">
                          {selectedArtwork.medium}
                        </dd>
                      </div>
                    </dl>

                    {/* Sticky Bottom Purchase Bar on Mobile / Inline on Desktop */}
                    <div className="sticky bottom-0 z-30 bg-[#050505]/95 backdrop-blur-xl pt-3 pb-1 md:static md:bg-transparent md:pt-1 md:pb-0 space-y-3 md:space-y-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-light text-white/65">
                          {t('ارزش ثبت‌شده اثر:', 'Registered Valuation:')}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                          {formatPrice(selectedArtwork.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-b border-white/15 pb-2.5">
                        <span className="text-white/60 font-light truncate me-2">
                          {t(
                            `موجودی کیف پول (${activeCollector.fullName}):`,
                            `Wallet Balance (${activeCollector.fullName}):`
                          )}
                        </span>
                        <span className="font-bold text-white tabular-nums shrink-0">
                          {formatPrice(activeCollector.walletBalance)}
                        </span>
                      </div>

                      {purchaseSuccessId === selectedArtwork.id || selectedArtwork.sold ? (
                        <div className="p-3.5 rounded-none bg-white/5 border border-white/40 text-white text-xs space-y-1">
                          <div className="font-bold text-sm">
                            {t(
                              'این اثر با موفقیت در کلکسیون شخصی شما ثبت شد.',
                              'This artwork is registered in your private collection.'
                            )}
                          </div>
                          <p className="text-white/75 font-light">
                            {t(
                              `گواهی اصالت دیجیتال با کد آرشیو ${selectedArtwork.accessionCode} به حساب کاربری شما منتقل گردید.`,
                              `Digital provenance certificate ${selectedArtwork.accessionCode} transferred to your collector account.`
                            )}
                          </p>
                        </div>
                      ) : (
                        (() => {
                          const evaluation = evaluateArtworkPurchase(
                            selectedArtwork,
                            activeCollector
                          );
                          return (
                            <div className="space-y-2.5">
                              {!evaluation.allowed && (
                                <div className="p-2.5 rounded-none bg-transparent border border-white/30 text-white text-xs flex items-center justify-between gap-3">
                                  <span className="font-light text-white/80">
                                    {t(
                                      evaluation.reasonFa || 'موجودی کیف پول کافی نیست',
                                      'Insufficient wallet balance for this acquisition.'
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onQuickTopUp(50000000)}
                                    style={{
                                      backgroundColor: isDark ? '#ffffff' : '#131313',
                                      color: isDark ? '#050505' : '#fcfcfd',
                                    }}
                                    className={`px-3 py-1.5 rounded-none border font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                                      isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                                    }`}
                                  >
                                    <span className="!text-inherit">{t('+ شارژ سریع ۵۰ میلیون', '+ Quick Top-Up 50M')}</span>
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                disabled={!evaluation.allowed}
                                onClick={() => handleConfirmPurchase(selectedArtwork)}
                                data-testid="confirm-wallet-purchase-btn"
                                style={
                                  evaluation.allowed
                                    ? {
                                        backgroundColor: isDark ? '#ffffff' : '#131313',
                                        color: isDark ? '#050505' : '#fcfcfd',
                                      }
                                    : undefined
                                }
                                className={`w-full py-3.5 md:py-4 px-5 md:px-6 rounded-none text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-300 ${
                                  evaluation.allowed
                                    ? isDark
                                      ? '!bg-white !text-[#050505] border border-white cursor-pointer'
                                      : '!bg-[#131313] !text-[#fcfcfd] border border-[#131313] cursor-pointer'
                                    : 'bg-white/10 text-white/40 border border-white/15 cursor-not-allowed'
                                }`}
                              >
                                <span className="!text-inherit">
                                  {t(
                                    'خرید قطعی اثر با موجودی کیف پول',
                                    'Acquire Artwork with Wallet Balance'
                                  )}
                                </span>
                                <span className="!text-inherit">{t('تملک قطعی اثر ↖', 'Acquire Now ↖')}</span>
                              </button>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
