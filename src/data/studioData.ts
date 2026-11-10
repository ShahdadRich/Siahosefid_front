export type WorkCategory = 'ALL' | 'BRAND' | 'DIGITAL' | 'CONTENT' | 'MOTION';

export interface ProjectWork {
  id: string;
  index: string;
  title: string;
  client: string;
  subtitle: string;
  category: Exclude<WorkCategory, 'ALL'>;
  year: string;
  location: string;
  image: string;
  aspectRatio: '16/10' | '3/4' | '4/3' | '16/9';
  columnSpan: 'left-wide' | 'right-narrow' | 'left-narrow' | 'right-wide';
  metrics: {
    value: string;
    label: string;
  }[];
  challenge: string;
  architecture: string;
  outcome: string;
  deliverables: string[];
  credits: string;
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  categoryKey: Exclude<WorkCategory, 'ALL'>;
  shortSummary: string;
  badgeText: string;
  leadStatement: string;
  benchmarkMetric: string;
  timelineWeeks: string;
  deliverables: string[];
  previewImage: string;
}

export interface PerspectiveArticle {
  id: string;
  index: string;
  category: 'PROCESS' | 'PERSPECTIVES' | 'MANIFESTO';
  readTime: string;
  date: string;
  title: string;
  subtitle: string;
  excerpt: string;
  author: string;
  authorRole: string;
  keyTakeaway: string;
  paragraphs: string[];
}

export interface BrandConfig {
  brandName: string;
  brandTagline: string;
  primaryCity: string;
  secondaryCity: string;
  heroStatementLower: string;
  heroStatementSentence: string;
  heroSubcopy: string;
  foundedYear: string;
  contactEmail: string;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: 'DIRTVERSE®',
  brandTagline: 'Swiss Editorial Brand & Digital Architecture Practice',
  primaryCity: 'ZÜRICH',
  secondaryCity: 'TEHRAN',
  heroStatementLower: 'raw clarity for',
  heroStatementSentence: 'Cultural & category leaders.',
  heroSubcopy:
    'We strip away decorative noise to engineer monolithic brand systems, flagship digital platforms, and kinetic visual narratives that command permanent market authority.',
  foundedYear: '2019',
  contactEmail: 'newbusiness@dirtverse.co',
};

export const HERO_VISUAL = {
  image: '/images/hero_architectural_monolith_1793991682371.jpg',
  captionIndex: '00 — MONOLITH STUDY IV',
  reelDuration: '01:42',
  architecturalLocation: '47.3769° N, 8.5417° E — ZÜRICH PAVILION',
  metrics: [
    { value: '+184%', label: 'Average Post-Rebrand Valuation Lift (12 Mo)' },
    { value: '42', label: 'Flagship Global Systems Shipped Since 2019' },
    { value: '14×', label: 'D&AD, Cannes Lions & Swiss Design Awards' },
    { value: '99.4%', label: 'On-Schedule Architecture Delivery Rate' },
  ],
};

