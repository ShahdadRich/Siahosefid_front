import {
  AppView,
  ArtworkItem,
  ArtStyle,
  PlatformUser,
  ART_STYLES,
  BASE_ARCHIVE_METRICS,
} from '../data/siahSefidData';

/**
 * Maps an AppView to its canonical browser URL pathname.
 */
export function getPathForView(view: AppView): string {
  switch (view) {
    case 'gallery':
      return '/gallery';
    case 'artist-panel':
      return '/studio';
    case 'collector-panel':
      return '/collector';
    case 'admin-panel':
      return '/admin';
    case 'landing':
    default:
      return '/';
  }
}

/**
 * Resolves the active AppView from window.location.pathname (and optional query string fallback).
 */
export function resolveViewFromLocation(pathname: string, search: string = ''): AppView {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';
  if (cleanPath === '/admin') return 'admin-panel';
  if (cleanPath === '/gallery') return 'gallery';
  if (cleanPath === '/studio' || cleanPath === '/artist-panel') return 'artist-panel';
  if (cleanPath === '/collector' || cleanPath === '/collector-panel') return 'collector-panel';

  if (search) {
    const params = new URLSearchParams(search);
    const viewParam = params.get('view');
    if (
      viewParam === 'landing' ||
      viewParam === 'gallery' ||
      viewParam === 'artist-panel' ||
      viewParam === 'collector-panel' ||
      viewParam === 'admin-panel'
    ) {
      return viewParam;
    }
  }

  return 'landing';
}

export type PriceFilterKey = 'ALL' | 'UNDER_45M' | '45M_TO_70M' | 'OVER_70M';
export type AppLanguage = 'fa' | 'en';
export type AppTheme = 'dark' | 'light';

export interface ArtistRegistrationInput {
  fullName: string;
  artisticAlias: string;
  artisticStyle: ArtStyle;
  customStyle?: string;
  phone: string;
  email: string;
}

export interface CollectorRegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  initialTopUp: number;
}

export interface NewArtworkInput {
  title: string;
  titleEn?: string;
  style: ArtStyle;
  customStyle?: string;
  price: number;
  dimensions: string;
  medium: string;
  story: string;
  image: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Formats a Toman price with comma separators for tabular display.
 */
export function formatTomanPrice(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return `${safe.toLocaleString('en-US')} TOMAN`;
}

/**
 * Formats a Toman price in Persian numerals with تومان label.
 */
export function formatPersianToman(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return `${safe.toLocaleString('fa-IR')} تومان`;
}

/**
 * Formats a Toman price according to active language ('fa' | 'en').
 */
export function formatLocalizedPrice(amount: number, lang: AppLanguage): string {
  return lang === 'fa' ? formatPersianToman(amount) : formatTomanPrice(amount);
}

/**
 * Returns the Persian label for an ArtStyle key.
 */
export function getStyleLabelFa(style: ArtStyle): string {
  const found = ART_STYLES.find((s) => s.key === style);
  return found ? found.labelFa : 'مینیمالیسم';
}

/**
 * Returns the localized label for an ArtStyle key.
 */
export function getStyleLabel(style: ArtStyle, lang: AppLanguage): string {
  const found = ART_STYLES.find((s) => s.key === style);
  if (!found) return lang === 'fa' ? 'مینیمالیسم' : 'Minimalism';
  return lang === 'fa' ? found.labelFa : found.labelEn;
}

/**
 * Computes live platform statistics synced with landing page counters.
 */
export function computePlatformMetrics(
  users: PlatformUser[],
  artworks: ArtworkItem[]
): {
  totalMembers: number;
  activeArtists: number;
  curatedArtworks: number;
  availableArtworks: number;
  soldArtworks: number;
  totalWalletBalance: number;
} {
  const activeUsers = users.filter((u) => u.status !== 'SUSPENDED');
  const artists = activeUsers.filter((u) => u.role === 'ARTIST');
  const soldCount = artworks.filter((a) => a.sold).length;
  const totalWalletBalance = users.reduce((sum, u) => sum + u.walletBalance, 0);

  return {
    totalMembers: BASE_ARCHIVE_METRICS.baseMembersOffset + activeUsers.length,
    activeArtists: BASE_ARCHIVE_METRICS.baseArtistsOffset + artists.length,
    curatedArtworks: BASE_ARCHIVE_METRICS.baseArtworksOffset + artworks.length,
    availableArtworks: artworks.length - soldCount,
    soldArtworks: soldCount,
    totalWalletBalance,
  };
}

/**
 * Filters artworks by style, price range, artist ID, and search query.
 */
export function filterArtworks(
  artworks: ArtworkItem[],
  options: {
    style: ArtStyle | 'ALL';
    priceFilter: PriceFilterKey;
    artistId: string | 'ALL';
    searchQuery?: string;
  }
): ArtworkItem[] {
  const q = (options.searchQuery || '').trim().toLowerCase();

  return artworks.filter((art) => {
    if (options.style !== 'ALL' && art.style !== options.style) {
      return false;
    }

    if (options.artistId !== 'ALL' && art.artistId !== options.artistId) {
      return false;
    }

    if (options.priceFilter === 'UNDER_45M' && art.price >= 45000000) {
      return false;
    }
    if (
      options.priceFilter === '45M_TO_70M' &&
      (art.price < 45000000 || art.price > 70000000)
    ) {
      return false;
    }
    if (options.priceFilter === 'OVER_70M' && art.price <= 70000000) {
      return false;
    }

    if (q) {
      const matchesText =
        art.title.toLowerCase().includes(q) ||
        art.titleEn.toLowerCase().includes(q) ||
        art.artistName.toLowerCase().includes(q) ||
        art.artistAlias.toLowerCase().includes(q) ||
        art.accessionCode.toLowerCase().includes(q);
      if (!matchesText) return false;
    }

    return true;
  });
}

/**
 * Validates the Artist registration form («من هنرمندم»).
 */
export function validateArtistRegistration(
  input: ArtistRegistrationInput
): ValidationResult<ArtistRegistrationInput> {
  const errors: Partial<Record<keyof ArtistRegistrationInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = 'لطفاً نام و نام خانوادگی کامل خود را وارد کنید (حداقل ۳ حرف).';
  }

