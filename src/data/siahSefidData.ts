export type AppView =
  | 'landing'
  | 'gallery'
  | 'artist-panel'
  | 'collector-panel'
  | 'admin-panel';

export type SessionRole = 'GUEST' | 'ARTIST' | 'COLLECTOR' | 'ADMIN';

export type ArtStyle =
  | 'MINIMALISM'
  | 'ABSTRACT'
  | 'SCULPTURE'
  | 'PHOTOGRAPHY'
  | 'DIGITAL'
  | 'OTHER';

export interface StyleOption {
  key: ArtStyle;
  labelFa: string;
  labelEn: string;
}

export const ART_STYLES: StyleOption[] = [
  { key: 'MINIMALISM', labelFa: 'مینیمالیسم', labelEn: 'Minimalism' },
  { key: 'ABSTRACT', labelFa: 'آبستره و خطاطی', labelEn: 'Abstract & Calligraphy' },
  { key: 'SCULPTURE', labelFa: 'مجسمه‌سازی', labelEn: 'Sculpture' },
  { key: 'PHOTOGRAPHY', labelFa: 'عکاسی هنری', labelEn: 'Fine Art Photography' },
  { key: 'DIGITAL', labelFa: 'دیجیتال آرت', labelEn: 'Digital & Spatial' },
  { key: 'OTHER', labelFa: 'غیره', labelEn: 'Other' },
];

export interface ArtworkItem {
  id: string;
  accessionCode: string;
  title: string;
  titleEn: string;
  artistId: string;
  artistName: string;
  artistAlias: string;
  style: ArtStyle;
  customStyle?: string;
  styleLabel: string;
  price: number; // in Toman
  dimensions: string;
  medium: string;
  technique?: string;
  year: string;
  story: string;
  image: string;
  imageUrl?: string;
  aspectRatio: '3/4' | '4/3' | '16/9';
  featured: boolean;
  sold: boolean;
  isSold?: boolean;
  buyerId?: string;
  ownerId?: string;
}

export interface PlatformUser {
  id: string;
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN';
  fullName: string;
  artisticAlias?: string;
  artisticName?: string;
  artisticStyle?: ArtStyle;
  customStyle?: string;
  phone: string;
  email: string;
  walletBalance: number; // in Toman
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joinedAt: string;
  totalSalesCount: number;
  totalSalesRevenue: number;
}

export interface WalletTransaction {
  id: string;
  referenceCode: string;
  userId: string;
  userName: string;
  type: 'TOP_UP' | 'PURCHASE' | 'SALE_PAYOUT';
  amount: number;
  artworkId?: string;
  artworkTitle?: string;
  timestamp: string;
}

export const INITIAL_USERS: PlatformUser[] = [
  {
    id: 'artist-1',
    role: 'ARTIST',
    fullName: 'سهراب فرزاد',
    artisticAlias: 'سایه‌نگار',
    artisticStyle: 'ABSTRACT',
    phone: '09123456789',
    email: 'sohrab@siahosefid.art',
    walletBalance: 42000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۴/۱۱/۱۲',
    totalSalesCount: 4,
    totalSalesRevenue: 185000000,
  },
  {
    id: 'artist-2',
    role: 'ARTIST',
    fullName: 'تارا کیانی',
    artisticAlias: 'مونولیت',
    artisticStyle: 'SCULPTURE',
    phone: '09129876543',
    email: 'tara@siahosefid.art',
    walletBalance: 68000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۴/۱۲/۰۳',
    totalSalesCount: 3,
    totalSalesRevenue: 210000000,
  },
  {
    id: 'artist-3',
    role: 'ARTIST',
    fullName: 'مانی رادمنش',
    artisticAlias: 'نقره‌فام',
    artisticStyle: 'PHOTOGRAPHY',
    phone: '09121112233',
    email: 'mani@siahosefid.art',
    walletBalance: 19500000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۵/۰۱/۱۸',
    totalSalesCount: 2,
    totalSalesRevenue: 76000000,
  },
  {
    id: 'artist-4',
    role: 'ARTIST',
    fullName: 'الناز رستمی',
    artisticAlias: 'خلأ سرخ',
    artisticStyle: 'MINIMALISM',
    phone: '09124445566',
    email: 'elnaz@siahosefid.art',
    walletBalance: 31000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۵/۰۲/۰۵',
    totalSalesCount: 2,
    totalSalesRevenue: 94000000,
  },
  {
    id: 'collector-1',
    role: 'COLLECTOR',
    fullName: 'آریا حسینی',
    phone: '09127778899',
    email: 'aria.collector@siahosefid.art',
    walletBalance: 125000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۵/۰۱/۱۰',
    totalSalesCount: 0,
    totalSalesRevenue: 0,
  },
  {
    id: 'collector-2',
    role: 'COLLECTOR',
    fullName: 'نیلوفر مجد',
    phone: '09123334455',
    email: 'niloofar@siahosefid.art',
    walletBalance: 85000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۵/۰۲/۲۰',
    totalSalesCount: 0,
    totalSalesRevenue: 0,
  },
  {
    id: 'admin-1',
    role: 'ADMIN',
    fullName: 'مدیر ارشد گالری سیاه و سفید',
    phone: '02122001100',
    email: 'curator@siahosefid.art',
    walletBalance: 500000000,
    status: 'ACTIVE',
    joinedAt: '۱۴۰۴/۰۱/۰۱',
    totalSalesCount: 0,
    totalSalesRevenue: 0,
  },
];