export const SELECTED_WORKS: ProjectWork[] = [
  {
    id: 'vanguard-acoustics',
    index: '01',
    title: 'Audium Monolith Series',
    client: 'Audium Acoustics AG',
    subtitle: 'Industrial brand architecture & spatial sound flagship platform',
    category: 'BRAND',
    year: '2026',
    location: 'BASEL / BERLIN',
    image: '/images/work_vanguard_acoustic_1793991682972.jpg',
    aspectRatio: '4/3',
    columnSpan: 'left-wide',
    metrics: [
      { value: '+210%', label: 'Direct-to-Collector Pre-Orders in 30 Days' },
      { value: '€4.8M', label: 'First-Batch Hardware Allocation Sold Out' },
      { value: '0.4s', label: 'Global WebGL Configurator Load Latency' },
    ],
    challenge:
      'Audium engineered an uncompromising milled-aluminum reference loudspeaker, but their legacy visual identity read like mid-tier consumer electronics rather than collector-grade architectural acoustics.',
    architecture:
      'We established a stark monochromatic design language rooted in Swiss acoustic blueprints, pairing raw travertine material photography with a bespoke tabular numbering system and a zero-latency 3D acoustic room simulator.',
    outcome:
      'The flagship launch sold out its entire 600-unit initial production run within 19 days, securing permanent placement in 14 architectural design galleries across Europe and Japan.',
    deliverables: [
      'Brand Strategy & Naming Architecture',
      'Industrial Packaging & Engraved Typography',
      'Flagship Direct-to-Collector Web Platform',
      'Spatial Audio Exhibition Direction',
    ],
    credits: 'Creative Direction: L. Vane · Industrial Photography: M. Kael',
  },
  {
    id: 'aether-autonomous',
    index: '02',
    title: 'Aether Type-01 Coupe',
    client: 'Aether Mobility GmbH',
    subtitle: 'Digital cockpit system & global reveal film for electric grand tourer',
    category: 'DIGITAL',
    year: '2026',
    location: 'MUNICH / ZÜRICH',
    image: '/images/work_aether_mobility_1793991684374.jpg',
    aspectRatio: '3/4',
    columnSpan: 'right-narrow',
    metrics: [
      { value: '68,400', label: 'Verified Reservation Deposits in 72 Hours' },
      { value: '+145%', label: 'Press Conversion vs. Industry Benchmark' },
      { value: '60fps', label: 'Real-Time Telemetry HMI Instrument Cluster' },
    ],
    challenge:
      'Most electric mobility startups drown their interfaces in sci-fi neon gradients. Aether required an instrument cluster and digital reservation platform with the quiet permanence of brutalist architecture.',
    architecture:
      'We designed a high-contrast daytime/nighttime cockpit HMI using Chivo Mono tabular telemetry and built a bespoke reservation experience featuring frame-accurate lighting studies inside a concrete pavilion.',
    outcome:
      'Generated over $68M in reservation deposits within the opening weekend and won the Red Dot Best of the Best for Automotive Interface Architecture.',
    deliverables: [
      'In-Vehicle HMI & Telemetry Typography',
      'Global Reservation Web Application',
      'Twilight Architectural Launch Film',
      'Investor & Press Monograph',
    ],
    credits: 'Digital Architecture: S. Rostami · Cinematography: Studio Noir',
  },
  {
    id: 'solstice-botanical',
    index: '03',
    title: 'Corpus No. 07 Apothecary',
    client: 'Atelier Solstice Paris',
    subtitle: 'Editorial campaign direction, glass vessel system & print monograph',
    category: 'CONTENT',
    year: '2025',
    location: 'PARIS / ANTWERP',
    image: '/images/work_solstice_botanical_1793991685695.jpg',
    aspectRatio: '4/3',
    columnSpan: 'left-narrow',
    metrics: [
      { value: '+162%', label: 'Average Order Value Across Flagship Boutiques' },
      { value: '38', label: 'Global Concept Store Stockists Added in Q4' },
      { value: '4.9/5', label: 'Packaging Tactile Retention Audit Score' },
    ],
    challenge:
      'Atelier Solstice needed to transition from an artisanal niche formulator into a global architectural fragrance house without losing its raw botanical authenticity.',
    architecture:
      'We replaced decorative floral motifs with pharmacy-grade archival labels set in Chivo Mono, photographed under harsh natural window light on brushed surgical steel.',
    outcome:
      'Secured immediate flagship retail placement at Dover Street Market and Le Bon Marché while lifting online repeat purchase rates by 74% over six months.',
    deliverables: [
      'Smoked Glass Vessel & Label System',
      '35mm Documentary Still-Life Campaign',
      '120-Page Hardcover Olfactory Index',
      'Boutique Retail Spatial Guidelines',
    ],
    credits: 'Art Direction: E. Moreau · Set Architecture: K. Lindqvist',
  },
  {
    id: 'chronos-horology',
    index: '04',
    title: 'Atelier Genève Calibre IX',
    client: 'Manufacture Calibre IX',
    subtitle: 'Kinetic macro motion study & collector allocation portal',
    category: 'MOTION',
    year: '2026',
    location: 'GENEVA / TOKYO',
    image: '/images/work_chronos_horology_1793991686452.jpg',
    aspectRatio: '16/9',
    columnSpan: 'right-wide',
    metrics: [
      { value: '12.4M', label: 'Organic Campaign Film Views Across Collectors' },
      { value: '100%', label: '50-Piece Titanium Edition Allocated in 4 Hours' },
      { value: '+310%', label: 'Private Salon Appointment Requests in Geneva' },
    ],
    challenge:
      'Haute horology marketing is trapped in heritage clichés. Manufacture Calibre IX sought a visceral, architectural motion system to debut their ultralight grade-5 titanium movement.',
    architecture:
      'Combining macro probe-lens cinematography with procedural sound design sampled directly from the escapement wheel, we created an interactive movement disassembly experience.',
    outcome:
      'All 50 numbered pieces were allocated within four hours of the film premiere, establishing a three-year waiting list for subsequent calibres.',
    deliverables: [
      'Macro Chiaroscuro Launch Film (4K 120fps)',
      'Mechanical Escapement Sonic Identity',
      'Interactive Movement Disassembly Experience',
      'Private Collector Allocation Vault',
    ],
    credits: 'Motion Direction: H. Takahashi · Acoustic Capture: Zürich Tonstudio',
  },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'service-brand',
    index: '01',
    title: 'Brand',
    categoryKey: 'BRAND',
    shortSummary: 'Positioning, Visual Architecture, Typography & Design Systems',
    badgeText: 'IDENTITY & ARCHITECTURE',
    leadStatement:
      'We construct foundational brand systems engineered for 10-year longevity—stripping away transient trends in favor of structural typographic authority, bespoke grids, and unmistakable verbal clarity.',
    benchmarkMetric: '+184% average post-launch brand equity & valuation multiple lift',
    timelineWeeks: '8 — 12 WEEKS',
    deliverables: [
      'Category Positioning & Strategic Manifesto',
      'Visual Identity & Swiss Grid Architecture',
      'Custom Typeface Curation & Optical Sizing',
      'Comprehensive Digital Brand Book & Tokens',
    ],
    previewImage: '/images/work_vanguard_acoustic_1793991682972.jpg',
  },
  {
    id: 'service-digital',
    index: '02',
    title: 'Digital',
    categoryKey: 'DIGITAL',
    shortSummary: 'Flagship Web Platforms, Interactive Product Systems & Commerce',
    badgeText: 'PLATFORMS & INTERACTION',
    leadStatement:
      'Every digital surface is a flagship building. We engineer sub-second React and WebGL experiences, design systems, and high-conversion commerce architectures with tactile, frame-accurate motion.',
    benchmarkMetric: '+140% qualified enterprise pipeline & reservation conversion',
    timelineWeeks: '10 — 16 WEEKS',
    deliverables: [
      'Flagship Marketing & Editorial Web Platforms',
      'Multi-Brand Component Design Systems',
      'Interactive 3D / WebGL Product Configurators',
      'Bespoke Headless Commerce & Collector Portals',
    ],
    previewImage: '/images/work_aether_mobility_1793991684374.jpg',
  },
  {
    id: 'service-content',
    index: '03',
    title: 'Content',
    categoryKey: 'CONTENT',
    shortSummary: 'Art Direction, 35mm Campaign Photography & Print Monographs',
    badgeText: 'CAMPAIGNS & MONOGRAPHS',
    leadStatement:
      'Generic stock imagery destroys credibility on sight. We direct original documentary and studio photography, architectural set builds, and archival print publications that anchor your visual world.',
    benchmarkMetric: '3.4× editorial dwell time vs. industry standard campaigns',
    timelineWeeks: '6 — 10 WEEKS',
    deliverables: [
      'Global Campaign Art Direction & Production',
      'Architectural & Industrial Product Photography',
      'Hardcover Print Monographs & Lookbooks',
      'Technical & Editorial Copywriting Systems',
    ],
    previewImage: '/images/work_solstice_botanical_1793991685695.jpg',
  },
  {
    id: 'service-motion',
    index: '04',
    title: 'Motion',
    categoryKey: 'MOTION',
    shortSummary: 'Kinetic Typography, 3D Launch Films & Sonic Architecture',
    badgeText: 'KINETIC & FILM',
    leadStatement:
      'Movement defines how a brand breathes in space. From macro hardware reveal films to deterministic UI micro-interactions and custom sonic identities, we choreograph every frame.',
    benchmarkMetric: '92% completion rate across flagship launch films',
    timelineWeeks: '6 — 12 WEEKS',
    deliverables: [
      'Cinema-Grade Hardware & Product Reveal Films',
      'Kinetic Typography & Broadcast Motion Systems',
      'Real-Time Interactive Shaders & Motion Guidelines',
      'Bespoke Sonic Branding & Tactile UI Audio',
    ],
    previewImage: '/images/work_chronos_horology_1793991686452.jpg',
  },
];

