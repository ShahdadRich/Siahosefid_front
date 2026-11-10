import test from 'node:test';
import assert from 'node:assert/strict';
import { ART_STYLES, INITIAL_ARTWORKS, INITIAL_USERS } from '../data/siahSefidData';
import { PRESET_TOP_UPS } from '../components/RegistrationModals';
import {
  formatTomanPrice,
  formatLocalizedPrice,
  getStyleLabel,
  computePlatformMetrics,
  filterArtworks,
  validateArtistRegistration,
  validateCollectorRegistration,
  validateArtworkInput,
  evaluateArtworkPurchase,
  getPathForView,
  resolveViewFromLocation,
} from './siahSefidLogic';
import { hexToVec3, CONFIG, LIGHT_CONFIG } from '../components/FlueCanvas';
import { MESH_DRIFT_COLORS, MESH_DRIFT_UNIFORMS } from '../components/MeshDriftCanvas';
import { cn } from '../lib/utils';
import {
  API_BASE_URL,
  toRegisterArtistPayload,
  toRegisterCollectorPayload,
  toCreateArtworkPayload,
  toGalleryPriceRangeQuery,
} from '../services/api';

test('Centralized REST API service layer (src/services/api.ts) maps payloads and query parameters accurately', () => {
  assert.equal(API_BASE_URL, 'http://localhost:4000/api/v1');

  const artistPayload = toRegisterArtistPayload({
    fullName: 'کیوان دولتشاهی',
    artisticAlias: 'KEYVAN / سایه‌نگار',
    artisticStyle: 'OTHER',
    customStyle: 'چیدمان مفهومی و هنر نور',
    phone: '09123456789',
    email: 'keyvan@siahosefid.art',
  });
  assert.deepEqual(artistPayload, {
    fullName: 'کیوان دولتشاهی',
    artisticName: 'KEYVAN / سایه‌نگار',
    artisticStyle: 'OTHER',
    customStyle: 'چیدمان مفهومی و هنر نور',
    phone: '09123456789',
    email: 'keyvan@siahosefid.art',
  });

  const collectorPayload = toRegisterCollectorPayload({
    fullName: 'سارا نیازی',
    email: 'sara@collector.ir',
    phone: '09128889900',
    initialTopUp: 50000000,
  });
  assert.deepEqual(collectorPayload, {
    fullName: 'سارا نیازی',
    email: 'sara@collector.ir',
    phone: '09128889900',
    initialWalletTopUp: 50000000,
  });

  const artPayload = toCreateArtworkPayload({
    title: 'منظومه خاکستر شماره ۱۲',
    titleEn: 'Ash Constellation XII',
    style: 'OTHER',
    customStyle: 'چیدمان مفهومی',
    price: 55000000,
    dimensions: '120 × 160 cm',
    medium: 'زغال فشرده و ورق نقره روی بوم کتان',
    story: 'واکاوی مرز میان نور خاکستری و بافت متخلخل زغال روی کتان خام.',
    image: '/images/art_crimson_void_canvas_1793998762808.jpg',
  });
  assert.equal(artPayload.technique, 'زغال فشرده و ورق نقره روی بوم کتان');
  assert.equal(artPayload.customStyle, 'چیدمان مفهومی');
  assert.equal(
    artPayload.imageUrl,
    '/images/art_crimson_void_canvas_1793998762808.jpg'
  );

  assert.equal(toGalleryPriceRangeQuery('UNDER_45M'), 'under-45m');
  assert.equal(toGalleryPriceRangeQuery('45M_TO_70M'), '45m-70m');
  assert.equal(toGalleryPriceRangeQuery('OVER_70M'), 'above-70m');
  assert.equal(toGalleryPriceRangeQuery('ALL'), undefined);
});

