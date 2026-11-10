import React, { useRef } from 'react';
import gsap from 'gsap';
import { AppView, PlatformUser, SessionRole } from '../data/siahSefidData';
import { usePreferences } from '../context/PreferencesContext';
import { ThemeToggle } from './ui/theme-toggle';

interface NavbarSiahSefidProps {
  currentView: AppView;
  sessionRole: SessionRole;
  onSelectView: (view: AppView) => void;
  activeCollector: PlatformUser;
  activeArtist: PlatformUser;
}

export const NavbarSiahSefid: React.FC<NavbarSiahSefidProps> = ({
  currentView,
  sessionRole,
  onSelectView,
  activeCollector,
  activeArtist,
}) => {
  const { isRtl, isDark, toggleTheme, t, formatPrice } = usePreferences();
  const navLineWrapRef = useRef<HTMLDivElement>(null);
  const navLinePathRef = useRef<SVGPathElement>(null);

  const handleElasticLineMove = (e: React.PointerEvent<HTMLElement>) => {
    const wrap = navLineWrapRef.current;
    const path = navLinePathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width <= 0) return;
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const qx = xRatio * 1000;
    const deltaY = Math.max(-20, Math.min(20, (e.clientY - (rect.top + rect.height / 2)) * 0.65));
    const qy = 12 + deltaY;
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${qx.toFixed(1)} ${qy.toFixed(1)} 1000 12` },
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleElasticLineLeave = () => {
    const path = navLinePathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 1.15,
      ease: 'elastic.out(1.2, 0.25)',
      overwrite: 'auto',
    });
  };

  // On the Landing Page (Story-First Scrollytelling): Whisper-clean top bar with ThemeToggle
  if (currentView === 'landing') {
    return (
      <header
        dir={isRtl ? 'rtl' : 'ltr'}
        data-testid="minimal-top-navbar"
        className="fixed top-0 inset-x-0 z-30 pointer-events-none select-none"
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-end">
          <div className="pointer-events-auto isolate">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>
      </header>
    );
  }

  // Inside the Exhibition Gallery: Whisper-clean Swiss Editorial Top Navbar
  return (
    <header
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="minimal-top-navbar"
      onPointerMove={handleElasticLineMove}
      onPointerLeave={handleElasticLineLeave}
      className={`sticky top-0 z-40 w-full backdrop-blur-xl h-16 flex items-center select-none transition-colors duration-300 ${
        isDark
          ? 'bg-[#050505]/75 text-white'
          : 'bg-[#f5f4f0]/85 text-[#000000]'
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-12 flex items-center justify-between gap-3 md:grid md:grid-cols-3">
        {/* 1. Right (Start in RTL): Brand Wordmark «سیاه و سفید» */}
        <div className="justify-self-start shrink-0">
          <button
            type="button"
            onClick={() => onSelectView('landing')}
            data-testid="nav-brand-wordmark"
            className={`text-start font-black text-base sm:text-xl md:text-2xl hover:opacity-80 transition-opacity cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap ${
              isDark ? 'text-white' : 'text-[#000000]'
            }`}
          >
            {t('سیاه و سفید', 'Siah o Sefid')}
          </button>
        </div>

        {/* 2. Center Link: گالری آثار (Sharp Architectural Underline Trigger) */}
        <nav aria-label={t('ناوبری گالری آثار', 'Exhibition Navigation')} className="justify-self-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectView('gallery')}
            data-testid="nav-gallery"
            className={`group relative py-1.5 px-1 text-xs sm:text-sm md:text-base font-semibold transition-colors cursor-pointer rounded-none border-0 bg-transparent focus:outline-none whitespace-nowrap ${
              isDark ? 'text-white' : 'text-[#000000]'
            }`}
          >
            <span>{t('گالری آثار', 'Exhibition Gallery')}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isDark ? 'bg-white' : 'bg-[#131313]'
              }`}
            />
          </button>
        </nav>

        {/* 3. Left (End in RTL): ThemeToggle + Context-Aware Architectural Text Trigger */}
        <div className="justify-self-end flex items-center gap-3 md:gap-5 shrink-0">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          {sessionRole === 'ARTIST' ? (
            <button
              type="button"
              onClick={() => onSelectView('artist-panel')}
              data-testid="navbar-context-pill"
              title={activeArtist.fullName}
              className={`group relative py-1.5 px-1 text-xs sm:text-sm md:text-base font-medium transition-colors cursor-pointer whitespace-nowrap rounded-none border-0 bg-transparent focus:outline-none ${
                isDark
                  ? 'text-white/85 hover:text-white'
                  : 'text-[#373737] hover:text-[#000000]'
              }`}
            >
              <span className="md:hidden">{t('استودیو ↖', 'Studio ↖')}</span>
              <span className="hidden md:inline">{t('استودیوی من ↖', 'My Studio ↖')}</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isDark ? 'bg-white' : 'bg-[#131313]'
                }`}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectView('collector-panel')}
              data-testid="navbar-context-pill"
              title={activeCollector.fullName}
              className={`group relative py-1.5 px-1 text-xs sm:text-sm md:text-base font-medium transition-colors cursor-pointer whitespace-nowrap rounded-none border-0 bg-transparent focus:outline-none ${
                isDark
                  ? 'text-white/85 hover:text-white'
                  : 'text-[#373737] hover:text-[#000000]'
              }`}
            >
              <span className="md:hidden">{t('حساب من ↖', 'Account ↖')}</span>
              <span className="hidden md:inline">
                {t('حساب کاربری', 'Collector Account')} · {formatPrice(activeCollector.walletBalance)} ↖
              </span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isDark ? 'bg-white' : 'bg-[#131313]'
                }`}
              />
            </button>
          )}
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
            stroke={isDark ? 'rgba(255, 255, 255, 0.45)' : '#d6d5d2'}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </header>
  );
};
