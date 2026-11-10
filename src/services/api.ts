import {
  ArtStyle,
  ArtworkItem,
  PlatformUser,
  SessionRole,
  WalletTransaction,
} from '../data/siahSefidData';
import {
  ArtistRegistrationInput,
  CollectorRegistrationInput,
  NewArtworkInput,
  PriceFilterKey,
  getStyleLabelFa,
} from '../utils/siahSefidLogic';

/**
 * Base URL for the Siah o Sefid REST API.
 * Configured via VITE_API_BASE_URL in .env (defaults to local backend server on port 4000).
 */
const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
export const API_BASE_URL: string =
  metaEnv?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

// ============================================================================
// 0. STANDARD API ENVELOPE & AUTH TOKEN HELPERS
// ============================================================================

export interface ApiSuccessResponse<T> {
  status: 'success';
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string>;
  details?: Record<string, unknown>;
}

let authTokenMemory: string | null = null;

export function setAuthToken(token: string | null): void {
  authTokenMemory = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem('siah_sefid_jwt', token);
    } else {
      window.localStorage.removeItem('siah_sefid_jwt');
    }
  }
}

export function getAuthToken(): string | null {
  if (authTokenMemory) return authTokenMemory;
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('siah_sefid_jwt');
  }
  return null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json; charset=utf-8' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json();
  if (!response.ok || payload.status === 'error') {
    const err = payload as ApiErrorResponse;
    throw new Error(err.message || `API Error (${response.status})`);
  }

  return payload as ApiSuccessResponse<T>;
}

// ============================================================================
// 1. REGISTRATION & AUTHENTICATION SCHEMAS (/api/v1/auth/*)
// ============================================================================

export type PersianArtStyleLabel =
  | 'مینیمالیسم'
  | 'آبستره و خطاطی'
  | 'مجسمه‌سازی'
  | 'عکاسی هنری'
  | 'دیجیتال آرت'
  | 'غیره';

export interface RegisterArtistRequestPayload {
  fullName: string;
  artisticName: string;
  artisticStyle: ArtStyle | PersianArtStyleLabel;
  customStyle?: string;
  phone: string;
  email: string;
}

export interface RegisterArtistResponseData {
  user: PlatformUser;
  redirectPath: '/studio';
  accessToken: string;
}

export type InitialWalletTopUpPreset = 0 | 25000000 | 50000000 | 100000000 | 200000000;

export interface RegisterCollectorRequestPayload {
  fullName: string;
  email: string;
  phone: string;
  initialWalletTopUp: number;
}

export interface RegisterCollectorResponseData {
  user: PlatformUser;
  initialTransaction?: WalletTransaction | null;
  redirectPath: '/gallery';
  accessToken: string;
}

export interface AuthSessionMeResponseData {
  authenticated: boolean;
  role: SessionRole;
  user: PlatformUser | null;
}

export interface AuthLogoutResponseData {
  redirectPath: '/';
}

/**
 * Maps Frontend ArtistRegistrationInput to the exact REST payload for POST /api/v1/auth/register/artist
 */
export function toRegisterArtistPayload(
  input: ArtistRegistrationInput
): RegisterArtistRequestPayload {
  return {
    fullName: input.fullName.trim(),
    artisticName: input.artisticAlias.trim(),
    artisticStyle: input.artisticStyle,
    customStyle:
      input.artisticStyle === 'OTHER' ? input.customStyle?.trim() || '' : undefined,
    phone: input.phone.trim(),
    email: input.email.trim(),
  };
}

/**
 * Maps Frontend CollectorRegistrationInput to the exact REST payload for POST /api/v1/auth/register/collector
 */
export function toRegisterCollectorPayload(
  input: CollectorRegistrationInput
): RegisterCollectorRequestPayload {
  return {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    initialWalletTopUp: Math.max(0, input.initialTopUp),
  };
}

// ============================================================================
// 2. ARTIST STUDIO & ARTWORK MANAGEMENT SCHEMAS (/api/v1/studio/* & /api/v1/artworks/*)
// ============================================================================

