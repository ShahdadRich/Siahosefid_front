import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlueCanvas } from './FlueCanvas';
import BlurText from './BlurText';
import FoldText from './FoldText';
import SoftAurora from './SoftAurora';
import { MeshDriftCanvas } from './MeshDriftCanvas';
import { ArtworkItem } from '../data/siahSefidData';
import { usePreferences } from '../context/PreferencesContext';

gsap.registerPlugin(ScrollTrigger);

interface LandingViewProps {
  metrics: {
    totalMembers: number;
    activeArtists: number;
    curatedArtworks: number;
    availableArtworks: number;
    soldArtworks: number;
    totalWalletBalance: number;
  };
  featuredArtworks: ArtworkItem[];
  onOpenRoleModal: (role: 'ARTIST' | 'COLLECTOR') => void;
}

const MANIFESTO_VERSES = [
  {
    index: '۰۱ / خاستگاه اثر',
    title: 'خلوت استودیو و تولد اثر',
    body: 'هر اثر اصیل در سکوت مطلق میان روشنایی بوم و سیاهی مرکب شکل می‌گیرد؛ جایی که هنرمند مستقل، روایت زیسته‌ی خود را بدون مداخله‌ی جریان‌های تجاری در بافت متریال جاودانه می‌سازد.',
  },
  {
    index: '۰۲ / گفتگوی بصری',
    title: 'معماری سکوت و تماشای خالص',
    body: '«سیاه و سفید» یک فروشگاه پرهیاهو نیست؛ فضایی است با هندسه‌ی دقیق تحریری سوئیسی که هر اثر را در قاب سکوت می‌نشاند تا چشم مخاطب پیش از قیمت، با روح اثر روبه‌رو شود.',
  },
  {
    index: '۰۳ / پاسداری از هنر',
    title: 'پیمان ماندگاری میان خالق و کلکسیونر',
    body: 'وقتی هنردوستی اثری را در این آرشیو برمی‌گزیند، تنها یک شیء را تملک نمی‌کند؛ بلکه پاسدار شناسنامه، اصالت و تداوم حیات فرهنگ تجسمی معاصر ایران می‌شود.',
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  metrics,
  onOpenRoleModal,
}) => {
  const { isDark } = usePreferences();
  const headerLineWrapRef = useRef<HTMLDivElement | null>(null);
  const headerLinePathRef = useRef<SVGPathElement | null>(null);
  const verticalLineWrapRef = useRef<HTMLDivElement | null>(null);
  const verticalLinePathRef = useRef<SVGPathElement | null>(null);
  const cardsGridRef = useRef<HTMLDivElement | null>(null);
  const artistDividerWrapRef = useRef<HTMLDivElement | null>(null);
  const artistDividerPathRef = useRef<SVGPathElement | null>(null);
  const collectorDividerWrapRef = useRef<HTMLDivElement | null>(null);
  const collectorDividerPathRef = useRef<SVGPathElement | null>(null);
  const metricsSectionRef = useRef<HTMLDivElement | null>(null);
  const metricsLineWrapRef = useRef<HTMLDivElement | null>(null);
  const metricsLinePathRef = useRef<SVGPathElement | null>(null);
  const membersCountRef = useRef<HTMLSpanElement | null>(null);
  const artistsCountRef = useRef<HTMLSpanElement | null>(null);
  const artworksCountRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerLineWrapRef.current) {
        gsap.fromTo(
          headerLineWrapRef.current,
          { scaleX: 0, transformOrigin: 'right center' },
          {
            scaleX: 1,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerLineWrapRef.current,
              start: 'top 92%',
              once: true,
            },
            onComplete: () => {
              if (headerLineWrapRef.current) {
                headerLineWrapRef.current.style.transform = 'none';
              }
            },
          }
        );
      }

      if (verticalLineWrapRef.current) {
        gsap.fromTo(
          verticalLineWrapRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: verticalLineWrapRef.current,
              start: 'top 90%',
              once: true,
            },
            onComplete: () => {
              if (verticalLineWrapRef.current) {
                verticalLineWrapRef.current.style.transform = 'none';
              }
            },
          }
        );
      }

      if (metricsLineWrapRef.current) {
        gsap.fromTo(
          metricsLineWrapRef.current,
          { scaleX: 0, transformOrigin: 'right center' },
          {
            scaleX: 1,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: metricsLineWrapRef.current,
              start: 'top 95%',
              once: true,
            },
            onComplete: () => {
              if (metricsLineWrapRef.current) {
                metricsLineWrapRef.current.style.transform = 'none';
              }
            },
          }
        );
      }

      if (metricsSectionRef.current) {
        const counterObj = { members: 0, artists: 0, artworks: 0 };
        gsap.to(counterObj, {
          members: metrics.totalMembers,
          artists: metrics.activeArtists,
          artworks: metrics.curatedArtworks,
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: metricsSectionRef.current,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (membersCountRef.current) {
              membersCountRef.current.textContent = Math.round(counterObj.members).toLocaleString('fa-IR');
            }
            if (artistsCountRef.current) {
              artistsCountRef.current.textContent = Math.round(counterObj.artists).toLocaleString('fa-IR');
            }
            if (artworksCountRef.current) {
              artworksCountRef.current.textContent = Math.round(counterObj.artworks).toLocaleString('fa-IR');
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [metrics.totalMembers, metrics.activeArtists, metrics.curatedArtworks]);

  const handleHeaderLineMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = headerLineWrapRef.current;
    const path = headerLinePathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 1000;
    const offsetY = Math.max(-10, Math.min(10, (e.clientY - (rect.top + rect.height / 2)) * 0.65));
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${relX.toFixed(1)} ${(12 + offsetY).toFixed(1)} 1000 12` },
      duration: 0.2,
       overwrite: 'auto',
    });
  };

  const handleHeaderLineLeave = () => {
    const path = headerLinePathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 0.75,
      ease: 'elastic.out(1, 0.35)',
      overwrite: 'auto',
    });
  };

  const handleVerticalLineMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = verticalLineWrapRef.current;
    const path = verticalLinePathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    const relY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 1000;
    const offsetX = Math.max(-10, Math.min(10, (e.clientX - (rect.left + rect.width / 2)) * 0.65));
    gsap.to(path, {
      attr: { d: `M 12 0 Q ${(12 + offsetX).toFixed(1)} ${relY.toFixed(1)} 12 1000` },
      duration: 0.2,
      overwrite: 'auto',
    });
  };

  const handleVerticalLineLeave = () => {
    const path = verticalLinePathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 12 0 Q 12 500 12 1000' },
      duration: 0.75,
      ease: 'elastic.out(1, 0.35)',
      overwrite: 'auto',
    });
  };

  const handleGatewayPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
    wrapRef: React.RefObject<HTMLDivElement | null>,
    pathRef: React.RefObject<SVGPathElement | null>
  ) => {
    const cardRect = e.currentTarget.getBoundingClientRect();
    if (cardRect.width > 0 && cardRect.height > 0) {
      const spotX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
      const spotY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
      e.currentTarget.style.setProperty('--spot-x', `${spotX.toFixed(1)}%`);
      e.currentTarget.style.setProperty('--spot-y', `${spotY.toFixed(1)}%`);
    }

    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 1000;
    const offsetY = Math.max(-10, Math.min(10, (e.clientY - (rect.top + rect.height / 2)) * 0.55));
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${relX.toFixed(1)} ${(12 + offsetY).toFixed(1)} 1000 12` },
      duration: 0.2,
      overwrite: 'auto',
    });
  };

  const handleGatewayPointerLeave = (
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

  const handleMetricsLineMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = metricsLineWrapRef.current;
    const path = metricsLinePathRef.current;
    if (!wrap || !path) return;
    const rect = wrap.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 1000;
    const offsetY = Math.max(-12, Math.min(12, (e.clientY - (rect.top + rect.height / 2)) * 0.55));
    gsap.to(path, {
      attr: { d: `M 0 12 Q ${relX.toFixed(1)} ${(12 + offsetY).toFixed(1)} 1000 12` },
      duration: 0.2,
      overwrite: 'auto',
    });
  };

  const handleMetricsLineLeave = () => {
    const path = metricsLinePathRef.current;
    if (!path) return;
    gsap.to(path, {
      attr: { d: 'M 0 12 Q 500 12 1000 12' },
      duration: 0.75,
      ease: 'elastic.out(1, 0.35)',
      overwrite: 'auto',
    });
  };

  const scrollToActTwo = () => {
    const el = document.getElementById('act-manifesto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      dir="rtl"
      className={`w-full select-none transition-colors duration-300 ${
        isDark ? 'bg-[#0A0A0A] text-[#eceff5]' : 'bg-[#f5f4f0] text-[#000000]'
      }`}
    >
      {/* =====================================================================
       * ACT I — PURE IMMERSION (100vh Hero)
       * Fullscreen WebGL2 Flue smoke shader, monumental typography, zero CTAs,
       * subtle hairline [SCROLL TO ENTER] indicator inside the Hero.
       * =================================================================== */}
      <section
        data-testid="act-1-hero"
        className="relative h-screen w-full flex flex-col justify-end"
      >
        {/* Exact WebGL2 Flue Smoke Shader at z-0 with 130vh height and bottom mask-image fade */}
        <FlueCanvas theme={isDark ? 'dark' : 'light'} />

        {/* Monumental Centered Typography & [ACT I] Bar (mix-blend-difference at z-20) */}
        <div
          data-testid="hero-blend-wrapper"
          className="relative z-20 mix-blend-difference text-white pointer-events-none select-none max-w-[1440px] w-full h-screen mx-auto px-6 md:px-12 pt-20 pb-16 md:pb-20 flex flex-col justify-between shrink-0"
        >
          <div className="my-auto flex flex-col items-center justify-center text-center space-y-6 text-white w-full">
            <BlurText
              as="h1"
              text="سیاه و سفید"
              color="#FFFFFF"
              effect="blur"
              animateBy="words"
              direction="top"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={50}
              className="w-full justify-center text-center font-black text-7xl sm:text-8xl md:text-[8.5rem] lg:text-[10rem] leading-[0.9] text-white"
            />

            <BlurText
              as="p"
              text="«مرزی میان نور، تاریکی و جاودانگی اثر»"
              color="#FFFFFF"
              effect="blur"
              animateBy="words"
              direction="top"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={50}
              className="w-full justify-center text-center mx-auto font-light text-xl sm:text-3xl md:text-4xl text-white max-w-2xl"
            />
          </div>

          {/* Top Horizontal Divider Line */}
          <div className="w-full border-t border-white" />
        </div>
      </section>

      {/* =====================================================================
       * ACT II — THE MANIFESTO & PHILOSOPHY (Editorial Narrative Section)
       * Horizontal glowing SoftAurora wave background untouched at inset-0 z-0,
       * with mix-blend-difference, 100% pure #FFFFFF FoldText typography, and
       * interactive scroll-drawn / mouse-reactive divider lines.
       * =================================================================== */}
      <section
        id="act-manifesto"
        data-testid="act-2-manifesto"
        className="relative bg-transparent pt-20 md:pt-28 pb-10 md:pb-14 px-6 md:px-12 overflow-hidden"
      >
        <div
          className="absolute inset-x-0 top-0 h-[950px] z-0 pointer-events-none"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 12%, rgba(0, 0, 0, 1) 28%, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.35) 86%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 12%, rgba(0, 0, 0, 1) 28%, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.35) 86%, transparent 100%)',
          }}
        >
          <SoftAurora
            speed={0.6}
            scale={1.5}
            brightness={isDark ? 0.8 : 1.35}
            color1="#ffffff"
            color2="#000000"
            bandHeight={0.55}
            bandSpread={1}
            enableMouseInteraction
            mouseInfluence={0.25}
            spectrum={0.2}
            noiseAmplitude={1.6}
            lightMode={!isDark}
          />
        </div>

        {/* Manifesto Content Wrapper — Non-isolated so children with mix-blend-difference blend directly with SoftAurora */}
        <div
          data-testid="manifesto-blend-wrapper"
          className="max-w-[1440px] mx-auto space-y-12 bg-transparent -mt-20 pt-6"
        >
          {/* 1. Editorial Section Index Header, Main Heading, Subtitle & Interactive Scroll-Drawn Divider Line (Center Aligned) */}
          <div
            onPointerMove={handleHeaderLineMove}
            onPointerLeave={handleHeaderLineLeave}
            className="relative z-10 mix-blend-difference text-white bg-transparent flex flex-col items-center justify-center text-center mx-auto w-full gap-6 pb-10"
          >
            <div className="space-y-3 bg-transparent text-white text-center mx-auto flex flex-col items-center justify-center w-full">
              <h2 className="text-3xl sm:text-5xl md:text-6xl leading-[1.35] text-white flex flex-col items-center justify-center text-center gap-2 w-full">
                <FoldText
                  text="مانیفست «سیاه و سفید»؛"
                  foldStyle="paper"
                  splitBy="word"
                  hinge="top"
                  trigger="scroll"
                  foldAngle={92}
                  duration={0.7}
                  stagger={0.06}
                  hoverRefold={true}
                  refoldRadius={150}
                  refoldAngle={45}
                  fontWeight={700}
                  color="#FFFFFF"
                  className="font-bold text-white text-center justify-center"
                  style={{ letterSpacing: '0em', lineHeight: 1.35, textAlign: 'center' }}
                />
                <FoldText
                  text="آرشیوی برای زیستنِ جاودانه‌ی هنر."
                  foldStyle="paper"
                  splitBy="word"
                  hinge="top"
                  trigger="scroll"
                  foldAngle={92}
                  duration={0.7}
                  stagger={0.06}
                  hoverRefold={true}
                  refoldRadius={150}
                  refoldAngle={45}
                  fontWeight={200}
                  color="#FFFFFF"
                  className="font-extralight text-white text-center justify-center"
                  style={{ letterSpacing: '0em', lineHeight: 1.35, textAlign: 'center' }}
                />
              </h2>
            </div>

            {/* Single Interactive Scroll-Drawn & Elastic Mouse-Reactive SVG Hairline (No duplicate CSS border) */}
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

          {/* 2. Large 2-Column Editorial Statement & Body Paragraphs (Pure #FFFFFF + mix-blend-difference + FoldText) */}
          <div
            onPointerMove={handleVerticalLineMove}
            onPointerLeave={handleVerticalLineLeave}
            className="relative z-10 mix-blend-difference text-white bg-transparent grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
          >
            <div className="lg:col-span-5 bg-transparent text-white">
              <p className="text-xl sm:text-2xl leading-relaxed font-bold text-white">
                <FoldText
                  text="ما بر این باوریم که اثر هنری نیازمند هیاهو نیست؛ نیازمند فضایی است که در آن فرم، بافت و اندیشه‌ی خالق اثر در خالص‌ترین کنتراست ممکن دیده و درک شود."
                  foldStyle="paper"
                  splitBy="word"
                  hinge="bottom"
                  trigger="scroll"
                  duration={0.55}
                  stagger={0.025}
                  hoverRefold={true}
                  refoldRadius={120}
                  refoldAngle={35}
                  fontWeight={700}
                  color="#FFFFFF"
                  style={{ letterSpacing: '0em', lineHeight: 1.65 }}
                />
              </p>
            </div>

            <div className="relative lg:col-span-7 text-base sm:text-lg leading-loose font-light text-white space-y-6 ps-6 md:ps-10 bg-transparent">
              {/* Single Interactive Scroll-Drawn & Elastic Mouse-Reactive Vertical SVG Hairline (No duplicate CSS border) */}
              <div
                ref={verticalLineWrapRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 -start-[12px] w-[24px] h-full overflow-visible"
              >
                <svg
                  viewBox="0 0 24 1000"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    ref={verticalLinePathRef}
                    d="M 12 0 Q 12 500 12 1000"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              <p className="text-white">
                <FoldText
                  text="در دنیای اشباع‌شده از تصاویر گذرا، «سیاه و سفید» به عنوان یک پناهگاه کیوریتوریال شکل گرفته است. در اینجا، هنرمندان تجسمی بخشی از روح و زیست خود را در قالب نقاشی، خط‌نقاشی، مجسمه و عکاسی ثبت می‌کنند و هر اثر با شناسنامه‌ی دقیق آرشیوی مستند می‌شود."
                  foldStyle="paper"
                  splitBy="word"
                  hinge="bottom"
                  trigger="scroll"
                  duration={0.55}
                  stagger={0.025}
                  hoverRefold={true}
                  refoldRadius={120}
                  refoldAngle={35}
                  fontWeight={300}
                  color="#FFFFFF"
                  style={{ letterSpacing: '0em', lineHeight: 1.85 }}
                />
              </p>
              <p className="text-white">
                <FoldText
                  text="در سوی دیگر این گفتگو، هنردوستان و کلکسیونرها قرار دارند؛ کسانی که با نگاه دقیق و انتخاب آگاهانه، پیوند میان کارگاه خلاقیت هنرمند و مجموعه‌های ماندگار فردا را برقرار می‌سازند."
                  foldStyle="paper"
                  splitBy="word"
                  hinge="bottom"
                  trigger="scroll"
                  duration={0.55}
                  stagger={0.025}
                  hoverRefold={true}
                  refoldRadius={120}
                  refoldAngle={35}
                  fontWeight={300}
                  color="#FFFFFF"
                  style={{ letterSpacing: '0em', lineHeight: 1.85 }}
                />
              </p>
            </div>
          </div>

          {/* 3. 3-Column Swiss Structural Grid of Manifesto Pillars */}
          <div
            ref={cardsGridRef}
            className="relative z-10 mix-blend-difference text-white bg-transparent grid grid-cols-1 md:grid-cols-3 mt-12 pt-8"
          >
            {MANIFESTO_VERSES.map((verse) => (
              <article
                key={verse.index}
                className="group relative p-8 md:p-12 flex flex-col justify-between items-center text-center gap-8 bg-transparent text-white"
              >
                {/* Continuous 4-Edge Perimeter Draw Starting from Top-Right Corner (650ms total) */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {/* 1. Top Edge: Top-Right -> Top-Left */}
                  <span className="absolute top-0 inset-x-0 h-[1px] bg-white/85 origin-right scale-x-0 transition-transform duration-[170ms] ease-linear delay-[480ms] group-hover:scale-x-100 group-hover:delay-[0ms]" />
                  {/* 2. Left Edge: Top-Left -> Bottom-Left */}
                  <span className="absolute inset-y-0 left-0 w-[1px] bg-white/85 origin-top scale-y-0 transition-transform duration-[160ms] ease-linear delay-[320ms] group-hover:scale-y-100 group-hover:delay-[170ms]" />
                  {/* 3. Bottom Edge: Bottom-Left -> Bottom-Right */}
                  <span className="absolute bottom-0 inset-x-0 h-[1px] bg-white/85 origin-left scale-x-0 transition-transform duration-[170ms] ease-linear delay-[150ms] group-hover:scale-x-100 group-hover:delay-[330ms]" />
                  {/* 4. Right Edge: Bottom-Right -> Top-Right */}
                  <span className="absolute inset-y-0 right-0 w-[1px] bg-white/85 origin-bottom scale-y-0 transition-transform duration-[150ms] ease-out delay-[0ms] group-hover:scale-y-100 group-hover:delay-[500ms]" />
                </div>

                <div className="space-y-4 bg-transparent text-white pt-2 flex flex-col items-center justify-center text-center w-full">
                  <h3 className="text-2xl font-bold text-white text-center flex flex-col items-center justify-center w-full">
                    <FoldText
                      text={verse.title}
                      splitBy="word"
                      foldStyle="paper"
                      hinge="top"
                      trigger="scroll"
                      duration={0.65}
                      stagger={0.04}
                      hoverRefold={false}
                      fontWeight={700}
                      color="#FFFFFF"
                      className="text-center justify-center"
                      style={{ letterSpacing: '0em', lineHeight: 1.45, textAlign: 'center' }}
                    />
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed font-light text-white text-center flex flex-col items-center justify-center w-full">
                    <FoldText
                      text={verse.body}
                      splitBy="word"
                      foldStyle="paper"
                      hinge="top"
                      trigger="scroll"
                      duration={0.6}
                      stagger={0.04}
                      hoverRefold={false}
                      fontWeight={300}
                      color="#FFFFFF"
                      className="text-center justify-center"
                      style={{ letterSpacing: '0em', lineHeight: 1.75, textAlign: 'center' }}
                    />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * ACT IV — THE CLIMAX: ROLE SELECTION & LIVE ARCHIVE METRICS
       * =================================================================== */}
      <section
        id="landing-role-ctas"
        data-testid="act-4-climax-gateway"
        className="relative bg-transparent text-[#eceff5] pt-10 md:pt-14"
      >
        <div
          className="absolute inset-x-0 top-0 h-[950px] z-0 pointer-events-none"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 12%, rgba(0, 0, 0, 1) 28%, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.35) 86%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 12%, rgba(0, 0, 0, 1) 28%, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.35) 86%, transparent 100%)',
          }}
        >
          <SoftAurora
            speed={0.6}
            scale={1.5}
            brightness={isDark ? 0.8 : 1.35}
            color1="#ffffff"
            color2="#000000"
            bandHeight={0.55}
            bandSpread={1}
            enableMouseInteraction
            mouseInfluence={0.25}
            spectrum={0.2}
            noiseAmplitude={1.6}
            lightMode={!isDark}
          />
        </div>
        {/* Non-isolated wrapper so mix-blend-difference blends directly with the SoftAurora wave at z-0 */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-16 md:pb-24 space-y-14 bg-transparent">
          {/* Climax Header — Center Aligned with FoldText & mix-blend-difference */}
          <div className="relative z-10 max-w-4xl mx-auto space-y-4 text-center flex flex-col items-center justify-center mix-blend-difference text-white bg-transparent">
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.25] text-white text-center flex flex-col items-center justify-center">
              <FoldText
                text="جایگاه خود را در آرشیو «سیاه و سفید» انتخاب کنید"
                splitBy="word"
                foldStyle="paper"
                hinge="top"
                trigger="scroll"
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={42}
                color="#FFFFFF"
                fontWeight={900}
                className="text-center justify-center"
                style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.25 }}
              />
            </h2>
            <p className="text-sm sm:text-base text-white leading-relaxed text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
              <FoldText
                text="برای ورود به نمایشگاه آثار و دسترسی به امکانات اختصاصی پلتفرم، نقش خود را مشخص نمایید تا فرم ثبت‌نام و ورود متناسب با شما باز شود."
                splitBy="word"
                foldStyle="paper"
                hinge="top"
                trigger="scroll"
                hoverRefold={true}
                refoldRadius={140}
                refoldAngle={42}
                color="#FFFFFF"
                fontWeight={300}
                className="text-center justify-center"
                style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.7 }}
              />
            </p>
          </div>

          {/* Pure Swiss Architectural Editorial Gateways (Zero Rounded Corners, 100% Transparent Resting State) */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 w-full bg-transparent">
            {/* Gateway 1: هنرمندم */}
            <button
              type="button"
              onClick={() => onOpenRoleModal('ARTIST')}
              onPointerMove={(e) => handleGatewayPointerMove(e, artistDividerWrapRef, artistDividerPathRef)}
              onPointerLeave={() => handleGatewayPointerLeave(artistDividerPathRef)}
              data-testid="cta-role-artist"
              className={`group relative rounded-none bg-transparent p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none min-h-[340px] overflow-hidden border transition-colors duration-500 ${
                isDark
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-[#d6d5d2] hover:border-[#131313]'
              }`}
            >
              {/* 1. Top-Right Progressive SVG Border Draw (700ms cubic-bezier(0.22, 1, 0.36, 1)) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
              >
                <path
                  d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                  fill="none"
                  stroke={isDark ? 'rgba(255, 255, 255, 0.85)' : '#131313'}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* 2. "Siah o Sefid" Architectural Hover Curtain / Spotlight */}
              <div
                aria-hidden="true"
                style={{ transformOrigin: 'var(--spot-x, 50%) var(--spot-y, 50%)' }}
                className={`pointer-events-none absolute inset-0 z-10 scale-0 group-hover:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDark ? 'bg-white' : 'bg-[#141314]'
                }`}
              />

              {/* 3. Centered Editorial Typography (Choreographed Reveal on Hover) */}
              <div className="relative z-20 role-gateway-content bg-transparent flex flex-col items-center justify-center text-center w-full h-full px-4">
                {/* Main Title: Dead-center at rest, glides slightly upward on hover */}
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-center flex flex-col items-center justify-center">
                    <FoldText
                      text="هنرمندم"
                      splitBy="word"
                      foldStyle="paper"
                      hinge="top"
                      trigger="scroll"
                      hoverRefold={true}
                      refoldRadius={130}
                      refoldAngle={40}
                      color="currentColor"
                      fontWeight={900}
                      className="text-center justify-center"
                      style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.2 }}
                    />
                  </h3>
                </div>

                {/* Choreographed Reveal: First Line, Second Description */}
                <div className="w-full flex flex-col items-center justify-center max-h-0 opacity-0 overflow-hidden translate-y-4 group-hover:max-h-48 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {/* First: Interactive Elastic Horizontal Hairline Divider */}
                  <div
                    ref={artistDividerWrapRef}
                    aria-hidden="true"
                    className="pointer-events-none relative w-full h-[24px] my-3 overflow-visible"
                  >
                    <svg
                      viewBox="0 0 1000 24"
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                    >
                      <path
                        ref={artistDividerPathRef}
                        d="M 0 12 Q 500 12 1000 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        className="transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </svg>
                  </div>

                  {/* Second: Description paragraph */}
                  <p className="text-sm sm:text-base font-light leading-relaxed text-center max-w-sm mx-auto">
                    ثبت‌نام، نام هنری و سبک کاری، ورود به پنل استودیو و عرضه مستقیم آثار.
                  </p>
                </div>
              </div>
            </button>

            {/* Gateway 2: هنردوستم */}
            <button
              type="button"
              onClick={() => onOpenRoleModal('COLLECTOR')}
              onPointerMove={(e) => handleGatewayPointerMove(e, collectorDividerWrapRef, collectorDividerPathRef)}
              onPointerLeave={() => handleGatewayPointerLeave(collectorDividerPathRef)}
              data-testid="cta-role-collector"
              className={`group relative rounded-none bg-transparent p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none min-h-[340px] overflow-hidden border transition-colors duration-500 ${
                isDark
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-[#d6d5d2] hover:border-[#131313]'
              }`}
            >
              {/* 1. Top-Right Progressive SVG Border Draw (700ms cubic-bezier(0.22, 1, 0.36, 1)) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
              >
                <path
                  d="M 100,0 L 0,0 L 0,100 L 100,100 Z"
                  fill="none"
                  stroke={isDark ? 'rgba(255, 255, 255, 0.85)' : '#131313'}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* 2. "Siah o Sefid" Architectural Hover Curtain / Spotlight */}
              <div
                aria-hidden="true"
                style={{ transformOrigin: 'var(--spot-x, 50%) var(--spot-y, 50%)' }}
                className={`pointer-events-none absolute inset-0 z-10 scale-0 group-hover:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDark ? 'bg-white' : 'bg-[#141314]'
                }`}
              />

              {/* 3. Centered Editorial Typography (Choreographed Reveal on Hover) */}
              <div className="relative z-20 role-gateway-content bg-transparent flex flex-col items-center justify-center text-center w-full h-full px-4">
                {/* Main Title: Dead-center at rest, glides slightly upward on hover */}
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-center flex flex-col items-center justify-center">
                    <FoldText
                      text="هنردوستم"
                      splitBy="word"
                      foldStyle="paper"
                      hinge="top"
                      trigger="scroll"
                      hoverRefold={true}
                      refoldRadius={130}
                      refoldAngle={40}
                      color="currentColor"
                      fontWeight={900}
                      className="text-center justify-center"
                      style={{ textAlign: 'center', letterSpacing: '0em', lineHeight: 1.2 }}
                    />
                  </h3>
                </div>

                {/* Choreographed Reveal: First Line, Second Description */}
                <div className="w-full flex flex-col items-center justify-center max-h-0 opacity-0 overflow-hidden translate-y-4 group-hover:max-h-48 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {/* First: Interactive Elastic Horizontal Hairline Divider */}
                  <div
                    ref={collectorDividerWrapRef}
                    aria-hidden="true"
                    className="pointer-events-none relative w-full h-[24px] my-3 overflow-visible"
                  >
                    <svg
                      viewBox="0 0 1000 24"
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                    >
                      <path
                        ref={collectorDividerPathRef}
                        d="M 0 12 Q 500 12 1000 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        className="transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    </svg>
                  </div>

                  {/* Second: Description paragraph */}
                  <p className="text-sm sm:text-base font-light leading-relaxed text-center max-w-sm mx-auto">
                    ایجاد حساب کلکسیونر، کیف‌پول اختصاصی با شارژ آنی و خرید مستقیم آثار هنری.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* =====================================================================
         * LIVE ARCHIVE METRICS & MONUMENTAL FOOTER FINALE
         * =================================================================== */}
        <div
          ref={metricsSectionRef}
          data-testid="live-archive-metrics-footer"
          className="relative w-full bg-transparent pt-8 overflow-hidden"
        >
          {/* Gallery Ambient Background Layer (Dedicated Copy of Exhibition Gallery MeshDrift) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 18%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 18%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)',
            }}
          >
            <MeshDriftCanvas
              isDark={isDark}
              className="absolute inset-0 w-full h-full block pointer-events-none"
              style={{
                backgroundColor: 'transparent',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 18%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 18%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)',
              }}
            />
            <div
              className={`absolute inset-0 pointer-events-none ${
                isDark ? 'bg-black/20' : 'bg-[#f5f4f0]/15'
              }`}
            />
          </div>

          {/* 1. Elastic Mouse-Reactive & Scroll-Drawn SVG String Divider */}
          <div
            onPointerMove={handleMetricsLineMove}
            onPointerLeave={handleMetricsLineLeave}
            className="relative z-10 mix-blend-difference w-full h-[32px] flex items-center justify-center cursor-pointer select-none px-6 md:px-12 mb-10"
          >
            <div
              ref={metricsLineWrapRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 md:inset-x-12 h-[24px] overflow-visible"
            >
              <svg
                viewBox="0 0 1000 24"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <path
                  ref={metricsLinePathRef}
                  d="M 0 12 Q 500 12 1000 12"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          {/* 2. 3 Interactive Architectural Monoliths (mix-blend-difference so they invert over sumi-ink MeshDrift in Light Mode too) */}
          <div className="relative z-10 mix-blend-difference max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Monolith 1: تعداد اعضای سایت */}
            <div
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
              className="group relative flex flex-col items-center justify-center text-center py-14 px-8 overflow-hidden rounded-none bg-transparent cursor-default border-0 transition-colors duration-500"
            >
              {/* Progressive 1px SVG Perimeter Border Draw (Top-Right -> Around) */}
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
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* Cursor-Following Radial Glow Spotlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.09), transparent 80%)',
                }}
              />

              {/* Giant Persian Number on Top with 3D Tilt / Scale Lift */}
              <div className="relative z-20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:-translate-y-1">
                <span
                  ref={membersCountRef}
                  data-testid="metric-total-members"
                  className="block text-5xl md:text-7xl font-bold text-white mb-4"
                >
                  {metrics.totalMembers.toLocaleString('fa-IR')}
                </span>
              </div>

              {/* Elastic Short Horizontal Line that Expands on Hover */}
              <div
                aria-hidden="true"
                className="w-8 group-hover:w-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-white/60 h-[1px] mb-4"
              />

              {/* Persian Title & Unit Centered Below with FoldText */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center gap-1.5">
                <h4 className="text-base sm:text-lg font-medium text-white/90 text-center flex flex-col items-center justify-center">
                  <FoldText
                    text="تعداد اعضای سایت"
                    splitBy="word"
                    foldStyle="paper"
                    hinge="top"
                    trigger="scroll"
                    hoverRefold={true}
                    refoldRadius={120}
                    refoldAngle={35}
                    color="#FFFFFF"
                    fontWeight={500}
                    className="text-center justify-center"
                    style={{ textAlign: 'center', letterSpacing: '0em' }}
                  />
                </h4>
                <span className="text-xs sm:text-sm text-white/50 font-light">
                  <FoldText
                    text="نفر"
                    splitBy="word"
                    trigger="scroll"
                    hoverRefold={true}
                    color="rgba(255, 255, 255, 0.6)"
                    fontWeight={300}
                    className="text-center justify-center"
                    style={{ textAlign: 'center' }}
                  />
                </span>
              </div>
            </div>

            {/* Monolith 2: تعداد هنرمندان */}
            <div
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
              className="group relative flex flex-col items-center justify-center text-center py-14 px-8 overflow-hidden rounded-none bg-transparent cursor-default border-0 transition-colors duration-500"
            >
              {/* Progressive 1px SVG Perimeter Border Draw (Top-Right -> Around) */}
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
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* Cursor-Following Radial Glow Spotlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.09), transparent 80%)',
                }}
              />

              {/* Giant Persian Number on Top with 3D Tilt / Scale Lift */}
              <div className="relative z-20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:-translate-y-1">
                <span
                  ref={artistsCountRef}
                  data-testid="metric-active-artists"
                  className="block text-5xl md:text-7xl font-bold text-white mb-4"
                >
                  {metrics.activeArtists.toLocaleString('fa-IR')}
                </span>
              </div>

              {/* Elastic Short Horizontal Line that Expands on Hover */}
              <div
                aria-hidden="true"
                className="w-8 group-hover:w-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-white/60 h-[1px] mb-4"
              />

              {/* Persian Title & Unit Centered Below with FoldText */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center gap-1.5">
                <h4 className="text-base sm:text-lg font-medium text-white/90 text-center flex flex-col items-center justify-center">
                  <FoldText
                    text="تعداد هنرمندان"
                    splitBy="word"
                    foldStyle="paper"
                    hinge="top"
                    trigger="scroll"
                    hoverRefold={true}
                    refoldRadius={120}
                    refoldAngle={35}
                    color="#FFFFFF"
                    fontWeight={500}
                    className="text-center justify-center"
                    style={{ textAlign: 'center', letterSpacing: '0em' }}
                  />
                </h4>
                <span className="text-xs sm:text-sm text-white/50 font-light">
                  <FoldText
                    text="هنرمند"
                    splitBy="word"
                    trigger="scroll"
                    hoverRefold={true}
                    color="rgba(255, 255, 255, 0.6)"
                    fontWeight={300}
                    className="text-center justify-center"
                    style={{ textAlign: 'center' }}
                  />
                </span>
              </div>
            </div>

            {/* Monolith 3: تعداد آثار ثبت‌شده */}
            <div
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
              className="group relative flex flex-col items-center justify-center text-center py-14 px-8 overflow-hidden rounded-none bg-transparent cursor-default border-0 transition-colors duration-500"
            >
              {/* Progressive 1px SVG Perimeter Border Draw (Top-Right -> Around) */}
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
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </svg>

              {/* Cursor-Following Radial Glow Spotlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.09), transparent 80%)',
                }}
              />

              {/* Giant Persian Number on Top with 3D Tilt / Scale Lift */}
              <div className="relative z-20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:-translate-y-1">
                <span
                  ref={artworksCountRef}
                  data-testid="metric-curated-artworks"
                  className="block text-5xl md:text-7xl font-bold text-white mb-4"
                >
                  {metrics.curatedArtworks.toLocaleString('fa-IR')}
                </span>
              </div>

              {/* Elastic Short Horizontal Line that Expands on Hover */}
              <div
                aria-hidden="true"
                className="w-8 group-hover:w-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-white/60 h-[1px] mb-4"
              />

              {/* Persian Title & Unit Centered Below with FoldText */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center gap-1.5">
                <h4 className="text-base sm:text-lg font-medium text-white/90 text-center flex flex-col items-center justify-center">
                  <FoldText
                    text="تعداد آثار ثبت‌شده"
                    splitBy="word"
                    foldStyle="paper"
                    hinge="top"
                    trigger="scroll"
                    hoverRefold={true}
                    refoldRadius={120}
                    refoldAngle={35}
                    color="#FFFFFF"
                    fontWeight={500}
                    className="text-center justify-center"
                    style={{ textAlign: 'center', letterSpacing: '0em' }}
                  />
                </h4>
                <span className="text-xs sm:text-sm text-white/50 font-light">
                  <FoldText
                    text="اثر"
                    splitBy="word"
                    trigger="scroll"
                    hoverRefold={true}
                    color="rgba(255, 255, 255, 0.6)"
                    fontWeight={300}
                    className="text-center justify-center"
                    style={{ textAlign: 'center' }}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* 3. Monumental Kinetic Footer Finale («سیاه و سفید» Watermark + Smooth Back-to-Top) */}
          <div className="relative z-10 mix-blend-difference w-full pt-20 md:pt-28 flex flex-col items-center justify-center text-center">
            {/* Interactive Back-to-Top Trigger */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group relative inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 py-3 px-6 cursor-pointer focus:outline-none mb-12"
            >
              <span className="inline-block transition-transform duration-300 ease-out group-hover:-translate-y-1 text-white">
                ↑
              </span>
              <span>بازگشت به آغاز روایت</span>
            </button>

            {/* Giant Cursor-Illuminated Brand Finale («سیاه و سفید») */}
            <div
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--brand-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--brand-y', `${e.clientY - rect.top}px`);
              }}
              className="group relative w-full overflow-hidden text-center flex flex-col items-center justify-center py-6 select-none opacity-20 hover:opacity-90 transition-opacity duration-500"
            >
              {/* Radial Cursor Spotlight that illuminates the giant watermark */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(400px circle at var(--brand-x, 50%) var(--brand-y, 50%), rgba(255, 255, 255, 0.16), transparent 75%)',
                }}
              />

              <h2
                className="font-black text-white text-center w-full leading-none flex flex-col items-center justify-center"
                style={{ fontSize: 'clamp(4rem, 13vw, 11rem)', lineHeight: 0.95 }}
              >
                <FoldText
                  text="سیاه و سفید"
                  splitBy="word"
                  foldStyle="paper"
                  hinge="bottom"
                  trigger="scroll"
                  hoverRefold={true}
                  refoldRadius={180}
                  refoldAngle={45}
                  fontSize="clamp(4rem, 13vw, 11rem)"
                  color="#FFFFFF"
                  fontWeight={900}
                  className="text-center justify-center"
                  style={{ letterSpacing: '-0.02em', lineHeight: 0.95, textAlign: 'center' }}
                />
              </h2>
            </div>

            {/* Clean Archival Colophon Bar */}
            <div className="relative z-10 w-full pt-8 pb-20 text-center text-xs text-white/40 font-light">
              «تمامی حقوق مادی و معنوی آثار در آرشیو سیاه و سفید محفوظ است.»
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