  if (!input.artisticAlias || input.artisticAlias.trim().length < 2) {
    errors.artisticAlias = 'لطفاً نام هنری یا امضای حرفه‌ای خود را وارد کنید.';
  }

  if (
    input.artisticStyle === 'OTHER' &&
    (!input.customStyle || input.customStyle.trim().length < 2)
  ) {
    errors.customStyle = 'لطفاً نام سبک هنری خود را وارد کنید.';
  }

  const phoneClean = (input.phone || '').replace(/\s+/g, '');
  if (!/^09\d{9}$/.test(phoneClean) && phoneClean.length < 10) {
    errors.phone = 'شماره تماس معتبر وارد کنید (مثال: 09123456789).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'لطفاً نشانی ایمیل معتبر وارد کنید.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates the Collector / Art Lover registration form («من هنردوستم»).
 */
export function validateCollectorRegistration(
  input: CollectorRegistrationInput
): ValidationResult<CollectorRegistrationInput> {
  const errors: Partial<Record<keyof CollectorRegistrationInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'لطفاً نشانی ایمیل معتبر وارد کنید.';
  }

  const phoneClean = (input.phone || '').replace(/\s+/g, '');
  if (!/^09\d{9}$/.test(phoneClean) && phoneClean.length < 10) {
    errors.phone = 'شماره تماس معتبر وارد کنید (مثال: 09123456789).';
  }

  if (input.initialTopUp < 0 || Number.isNaN(input.initialTopUp)) {
    errors.initialTopUp = 'مبلغ شارژ اولیه نمی‌تواند منفی باشد.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates adding or editing an artwork in the Artist Studio Dashboard.
 */
export function validateArtworkInput(
  input: NewArtworkInput
): ValidationResult<NewArtworkInput> {
  const errors: Partial<Record<keyof NewArtworkInput, string>> = {};

  if (!input.title || input.title.trim().length < 2) {
    errors.title = 'عنوان اثر هنری الزامی است.';
  }

  if (!input.price || Number.isNaN(input.price) || input.price < 100000) {
    errors.price = 'قیمت اثر باید حداقل ۱۰۰,۰۰۰ تومان باشد.';
  }

  if (!input.story || input.story.trim().length < 10) {
    errors.story = 'لطفاً روایت و توضیحات اثر را بنویسید (حداقل ۱۰ کاراکتر).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Evaluates whether a collector can purchase an artwork with their current wallet balance.
 */
export function evaluateArtworkPurchase(
  artwork: ArtworkItem,
  buyer: PlatformUser
): {
  allowed: boolean;
  reasonFa?: string;
  remainingBalance: number;
} {
  if (artwork.sold) {
    return {
      allowed: false,
      reasonFa: 'این اثر پیش‌تر به مجموعه دیگری واگذار شده است.',
      remainingBalance: buyer.walletBalance,
    };
  }

  if (buyer.walletBalance < artwork.price) {
    const deficit = artwork.price - buyer.walletBalance;
    return {
      allowed: false,
      reasonFa: `موجودی حساب کافی نیست. کسری موجودی: ${formatPersianToman(deficit)}`,
      remainingBalance: buyer.walletBalance,
    };
  }

  return {
    allowed: true,
    remainingBalance: buyer.walletBalance - artwork.price,
  };
}