test('URL pathname routing maps /, /gallery, /studio, /collector, and /admin deterministically', () => {
  assert.equal(getPathForView('landing'), '/');
  assert.equal(getPathForView('gallery'), '/gallery');
  assert.equal(getPathForView('artist-panel'), '/studio');
  assert.equal(getPathForView('collector-panel'), '/collector');
  assert.equal(getPathForView('admin-panel'), '/admin');

  assert.equal(resolveViewFromLocation('/'), 'landing');
  assert.equal(resolveViewFromLocation('/gallery'), 'gallery');
  assert.equal(resolveViewFromLocation('/studio'), 'artist-panel');
  assert.equal(resolveViewFromLocation('/collector'), 'collector-panel');
  assert.equal(resolveViewFromLocation('/admin'), 'admin-panel');
  assert.equal(resolveViewFromLocation('/admin/'), 'admin-panel');
});

test('FlueCanvas CONFIG, LIGHT_CONFIG and hexToVec3 match exact WebGL2 shader specification', () => {
  assert.equal(CONFIG.bgColor, '#07080c');
  assert.equal(CONFIG.colorD, '#eceff5');
  assert.equal(CONFIG.maxDpr, 1);
  assert.equal(CONFIG.smokeScale, 2.51);
  assert.equal(CONFIG.density, 2.15);
  assert.equal(LIGHT_CONFIG.bgColor, '#f5f4f0');
  assert.equal(LIGHT_CONFIG.colorA, '#d6d5d2');
  assert.equal(LIGHT_CONFIG.colorB, '#505050');
  assert.equal(LIGHT_CONFIG.colorC, '#262626');
  assert.equal(LIGHT_CONFIG.colorD, '#141314');
  assert.equal(LIGHT_CONFIG.glow, 0.0);
  const vec = hexToVec3('#ffffff');
  assert.deepEqual(vec, [1, 1, 1]);
});

test('MeshDriftCanvas WebGL1 colours, packed uniforms, and cn utility match specification', () => {
  assert.deepEqual(MESH_DRIFT_COLORS[0], [0.063, 0.063, 0.063]);
  assert.deepEqual(MESH_DRIFT_COLORS[1], [0.961, 0.961, 0.961]);
  assert.deepEqual(MESH_DRIFT_COLORS[2], [0.690, 0.690, 0.690]);
  assert.deepEqual(MESH_DRIFT_COLORS[3], [0.227, 0.227, 0.227]);
  assert.equal(MESH_DRIFT_UNIFORMS.timeScale, -0.78);
  assert.equal(MESH_DRIFT_UNIFORMS.colorCount, 4.0);
  assert.equal(MESH_DRIFT_UNIFORMS.maxDpr, 2);
  assert.deepEqual(MESH_DRIFT_UNIFORMS.u_shape, [1.98, 0.31, 0.79, 0.01]);
  assert.equal(cn('bg-card', false && 'hidden', 'rounded-full'), 'bg-card rounded-full');
});

test('formatLocalizedPrice and getStyleLabel support both FA and EN languages', () => {
  assert.equal(formatLocalizedPrice(48000000, 'en'), '48,000,000 TOMAN');
  assert.ok(formatLocalizedPrice(48000000, 'fa').includes('تومان'));
  assert.equal(getStyleLabel('SCULPTURE', 'fa'), 'مجسمه‌سازی');
  assert.equal(getStyleLabel('SCULPTURE', 'en'), 'Sculpture');
});

test('computePlatformMetrics calculates live members, artists, and curated artworks accurately', () => {
  const metrics = computePlatformMetrics(INITIAL_USERS, INITIAL_ARTWORKS);
  assert.equal(metrics.totalMembers, 1240 + INITIAL_USERS.length);
  assert.equal(metrics.activeArtists, 180 + 4);
  assert.equal(metrics.curatedArtworks, 634 + INITIAL_ARTWORKS.length);
  assert.equal(metrics.soldArtworks, 0);
});

test('filterArtworks filters by artistic style, price range, and artist ID', () => {
  const sculptures = filterArtworks(INITIAL_ARTWORKS, {
    style: 'SCULPTURE',
    priceFilter: 'ALL',
    artistId: 'ALL',
  });
  assert.equal(sculptures.length, 1);
  assert.equal(sculptures[0].id, 'art-3');

  const highValue = filterArtworks(INITIAL_ARTWORKS, {
    style: 'ALL',
    priceFilter: 'OVER_70M',
    artistId: 'ALL',
  });
  assert.equal(highValue.length, 1);
  assert.equal(highValue[0].id, 'art-3');
});

