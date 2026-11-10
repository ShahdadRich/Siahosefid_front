import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  PlatformUser,
  WalletTransaction,
  ArtworkItem,
  AppView,
} from '../data/siahSefidData';
import { formatPersianToman, formatTomanPrice } from '../utils/siahSefidLogic';
import { usePreferences } from '../context/PreferencesContext';
import { MeshDriftCanvas } from './MeshDriftCanvas';
import FoldText from './FoldText';
import { ThemeToggle } from './ui/theme-toggle';

interface CollectorWalletViewProps {
  activeCollector: PlatformUser;
  onUpdateCollectorProfile: (updates: {
    fullName: string;
    email: string;
    phone: string;
  }) => void;
  onTopUpWallet: (amount: number) => void;
  transactions: WalletTransaction[];
  acquiredArtworks: ArtworkItem[];
  onNavigateView: (view: AppView) => void;
  onLogout?: () => void;
}

const LUXURY_TOP_UP_AMOUNTS = [25000000, 50000000, 100000000, 250000000];

export const CollectorWalletView: React.FC<CollectorWalletViewProps> = ({
  activeCollector,
  onUpdateCollectorProfile,
  onTopUpWallet,
  transactions,
  acquiredArtworks,
  onNavigateView,
  onLogout,
}) => {
  const { lang, isRtl, isDark, toggleTheme, t, formatPrice } = usePreferences();

  const [profileDraft, setProfileDraft] = useState({
    fullName: activeCollector.fullName,
    email: activeCollector.email,
    phone: activeCollector.phone,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [selectedTopUp, setSelectedTopUp] = useState<number>(50000000);
  const [customTopUp, setCustomTopUp] = useState<string>('');
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string | null>(null);

  // Elastic SVG String Divider refs
  const navLineWrapRef = useRef<HTMLDivElement>(null);
  const navLinePathRef = useRef<SVGPathElement>(null);

  const headerLineWrapRef = useRef<HTMLDivElement>(null);
  const headerLinePathRef = useRef<SVGPathElement>(null);

  const balanceLineWrapRef = useRef<HTMLDivElement>(null);
  const balanceLinePathRef = useRef<SVGPathElement>(null);

  const profileLineWrapRef = useRef<HTMLDivElement>(null);
  const profileLinePathRef = useRef<SVGPathElement>(null);

  const bottomLineWrapRef = useRef<HTMLDivElement>(null);
  const bottomLinePathRef = useRef<SVGPathElement>(null);

  // Animated balance counter ref
  const balanceDisplayRef = useRef<HTMLParagraphElement>(null);
  const prevBalanceRef = useRef<number>(activeCollector.walletBalance);

  useEffect(() => {
    setProfileDraft({
      fullName: activeCollector.fullName,
      email: activeCollector.email,
      phone: activeCollector.phone,
    });
  }, [activeCollector]);

  // Animate Persian numeral balance counter on mount and balance update
  useEffect(() => {
    if (!balanceDisplayRef.current) return;
    const obj = { val: prevBalanceRef.current };
    const target = activeCollector.walletBalance;
    prevBalanceRef.current = target;
    const tween = gsap.fromTo(
      obj,
      { val: obj.val === target ? Math.max(0, Math.floor(target * 0.85)) : obj.val },
      {
        val: target,
        duration: 1.15,
        ease: 'power3.out',
        onUpdate: () => {
          if (balanceDisplayRef.current) {
            balanceDisplayRef.current.textContent = formatPrice(Math.round(obj.val));
          }
        },
      }
    );
    return () => {
      tween.kill();
    };
  }, [activeCollector.walletBalance, formatPrice]);

  // Elastic SVG String Divider Helper
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
    const deltaY = Math.max(-24, Math.min(24, (e.clientY - (rect.top + rect.height / 2)) * 0.7));
    const qy = 12 + deltaY;
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${qx.toFixed(1)} ${qy.toFixed(1)} 1000 12` },
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleElasticLineLeave = (pathRef: React.RefObject<SVGPathElement | null>) => {
    const path = pathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 1.2,
      ease: 'elastic.out(1.2, 0.25)',
      overwrite: 'auto',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileDraft.fullName.trim().length < 2) return;
    onUpdateCollectorProfile(profileDraft);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const customNum = customTopUp ? Number(customTopUp) : 0;
    const finalAmount = customNum >= 100000 ? customNum : selectedTopUp;
    if (finalAmount <= 0) return;

    onTopUpWallet(finalAmount);
    setCustomTopUp('');
    setTopUpSuccessMsg(
      lang === 'fa'
        ? `مبلغ ${formatPersianToman(finalAmount)} با موفقیت به کیف پول شما افزوده شد.`
        : `Successfully credited ${formatTomanPrice(finalAmount)} to your collector wallet.`
    );
    setTimeout(() => setTopUpSuccessMsg(null), 4500);
  };

  const userTransactions = transactions.filter((tx) => tx.userId === activeCollector.id);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="isolated-collector-workspace"
      className="siah-light-surface relative min-h-screen bg-[#050505] text-white pb-24 overflow-hidden select-none"
    >
      {/* Animated WebGL1 "Mesh drift" Blobs Shader Background */}
      <MeshDriftCanvas isDark={isDark} />
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/25" />

      {/* =====================================================================
       * 1. CLEAN TOP NAVBAR (Zero Rounded Pills, Zero Brackets)
       * Right: «سیاه و سفید» | Center: «گالری آثار» | Left: «بازگشت به صفحه اصلی ↖»
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
        {/* ===================================================================
         * 2. CENTERED PAGE HEADER WITH ELASTIC SVG DIVIDER
         * ================================================================= */}
        <div
          onPointerMove={(e) => handleElasticLineMove(e, headerLineWrapRef, headerLinePathRef)}
          onPointerLeave={() => handleElasticLineLeave(headerLinePathRef)}
          className="relative text-center mx-auto flex flex-col items-center justify-center space-y-3 pb-8"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white text-center mx-auto flex flex-col items-center justify-center w-full">
            <FoldText
              text={t('پنل هنردوست و مدیریت کیف‌پول', 'Collector Profile & Provenance Wallet')}
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

          <p className="text-sm sm:text-base font-light text-white/75 text-center mx-auto">
            {activeCollector.fullName}
            <span className="mx-3 opacity-45">·</span>
            <span className="font-mono-archival text-xs text-white/70">{activeCollector.email}</span>
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

        {/* ===================================================================
         * MAIN 2-COLUMN WORKSPACE:
         * Right Card (7 cols in RTL): «موجودی حساب و شارژ آنی کیف‌پول»
         * Left Card (5 cols in RTL): «ویرایش مشخصات فردی هنردوست»
         * ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* =================================================================
           * 4. RIGHT CARD — «موجودی حساب و شارژ آنی کیف‌پول» (Architectural Wallet Monolith)
           * =============================================================== */}
          <div
            data-testid="collector-wallet-monolith"
            className="group/wallet relative lg:col-span-7 bg-[#050505]/70 backdrop-blur-xl rounded-none border-0 p-7 sm:p-10 space-y-8"
          >
            {/* Top-Right Progressive 1px White SVG Perimeter Border Draw */}
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
                className="[stroke-dasharray:4200] [stroke-dashoffset:4200] opacity-0 group-hover/wallet:opacity-100 group-focus-within/wallet:opacity-100 group-hover/wallet:[stroke-dashoffset:0] group-focus-within/wallet:[stroke-dashoffset:0] transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>

            {/* Centered Heading + Monumental Live Balance Display + Elastic SVG Divider */}
            <div
              onPointerMove={(e) => handleElasticLineMove(e, balanceLineWrapRef, balanceLinePathRef)}
              onPointerLeave={() => handleElasticLineLeave(balanceLinePathRef)}
              className="relative z-10 text-center flex flex-col items-center justify-center space-y-4 pb-8"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white text-center mx-auto">
                <FoldText
                  text={t('موجودی حساب و شارژ آنی کیف‌پول', 'Wallet Balance & Instant Top-Up')}
                  splitBy="word"
                  foldStyle="paper"
                  trigger="mount"
                  hoverRefold={false}
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                  style={{ textAlign: 'center', lineHeight: 1.3 }}
                />
              </h2>

              <span className="text-xs font-light text-white/60">
                {t(
                  'موجودی قابل استفاده جهت خرید آثار:',
                  'Available Balance for Artwork Acquisitions:'
                )}
              </span>

              <p
                ref={balanceDisplayRef}
                data-testid="collector-wallet-balance"
                className="text-5xl md:text-6xl font-bold text-white tabular-nums py-1"
              >
                {formatPrice(activeCollector.walletBalance)}
              </p>

              {/* Elastic Divider Line Underneath Balance */}
              <div
                ref={balanceLineWrapRef}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[10px] inset-x-0 h-[24px] w-full overflow-visible"
              >
                <svg
                  viewBox="0 0 1000 24"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    ref={balanceLinePathRef}
                    d="M 0 12 Q 500 12 1000 12"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {topUpSuccessMsg && (
              <div className="relative z-10 py-3 px-4 bg-white/5 border border-white/40 rounded-none text-white text-xs font-light text-center">
                {topUpSuccessMsg}
              </div>
            )}

            {/* Top-Up Form */}
            <form onSubmit={handleExecuteTopUp} className="relative z-10 space-y-7">
              {/* Quick Top-Up Tiles: Zero Border at Rest (border-0), Top-Right SVG Draw on Hover */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-white/80">
                  {t(
                    'انتخاب بسته شارژ سریع (تومان):',
                    'Select Quick Top-Up Package (Toman):'
                  )}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LUXURY_TOP_UP_AMOUNTS.map((amt) => {
                    const isSelected = selectedTopUp === amt && !customTopUp;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedTopUp(amt);
                          setCustomTopUp('');
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? isDark ? '#ffffff' : '#131313'
                            : 'transparent',
                          color: isSelected
                            ? isDark ? '#050505' : '#fcfcfd'
                            : isDark ? 'rgba(255,255,255,0.8)' : '#000000',
                        }}
                        className={`group/tile relative py-3.5 px-3 text-xs rounded-none border-0 transition-colors duration-300 cursor-pointer focus:outline-none ${
                          isSelected
                            ? isDark ? '!bg-white !text-[#050505] font-semibold' : '!bg-[#131313] !text-[#fcfcfd] font-semibold'
                            : isDark ? 'bg-transparent text-white/80 hover:text-white font-light' : 'bg-transparent !text-[#000000] font-light'
                        }`}
                      >
                        {!isSelected && (
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
                              className="[stroke-dasharray:460] [stroke-dashoffset:460] opacity-0 group-hover/tile:opacity-100 group-hover/tile:[stroke-dashoffset:0] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            />
                          </svg>
                        )}
                        <span className="relative z-20 !text-inherit">
                          {lang === 'fa'
                            ? `+ ${(amt / 1000000).toLocaleString('fa-IR')} میلیون تومان`
                            : `+ ${amt / 1000000}M Toman`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Input: Bottom-Line Architectural Input */}
              <div className="group relative pt-1">
                <label
                  htmlFor="custom-topup-input"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    customTopUp.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/65 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t(
                    'یا وارد کردن مبلغ دلخواه (به تومان):',
                    'Or Enter Custom Amount (in Toman):'
                  )}
                </label>
                <div className="relative">
                  <input
                    id="custom-topup-input"
                    type="number"
                    dir="ltr"
                    step={1000000}
                    value={customTopUp}
                    onChange={(e) => setCustomTopUp(e.target.value)}
                    placeholder={t('مثال: 75000000', 'e.g., 75000000')}
                    className="peer w-full border-0 border-b border-white/25 bg-transparent rounded-none px-0 py-3 text-white text-sm font-mono-archival text-left focus:outline-none placeholder:text-white/25"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
              </div>

              {/* Payment Button: Clean Centered Text Inside Sharp 90deg Inverted White Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="collector-topup-submit-btn"
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`w-full py-4 px-6 rounded-none border text-xs sm:text-sm font-semibold text-center transition-all duration-300 cursor-pointer focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <span className="!text-inherit">
                    {t(
                      'پرداخت امن و افزایش آنی موجودی حساب',
                      'Instant Secure Wallet Deposit'
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* =================================================================
           * 3. LEFT CARD — «ویرایش مشخصات فردی هنردوست» (Transparent Monolith + Bottom-Line Inputs)
           * =============================================================== */}
          <div
            data-testid="collector-profile-monolith"
            className="group/profile relative lg:col-span-5 bg-[#050505]/70 backdrop-blur-xl rounded-none border-0 p-7 sm:p-9 space-y-7"
          >
            {/* Top-Right Progressive 1px White SVG Perimeter Border Draw on Hover/Focus */}
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
                className="[stroke-dasharray:3600] [stroke-dashoffset:3600] opacity-0 group-hover/profile:opacity-100 group-focus-within/profile:opacity-100 group-hover/profile:[stroke-dashoffset:0] group-focus-within/profile:[stroke-dashoffset:0] transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </svg>

            {/* Centered Heading + Elastic Hairline Divider */}
            <div
              onPointerMove={(e) => handleElasticLineMove(e, profileLineWrapRef, profileLinePathRef)}
              onPointerLeave={() => handleElasticLineLeave(profileLinePathRef)}
              className="relative z-10 text-center flex flex-col items-center justify-center pb-6"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white text-center mx-auto">
                <FoldText
                  text={t('ویرایش مشخصات فردی هنردوست', 'Edit Collector Credentials')}
                  splitBy="word"
                  foldStyle="paper"
                  trigger="mount"
                  hoverRefold={false}
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                  style={{ textAlign: 'center', lineHeight: 1.3 }}
                />
              </h2>

              <div
                ref={profileLineWrapRef}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[10px] inset-x-0 h-[24px] w-full overflow-visible"
              >
                <svg
                  viewBox="0 0 1000 24"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    ref={profileLinePathRef}
                    d="M 0 12 Q 500 12 1000 12"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {profileSaved && (
              <div className="relative z-10 py-3 px-4 bg-white/5 border border-white/40 rounded-none text-white text-xs font-light text-center">
                {t(
                  'اطلاعات پروفایل شما با موفقیت به‌روزرسانی شد.',
                  'Your collector profile has been updated.'
                )}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="relative z-10 space-y-6">
              {/* نام و نام خانوادگی: */}
              <div className="group relative pt-1">
                <label
                  htmlFor="edit-collector-name"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    profileDraft.fullName.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t('نام و نام خانوادگی:', 'Full Name:')}
                </label>
                <div className="relative">
                  <input
                    id="edit-collector-name"
                    type="text"
                    value={profileDraft.fullName}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, fullName: e.target.value })
                    }
                    className="peer w-full border-0 border-b border-white/25 rounded-none bg-transparent px-0 py-3 text-white text-sm focus:outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
              </div>

              {/* نشانی ایمیل: */}
              <div className="group relative pt-1">
                <label
                  htmlFor="edit-collector-email"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    profileDraft.email.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t('نشانی ایمیل:', 'Email Address:')}
                </label>
                <div className="relative">
                  <input
                    id="edit-collector-email"
                    type="email"
                    dir="ltr"
                    value={profileDraft.email}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, email: e.target.value })
                    }
                    className="peer w-full border-0 border-b border-white/25 rounded-none bg-transparent px-0 py-3 text-white text-sm font-mono-archival text-left focus:outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
              </div>

              {/* شماره تماس: */}
              <div className="group relative pt-1">
                <label
                  htmlFor="edit-collector-phone"
                  className={`block text-xs font-medium transition-all duration-300 ${
                    profileDraft.phone.trim().length > 0
                      ? '-translate-y-1 text-white'
                      : 'text-white/60 group-focus-within:-translate-y-1 group-focus-within:text-white'
                  }`}
                >
                  {t('شماره تماس:', 'Phone Number:')}
                </label>
                <div className="relative">
                  <input
                    id="edit-collector-phone"
                    type="tel"
                    dir="ltr"
                    value={profileDraft.phone}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, phone: e.target.value })
                    }
                    className="peer w-full border-0 border-b border-white/25 rounded-none bg-transparent px-0 py-3 text-white text-sm font-mono-archival text-left focus:outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 inset-x-0 bg-white h-[1.5px] scale-x-0 peer-focus:scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="collector-save-profile-btn"
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#131313',
                    color: isDark ? '#050505' : '#fcfcfd',
                  }}
                  className={`w-full py-4 px-6 rounded-none border text-xs sm:text-sm font-semibold text-center transition-all duration-300 cursor-pointer focus:outline-none ${
                    isDark ? '!bg-white !text-[#050505] border-white' : '!bg-[#131313] !text-[#fcfcfd] border-[#131313]'
                  }`}
                >
                  <span className="!text-inherit">{t('ذخیره مشخصات فردی', 'Save Collector Profile')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ===================================================================
         * 5. BOTTOM SECTIONS — «گنجینه آثار خریداری‌شده» & «تاریخچه تراکنش‌های کیف‌پول»
         * Elastic SVG String Divider + Transparent Sharp-Cornered Blocks
         * ================================================================= */}
        <div
          onPointerMove={(e) => handleElasticLineMove(e, bottomLineWrapRef, bottomLinePathRef)}
          onPointerLeave={() => handleElasticLineLeave(bottomLinePathRef)}
          className="relative pt-12"
        >
          {/* Elastic SVG String Divider Above Bottom Sections */}
          <div
            ref={bottomLineWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-[24px] w-full overflow-visible"
          >
            <svg
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <path
                ref={bottomLinePathRef}
                d="M 0 12 Q 500 12 1000 12"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Section A: گنجینه آثار خریداری‌شده */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {t(
                  `گنجینه آثار خریداری‌شده (${acquiredArtworks.length.toLocaleString('fa-IR')})`,
                  `Acquired Collection (${acquiredArtworks.length})`
                )}
              </h3>

              {acquiredArtworks.length === 0 ? (
                <div className="group relative p-10 bg-transparent rounded-none border-0 text-xs sm:text-sm font-light text-white/65 leading-relaxed">
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
                      className="[stroke-dasharray:1800] [stroke-dashoffset:1800] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </svg>
                  <p>
                    {t(
                      'شما هنوز اثری خریداری نکرده‌اید. از بخش «گالری آثار» اثر دلخواه خود را انتخاب نمایید.',
                      'You have not acquired any artworks yet. Explore the Exhibition Gallery to acquire your first piece.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acquiredArtworks.map((art) => (
                    <div
                      key={art.id}
                      data-testid={`acquired-artwork-card-${art.id}`}
                      className="group relative p-5 bg-transparent rounded-none border-0 flex items-center justify-between gap-4"
                    >
                      {/* Top-Right 1px White SVG Perimeter Border on Hover */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 z-10 w-full h-full overflow-visible"
                      >
                        <path
                          d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                          className="[stroke-dasharray:1800] [stroke-dashoffset:1800] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                      </svg>

                      <div className="relative z-20 flex items-center gap-4">
                        <div className="w-16 h-12 bg-black/50 rounded-none overflow-hidden shrink-0">
                          <img
                            src={art.image}
                            alt={t(art.title, art.titleEn)}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-light text-white/60 block">
                            {art.accessionCode} · {art.artistName}
                          </span>
                          <p className="text-sm font-bold text-white">
                            {t(art.title, art.titleEn)}
                          </p>
                        </div>
                      </div>

                      <span className="relative z-20 text-sm font-bold text-white tabular-nums">
                        {formatPrice(art.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B: تاریخچه تراکنش‌های کیف‌پول */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {t(
                  `تاریخچه تراکنش‌های کیف‌پول (${userTransactions.length.toLocaleString('fa-IR')})`,
                  `Wallet Transaction Ledger (${userTransactions.length})`
                )}
              </h3>

              <div className="space-y-3">
                {userTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    data-testid={`collector-tx-row-${tx.id}`}
                    className="group relative p-5 bg-transparent rounded-none border-0 flex items-center justify-between gap-4 text-xs"
                  >
                    {/* Top-Right 1px White SVG Perimeter Border on Hover */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-0 z-10 w-full h-full overflow-visible"
                    >
                      <path
                        d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        className="[stroke-dasharray:1800] [stroke-dashoffset:1800] opacity-0 group-hover:opacity-100 group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      />
                    </svg>

                    <div className="relative z-20 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white/65 font-light">
                          {tx.referenceCode}
                        </span>
                        <span className="text-white/35">·</span>
                        <span className="font-semibold text-white">
                          {tx.type === 'TOP_UP'
                            ? t('افزایش موجودی کیف‌پول', 'Wallet Top-Up Deposit')
                            : `${t('خرید اثر:', 'Artwork Acquisition:')} ${tx.artworkTitle || ''}`}
                        </span>
                      </div>
                      <p className="text-[11px] font-light text-white/50 tabular-nums">
                        {tx.timestamp}
                      </p>
                    </div>

                    {/* Monochrome Pure White Amount (#FFFFFF) */}
                    <span className="relative z-20 font-bold text-sm text-[#FFFFFF] tabular-nums whitespace-nowrap">
                      {tx.type === 'TOP_UP' ? '+' : '−'} {formatPrice(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