export const INITIAL_ARTWORKS: ArtworkItem[] = [
  {
    id: 'art-1',
    accessionCode: 'آرشیو ۱۴۰۵-۰۱',
    title: 'سکوت مرکب بر کتان خام',
    titleEn: 'Silence of Sumi Ink on Raw Linen',
    artistId: 'artist-1',
    artistName: 'سهراب فرزاد',
    artistAlias: 'سایه‌نگار',
    style: 'ABSTRACT',
    styleLabel: 'آبستره و خطاطی',
    price: 48000000,
    dimensions: '۱۵۰ × ۲۰۰ سانتی‌متر',
    medium: 'مرکب دوده و زغال فشرده روی بوم کتان دست‌بافت',
    year: '۱۴۰۵',
    story:
      'این اثر حاصل هم‌نشینی فرم‌های خوشنویسی سیاه‌مشق ایرانی با زیبایی‌شناسی مینیمالیسم سوئیسی است. ضربه‌قلم‌های سنگین زغال و مرکب بدون هیچ اصلاحی بر بوم خام ثبت شده‌اند تا تنش میان حرکت و سکون را جاودانه کنند.',
    image: '/images/art_charcoal_calligraphy_1793998760531.jpg',
    aspectRatio: '3/4',
    featured: true,
    sold: false,
  },
  {
    id: 'art-2',
    accessionCode: 'آرشیو ۱۴۰۵-۰۲',
    title: 'شکاف اخرایی در تاریکی مطلق',
    titleEn: 'Crimson Fissure in Obsidian Void',
    artistId: 'artist-4',
    artistName: 'الناز رستمی',
    artistAlias: 'خلأ سرخ',
    style: 'MINIMALISM',
    styleLabel: 'مینیمالیسم',
    price: 62000000,
    dimensions: '۱۶۰ × ۲۲۰ سانتی‌متر',
    medium: 'پیگمنت معدنی سرخ، خاکستر و رنگ روغن مات روی بوم',
    year: '۱۴۰۵',
    story:
      'الهام‌گرفته از کوره و دود در تاریکی؛ لایه‌های متراکم سیاه مات در کنار شکافی عمودی از اخرای سرخ گرم قرار گرفته‌اند تا حس گرمای نهفته در دل سنگ سرد را به بیننده منتقل کنند.',
    image: '/images/art_crimson_void_canvas_1793998762808.jpg',
    aspectRatio: '3/4',
    featured: true,
    sold: false,
  },
  {
    id: 'art-3',
    accessionCode: 'آرشیو ۱۴۰۵-۰۳',
    title: 'تعادل برنز و تراورتن شماره ۴',
    titleEn: 'Bronze & Travertine Equilibrium IV',
    artistId: 'artist-2',
    artistName: 'تارا کیانی',
    artistAlias: 'مونولیت',
    style: 'SCULPTURE',
    styleLabel: 'مجسمه‌سازی',
    price: 85000000,
    dimensions: '۹۵ × ۷۰ × ۱۳۵ سانتی‌متر',
    medium: 'برنز پتینه‌کاری‌شده سیاه و سنگ تراورتن متخلخل',
    year: '۱۴۰۵',
    story:
      'در این مجسمه معماری‌گونه، ورق‌های برنز اکسیدشده در دل بلوک‌های تراورتن طبیعی قفل شده‌اند. تضاد میان تخلخل سنگ روشن و صلابت فلز تیره، گفت‌وگویی بی‌پایان میان طبیعت و هندسه ایجاد می‌کند.',
    image: '/images/art_brutalist_bronze_sculpture_1793998761500.jpg',
    aspectRatio: '4/3',
    featured: true,
    sold: false,
  },
  {
    id: 'art-4',
    accessionCode: 'آرشیو ۱۴۰۵-۰۴',
    title: 'هندسه بادگیرها در گرگ‌ومیش',
    titleEn: 'Windcatcher Shadow Geometry at Dusk',
    artistId: 'artist-3',
    artistName: 'مانی رادمنش',
    artistAlias: 'نقره‌فام',
    style: 'PHOTOGRAPHY',
    styleLabel: 'عکاسی هنری',
    price: 34000000,
    dimensions: '۱۲۰ × ۸۰ سانتی‌متر',
    medium: 'چاپ سیلور ژلاتین آرشیوی روی کاغذ باریتا (نسخه ۱ از ۵)',
    year: '۱۴۰۴',
    story:
      'ثبت آنالوگ با دوربین قطع متوسط از سایه‌های تیز معماری کویری در آخرین دقایق غروب. کنتراست خالص سیاه و سفید، حجم‌های خشتی را به یک ترکیب‌بندی انتزاعی تبدیل کرده است.',
    image: '/images/art_silver_gelatin_desert_1793998763137.jpg',
    aspectRatio: '16/9',
    featured: true,
    sold: false,
  },
  {
    id: 'art-5',
    accessionCode: 'آرشیو ۱۴۰۵-۰۵',
    title: 'پاویون نور و بتن بروتالیست',
    titleEn: 'Brutalist Pavilion Light Study',
    artistId: 'artist-3',
    artistName: 'مانی رادمنش',
    artistAlias: 'نقره‌فام',
    style: 'PHOTOGRAPHY',
    styleLabel: 'عکاسی هنری',
    price: 39000000,
    dimensions: '۱۴۰ × ۹۰ سانتی‌متر',
    medium: 'چاپ پلاتینیوم پالادیوم روی کاغذ کتان آرشیوی',
    year: '۱۴۰۵',
    story:
      'مطالعه‌ای پیرامون برش‌های هندسی نور خورشید بر دیوارهای بتن اکسپوز و کفپوش سنگ تراورتن؛ جایی که فضا و زمان در سکوت مطلق منجمد شده‌اند.',
    image: '/images/hero_architectural_monolith_1793991682371.jpg',
    aspectRatio: '16/9',
    featured: false,
    sold: false,
  },
  {
    id: 'art-6',
    accessionCode: 'آرشیو ۱۴۰۵-۰۶',
    title: 'مونولیت آکوستیک سیاه',
    titleEn: 'Anodized Acoustic Monolith',
    artistId: 'artist-2',
    artistName: 'تارا کیانی',
    artistAlias: 'مونولیت',
    style: 'DIGITAL',
    styleLabel: 'دیجیتال آرت',
    price: 54000000,
    dimensions: '۶۰ × ۴۵ × ۱۱۰ سانتی‌متر',
    medium: 'آلومینیوم آنودایزشده سیاه و سنگ طبیعی با چیدمان صوتی',
    year: '۱۴۰۵',
    story:
      'چیدمانی تعاملی که فرم صنعتی مینیمال را با امواج صوتی محیطی ترکیب می‌کند؛ قطعه‌ای کلکسیونی برای فضاهای معماری مدرن.',
    image: '/images/work_vanguard_acoustic_1793991682972.jpg',
    aspectRatio: '4/3',
    featured: false,
    sold: false,
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    referenceCode: 'تراکنش ۱۴۰۵-۹۰۱۲',
    userId: 'collector-1',
    userName: 'آریا حسینی',
    type: 'TOP_UP',
    amount: 125000000,
    timestamp: '۱۴۰۵/۰۸/۱۴ — ۱۸:۳۰',
  },
  {
    id: 'tx-2',
    referenceCode: 'تراکنش ۱۴۰۵-۹۰۴۵',
    userId: 'collector-2',
    userName: 'نیلوفر مجد',
    type: 'TOP_UP',
    amount: 85000000,
    timestamp: '۱۴۰۵/۰۸/۱۵ — ۱۱:۱۵',
  },
];

// Base archival offsets so the platform shows realistic museum scale while incrementing live on every user action
export const BASE_ARCHIVE_METRICS = {
  baseMembersOffset: 1240,
  baseArtistsOffset: 180,
  baseArtworksOffset: 634,
};