test('validateArtistRegistration enforces required fields and accepts valid artist data', () => {
  const invalid = validateArtistRegistration({
    fullName: 'ا',
    artisticAlias: '',
    artisticStyle: 'MINIMALISM',
    phone: '123',
    email: 'invalid-email',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.artisticAlias);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.email);

  const valid = validateArtistRegistration({
    fullName: 'کیوان دولتشاهی',
    artisticAlias: 'KEYVAN / خط‌سوم',
    artisticStyle: 'ABSTRACT',
    phone: '09123456789',
    email: 'keyvan@siahosefid.art',
  });
  assert.equal(valid.valid, true);
});

test('validateCollectorRegistration validates collector inputs and optional initial wallet top-up', () => {
  const valid = validateCollectorRegistration({
    fullName: 'سارا نیازی',
    email: 'sara@collector.ir',
    phone: '09128889900',
    initialTopUp: 50000000,
  });
  assert.equal(valid.valid, true);
});

test('RegistrationModals style tiles and wallet top-up monoliths match exact Swiss Editorial specification', () => {
  assert.deepEqual(
    ART_STYLES.map((s) => s.labelFa),
    ['مینیمالیسم', 'آبستره و خطاطی', 'مجسمه‌سازی', 'عکاسی هنری', 'دیجیتال آرت', 'غیره']
  );
  assert.deepEqual(PRESET_TOP_UPS, [0, 25000000, 50000000, 100000000, 200000000]);

  const missingCustomStyle = validateArtistRegistration({
    fullName: 'کیوان دولتشاهی',
    artisticAlias: 'سایه‌نگار',
    artisticStyle: 'OTHER',
    customStyle: '',
    phone: '09123456789',
    email: 'keyvan@siahosefid.art',
  });
  assert.equal(missingCustomStyle.valid, false);
  assert.ok(missingCustomStyle.errors.customStyle);

  const validCustomStyle = validateArtistRegistration({
    fullName: 'کیوان دولتشاهی',
    artisticAlias: 'سایه‌نگار',
    artisticStyle: 'OTHER',
    customStyle: 'چیدمان مفهومی',
    phone: '09123456789',
    email: 'keyvan@siahosefid.art',
  });
  assert.equal(validCustomStyle.valid, true);
});

test('validateArtworkInput checks title, minimum price, and story length', () => {
  const invalid = validateArtworkInput({
    title: '',
    style: 'MINIMALISM',
    price: 500,
    dimensions: '100x100 cm',
    medium: 'اکریلیک',
    story: 'کوتاه',
    image: '',
  });
  assert.equal(invalid.valid, false);

  const valid = validateArtworkInput({
    title: 'تضاد خاکستر شماره ۹',
    style: 'MINIMALISM',
    price: 45000000,
    dimensions: '120 × 150 cm',
    medium: 'زغال و ورق نقره روی بوم',
    story: 'اثری مینیمال با تمرکز بر بافت زغال طبیعی و بازتاب نور در گالری.',
    image: '/images/art_crimson_void_canvas_1793998762808.jpg',
  });
  assert.equal(valid.valid, true);
});

test('evaluateArtworkPurchase verifies wallet balance sufficiency and calculates remaining balance', () => {
  const artwork = INITIAL_ARTWORKS[0]; // price: 48,000,000
  const wealthyCollector = INITIAL_USERS.find((u) => u.id === 'collector-1')!; // balance: 125,000,000

  const res = evaluateArtworkPurchase(artwork, wealthyCollector);
  assert.equal(res.allowed, true);
  assert.equal(res.remainingBalance, 125000000 - 48000000);

  const lowBalanceCollector = { ...wealthyCollector, walletBalance: 10000000 };
  const denied = evaluateArtworkPurchase(artwork, lowBalanceCollector);
  assert.equal(denied.allowed, false);
  assert.ok(denied.reasonFa);
});

test('formatTomanPrice formats numbers cleanly', () => {
  assert.equal(formatTomanPrice(48000000), '48,000,000 TOMAN');
});