export interface StudioOverviewResponseData {
  artistIdentity: {
    id: string;
    fullName: string;
    artisticName: string;
    artisticStyle: ArtStyle;
    styleLabel: string;
    customStyle?: string;
    email: string;
    phone: string;
    joinedAt: string;
  };
  counters: {
    registeredArtworksCount: number; // آثار ثبت‌شده
    soldArtworksCount: number; // آثار فروخته‌شده
    totalSalesRevenue: number; // مجموع عواید فروش (تومان)
  };
  artworks: ArtworkItem[];
}

export interface UploadArtworkImageResponseData {
  imageUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CreateArtworkRequestPayload {
  title: string;
  titleEn?: string;
  style: ArtStyle;
  customStyle?: string;
  price: number;
  dimensions: string;
  technique: string;
  story: string;
  imageUrl: string;
}

export interface UpdateArtworkRequestPayload {
  title?: string;
  price?: number;
  story?: string;
  style?: ArtStyle;
  customStyle?: string;
  dimensions?: string;
  technique?: string;
}

/**
 * Maps Frontend NewArtworkInput to the exact REST payload for POST /api/v1/artworks
 */
export function toCreateArtworkPayload(
  input: NewArtworkInput
): CreateArtworkRequestPayload {
  return {
    title: input.title.trim(),
    titleEn: input.titleEn?.trim() || undefined,
    style: input.style,
    customStyle:
      input.style === 'OTHER' ? input.customStyle?.trim() || '' : undefined,
    price: input.price,
    dimensions: input.dimensions.trim(),
    technique: input.medium.trim(),
    story: input.story.trim(),
    imageUrl: input.image,
  };
}

// ============================================================================
// 3. EXHIBITION GALLERY & PURCHASE FLOW SCHEMAS (/api/v1/artworks)
// ============================================================================

export type GalleryPriceRangeParam = 'under-45m' | '45m-70m' | 'above-70m';

export interface GalleryArtworksQueryParams {
  search?: string;
  style?: ArtStyle | 'ALL' | string;
  priceRange?: GalleryPriceRangeParam | PriceFilterKey;
  artistId?: string;
  featured?: boolean;
}

export interface CertificateOfAuthenticity {
  certificateId: string;
  accessionCode: string;
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  artistAlias: string;
  dimensions: string;
  technique: string;
  ownerId: string;
  ownerName: string;
  acquiredPrice: number;
  issuedAt: string;
}

export interface PurchaseArtworkRequestPayload {
  paymentMethod: 'WALLET_BALANCE';
  acceptArchivalTerms?: boolean;
}

export interface PurchaseArtworkResponseData {
  artwork: ArtworkItem;
  remainingWalletBalance: number;
  artistTotalSalesRevenue: number;
  transaction: WalletTransaction;
  certificateOfAuthenticity: CertificateOfAuthenticity;
}

/**
 * Converts UI PriceFilterKey ('ALL' | 'UNDER_45M' | '45M_TO_70M' | 'OVER_70M')
 * to the query parameter value ('under-45m' | '45m-70m' | 'above-70m').
 */
export function toGalleryPriceRangeQuery(
  filter: PriceFilterKey
): GalleryPriceRangeParam | undefined {
  switch (filter) {
    case 'UNDER_45M':
      return 'under-45m';
    case '45M_TO_70M':
      return '45m-70m';
    case 'OVER_70M':
      return 'above-70m';
    case 'ALL':
    default:
      return undefined;
  }
}

// ============================================================================
// 4. COLLECTOR PROFILE & WALLET SCHEMAS (/api/v1/collector/*)
// ============================================================================

export type CollectorTopUpPreset = 25000000 | 50000000 | 100000000 | 250000000;

export interface UpdateCollectorProfileRequestPayload {
  fullName: string;
  email: string;
  phone: string;
}

export interface WalletTopUpRequestPayload {
  amount: number;
  customAmount?: number;
  presetPackage?: CollectorTopUpPreset;
}

export interface WalletTopUpResponseData {
  balance: number;
  transaction: WalletTransaction;
}

export interface CollectorWalletOverviewResponseData {
  collector: PlatformUser;
  balance: number;
  purchasedArtworks: ArtworkItem[]; // گنجینه آثار خریداری‌شده
  transactions: WalletTransaction[]; // تاریخچه تراکنش‌های کیف‌پول
}

// ============================================================================
// 5. MASTER ADMIN CONSOLE & PUBLIC LANDING METRICS (/api/v1/public/stats & /api/v1/admin/*)
// ============================================================================

export interface PublicLandingStatsResponseData {
  totalMembers: number; // تعداد اعضای سایت
  activeArtists: number; // تعداد هنرمندان
  curatedArtworks: number; // تعداد آثار ثبت‌شده
}

export interface AdminOverviewQueryParams {
  search?: string;
  role?: 'ALL' | 'ARTIST' | 'COLLECTOR';
}

export interface AdminOverviewResponseData {
  metrics: {
    totalMembers: number; // کل اعضای پلتفرم
    activeArtists: number; // هنرمندان فعال
    curatedArtworks: number; // آثار ثبت‌شده در آرشیو
    totalLiquidityAndVolume: number; // نقدینگی و حجم معاملات (تومان)
  };
  users: PlatformUser[]; // مدیریت اعضا و هنرمندان
  artworks: ArtworkItem[]; // مدیریت آثار گالری
}

export interface AdminToggleUserStatusRequestPayload {
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface AdminToggleArtworkFeatureRequestPayload {
  featured: boolean;
}

// ============================================================================
// 6. CENTRALIZED ASYNC REST API SERVICE CLIENT
// ============================================================================

export const siahSefidApi = {
  auth: {
    /**
     * POST /api/v1/auth/register/artist
     */
    registerArtist: async (input: ArtistRegistrationInput) => {
      const payload = toRegisterArtistPayload(input);
      const res = await apiRequest<RegisterArtistResponseData>(
        '/auth/register/artist',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.data.accessToken) {
        setAuthToken(res.data.accessToken);
      }
      return res;
    },

    /**
     * POST /api/v1/auth/register/collector
     */
    registerCollector: async (input: CollectorRegistrationInput) => {
      const payload = toRegisterCollectorPayload(input);
      const res = await apiRequest<RegisterCollectorResponseData>(
        '/auth/register/collector',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.data.accessToken) {
        setAuthToken(res.data.accessToken);
      }
      return res;
    },

    /**
     * GET /api/v1/auth/me
     */
    getSessionMe: async () => {
      return apiRequest<AuthSessionMeResponseData>('/auth/me', {
        method: 'GET',
      });
    },

    /**
     * POST /api/v1/auth/logout
     */
    logout: async () => {
      const res = await apiRequest<AuthLogoutResponseData>('/auth/logout', {
        method: 'POST',
      });
      setAuthToken(null);
      return res;
    },
  },

  studio: {
    /**
     * GET /api/v1/studio/me
     */
    getMyStudioOverview: async () => {
      return apiRequest<StudioOverviewResponseData>('/studio/me', {
        method: 'GET',
      });
    },

    /**
     * POST /api/v1/artworks/upload-image
     */
    uploadArtworkImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest<UploadArtworkImageResponseData>(
        '/artworks/upload-image',
        {
          method: 'POST',
          body: formData,
        }
      );
    },

    /**
     * POST /api/v1/artworks
     */
    createArtwork: async (input: NewArtworkInput) => {
      const payload = toCreateArtworkPayload(input);
      return apiRequest<ArtworkItem>('/artworks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    /**
     * PATCH /api/v1/artworks/:id
     */
    updateArtwork: async (
      artworkId: string,
      updates: UpdateArtworkRequestPayload
    ) => {
      return apiRequest<ArtworkItem>(
        `/artworks/${encodeURIComponent(artworkId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            ...updates,
            ...(updates.style
              ? { styleLabel: getStyleLabelFa(updates.style) }
              : {}),
          }),
        }
      );
    },

    /**
     * DELETE /api/v1/artworks/:id
     */
    deleteArtwork: async (artworkId: string) => {
      return apiRequest<{ id: string; deleted: boolean }>(
        `/artworks/${encodeURIComponent(artworkId)}`,
        {
          method: 'DELETE',
        }
      );
    },
  },

  gallery: {
    /**
     * GET /api/v1/artworks
     */
    getArtworks: async (params: GalleryArtworksQueryParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search?.trim()) {
        searchParams.set('search', params.search.trim());
      }
      if (params.style && params.style !== 'ALL') {
        searchParams.set('style', params.style);
      }
      if (params.priceRange && params.priceRange !== 'ALL') {
        const mappedRange =
          params.priceRange === 'UNDER_45M' ||
          params.priceRange === '45M_TO_70M' ||
          params.priceRange === 'OVER_70M'
            ? toGalleryPriceRangeQuery(params.priceRange)
            : params.priceRange;
        if (mappedRange) {
          searchParams.set('priceRange', mappedRange);
        }
      }
      if (params.artistId && params.artistId !== 'ALL') {
        searchParams.set('artistId', params.artistId);
      }
      if (typeof params.featured === 'boolean') {
        searchParams.set('featured', String(params.featured));
      }

      const qs = searchParams.toString();
      return apiRequest<ArtworkItem[]>(`/artworks${qs ? `?${qs}` : ''}`, {
        method: 'GET',
      });
    },

    /**
     * POST /api/v1/artworks/:id/purchase
     */
    purchaseArtwork: async (
      artworkId: string,
      payload: PurchaseArtworkRequestPayload = {
        paymentMethod: 'WALLET_BALANCE',
        acceptArchivalTerms: true,
      }
    ) => {
      return apiRequest<PurchaseArtworkResponseData>(
        `/artworks/${encodeURIComponent(artworkId)}/purchase`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    },
  },

  collector: {
    /**
     * GET /api/v1/collector/wallet
     */
    getWalletAndTreasury: async () => {
      return apiRequest<CollectorWalletOverviewResponseData>(
        '/collector/wallet',
        {
          method: 'GET',
        }
      );
    },

    /**
     * PATCH /api/v1/collector/profile
     */
    updateProfile: async (updates: UpdateCollectorProfileRequestPayload) => {
      return apiRequest<PlatformUser>('/collector/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: updates.fullName.trim(),
          email: updates.email.trim(),
          phone: updates.phone.trim(),
        }),
      });
    },

    /**
     * POST /api/v1/collector/wallet/topup
     */
    topUpWallet: async (payload: WalletTopUpRequestPayload) => {
      return apiRequest<WalletTopUpResponseData>('/collector/wallet/topup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  publicStats: {
    /**
     * GET /api/v1/public/stats
     */
    getLandingCounters: async () => {
      return apiRequest<PublicLandingStatsResponseData>('/public/stats', {
        method: 'GET',
      });
    },
  },

  admin: {
    /**
     * GET /api/v1/admin/overview
     */
    getOverview: async (params: AdminOverviewQueryParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search?.trim()) {
        searchParams.set('search', params.search.trim());
      }
      if (params.role && params.role !== 'ALL') {
        searchParams.set('role', params.role);
      }
      const qs = searchParams.toString();
      return apiRequest<AdminOverviewResponseData>(
        `/admin/overview${qs ? `?${qs}` : ''}`,
        {
          method: 'GET',
        }
      );
    },

    /**
     * PATCH /api/v1/admin/users/:id/status
     */
    toggleUserStatus: async (
      userId: string,
      status: 'ACTIVE' | 'SUSPENDED'
    ) => {
      const body: AdminToggleUserStatusRequestPayload = { status };
      return apiRequest<{ userId: string; status: 'ACTIVE' | 'SUSPENDED' }>(
        `/admin/users/${encodeURIComponent(userId)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        }
      );
    },

    /**
     * DELETE /api/v1/admin/users/:id
     */
    deleteUser: async (userId: string) => {
      return apiRequest<{ userId: string; deleted: boolean }>(
        `/admin/users/${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
        }
      );
    },

    /**
     * PATCH /api/v1/admin/artworks/:id/feature
     */
    toggleArtworkFeatured: async (artworkId: string, featured: boolean) => {
      const body: AdminToggleArtworkFeatureRequestPayload = { featured };
      return apiRequest<{ artworkId: string; featured: boolean }>(
        `/admin/artworks/${encodeURIComponent(artworkId)}/feature`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        }
      );
    },

    /**
     * DELETE /api/v1/admin/artworks/:id
     */
    deleteArtwork: async (artworkId: string) => {
      return apiRequest<{ artworkId: string; deleted: boolean }>(
        `/admin/artworks/${encodeURIComponent(artworkId)}`,
        {
          method: 'DELETE',
        }
      );
    },
  },
};

export default siahSefidApi;