export const PERSPECTIVES_LIST: PerspectiveArticle[] = [
  {
    id: 'anti-ornament-manifesto',
    index: '01',
    category: 'MANIFESTO',
    readTime: '04 MIN READ',
    date: 'NOV 2026',
    title: 'Why subtraction is the only durable competitive moat in digital product design.',
    subtitle: 'Against decorative noise and synthetic complexity',
    excerpt:
      'When every competitor can generate infinite visual noise in seconds, extreme editorial restraint, mathematical proportion, and verifiable craft become the ultimate luxury signals.',
    author: 'Lukas Vane',
    authorRole: 'Founding Partner & Creative Director',
    keyTakeaway:
      'Restraint is not the absence of effort; it is the disciplined removal of everything that dilutes your primary proposition.',
    paragraphs: [
      'Across contemporary digital interfaces, we are witnessing an inflation of synthetic ornament: gratuitous neon gradients, floating glass panels, and mechanical status tickers that signify nothing. When visual complexity becomes zero-cost to produce, it ceases to communicate value.',
      'Swiss editorial modernism solved this crisis seventy years ago in print. Pioneers like Josef Müller-Brockmann and Karl Gerstner demonstrated that an asymmetric mathematical grid, stark typographic scale contrast, and generous negative space create an immediate, visceral sense of authority.',
      'In our practice at Dirtverse, we apply the 80% subtraction rule to every flagship platform. Before introducing a secondary color, a border box, or a motion curve, we ask whether the hierarchy can be resolved purely through scale, proportion, and negative space. The brands that endure the next decade will be the ones brave enough to leave room for silence.',
    ],
  },
  {
    id: 'kinetic-precision-systems',
    index: '02',
    category: 'PROCESS',
    readTime: '06 MIN READ',
    date: 'OCT 2026',
    title: 'Choreographing weight: The physics of cubic-bezier(0.22, 1, 0.36, 1).',
    subtitle: 'Engineering tactile digital surfaces',
    excerpt:
      'Linear transitions feel robotic; overly bouncy springs feel juvenile. How we calibrate custom deceleration curves so web interfaces feel like milled aluminum.',
    author: 'Soraia Rostami',
    authorRole: 'Head of Interactive Architecture',
    keyTakeaway:
      'Motion should never delay user intent—it should transfer momentum from the cursor into the layout with instantaneous initial velocity and a long, frictionless settle.',
    paragraphs: [
      'Watch how a heavy museum door closes on a hydraulic hinge, or how a Leica focus ring settles against its mechanical stop. There is an immediate transfer of kinetic energy followed by an exponentially damped deceleration. Nothing bounces.',
      'In digital interfaces, default ease-in-out curves sluggishly delay the first 80 milliseconds of an interaction, making the software feel detached from the user’s hand. Conversely, uncalibrated spring physics introduce visual jitter that undermines editorial gravity.',
      'By standardizing our architecture around high-initial-velocity curves—specifically cubic-bezier(0.22, 1, 0.36, 1) for structural reveals and cubic-bezier(0.16, 1, 0.3, 1) for media scaling—we ensure every hover and scroll transition responds within the first frame while settling with architectural composure.',
    ],
  },
  {
    id: 'monospaced-truth-editorial',
    index: '03',
    category: 'PERSPECTIVES',
    readTime: '05 MIN READ',
    date: 'SEP 2026',
    title: 'Archival indexing: Pairing oversized grotesque headlines with tabular monospace.',
    subtitle: 'Typographic tension in modern brand systems',
    excerpt:
      'Why the juxtaposition of monumental tight-tracked Inter headlines and wide-tracked Chivo Mono metadata creates an unmistakable editorial rhythm.',
    author: 'Elena Moreau',
    authorRole: 'Director of Typography & Print',
    keyTakeaway:
      'Extreme scale contrast eliminates the murky middle ground of 18px subheadings, letting readers scan both emotional thesis and factual metadata simultaneously.',
    paragraphs: [
      'Most corporate websites fail typographically because their type scale clusters timidly in the middle: 40px headlines, 24px subheads, 18px lead copy, and 15px body text. Nothing commands the room, and nothing whispers.',
      'True editorial tension requires polarity. At one pole stands the monumental grotesque statement—set at clamp(3rem, 7vw, 6.5rem) with tight -0.04em tracking and 0.95 line height, mixing lowercase and sentence case to feel conversational yet architectural.',
      'At the opposite pole sits the archival index: 12px uppercase Chivo Mono with +0.08em tracking and strict tabular numerals. Used for section coordinates ([01 — WORKS]), timestamps, and technical specifications, this pairing turns a standard marketing page into a curated monograph.',
    ],
  },
];
