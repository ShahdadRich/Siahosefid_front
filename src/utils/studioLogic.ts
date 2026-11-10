import {
  ProjectWork,
  WorkCategory,
  ServiceItem,
  BrandConfig,
  DEFAULT_BRAND_CONFIG,
} from '../data/studioData';

export interface EnquiryFormInput {
  name: string;
  email: string;
  company: string;
  scope: Exclude<WorkCategory, 'ALL'>;
  budgetRange: string;
  brief: string;
}

export interface EnquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof EnquiryFormInput, string>>;
}

export interface SubmittedEnquiry extends EnquiryFormInput {
  referenceCode: string;
  submittedAtIso: string;
}

/**
 * Filters portfolio works by category and optional search query.
 */
export function filterWorksByCategory(
  works: ProjectWork[],
  category: WorkCategory,
  searchQuery: string = ''
): ProjectWork[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return works.filter((work) => {
    const matchesCategory = category === 'ALL' || work.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    return (
      work.title.toLowerCase().includes(normalizedQuery) ||
      work.client.toLowerCase().includes(normalizedQuery) ||
      work.subtitle.toLowerCase().includes(normalizedQuery) ||
      work.location.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Computes item counts per category for filter controls.
 */
export function getCategoryCounts(works: ProjectWork[]): Record<WorkCategory, number> {
  const counts: Record<WorkCategory, number> = {
    ALL: works.length,
    BRAND: 0,
    DIGITAL: 0,
    CONTENT: 0,
    MOTION: 0,
  };

  for (const work of works) {
    counts[work.category] = (counts[work.category] || 0) + 1;
  }

  return counts;
}

/**
 * Formats a section index string in strict Swiss archival bracket notation: e.g. [01 — ABOUT]
 */
export function formatArchivalIndex(indexNumber: number | string, label: string): string {
  const padded =
    typeof indexNumber === 'number'
      ? String(indexNumber).padStart(2, '0')
      : indexNumber.padStart(2, '0');
  return `${padded} — ${label.trim().toUpperCase()}`;
}

/**
 * Formats live studio time in tabular HH:MM:SS format for a given UTC offset or timezone.
 */
export function formatStudioClock(date: Date, timeZone: string = 'Europe/Zurich'): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}

/**
 * Validates the project enquiry form strictly without silent fallbacks.
 */
export function validateEnquiryForm(input: EnquiryFormInput): EnquiryValidationResult {
  const errors: Partial<Record<keyof EnquiryFormInput, string>> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Please enter your full name (minimum 2 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please provide a valid work email address.';
  }

  if (!input.company || input.company.trim().length < 2) {
    errors.company = 'Please specify your organization or brand name.';
  }

  if (!input.brief || input.brief.trim().length < 15) {
    errors.brief = 'Please share a concise project brief (at least 15 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates a deterministic archival reference code for a submitted enquiry.
 */
export function createEnquiryReference(input: EnquiryFormInput, timestampMs: number): string {
  const scopePrefix = input.scope.slice(0, 3).toUpperCase();
  const suffix = String(Math.abs(timestampMs) % 10000).padStart(4, '0');
  return `DV-${scopePrefix}-${suffix}`;
}

/**
 * Sanitizes and merges user-customized brand identity settings with defaults.
 */
export function resolveBrandConfig(partial: Partial<BrandConfig>): BrandConfig {
  return {
    brandName: partial.brandName?.trim() || DEFAULT_BRAND_CONFIG.brandName,
    brandTagline: partial.brandTagline?.trim() || DEFAULT_BRAND_CONFIG.brandTagline,
    primaryCity: (partial.primaryCity?.trim() || DEFAULT_BRAND_CONFIG.primaryCity).toUpperCase(),
    secondaryCity: (
      partial.secondaryCity?.trim() || DEFAULT_BRAND_CONFIG.secondaryCity
    ).toUpperCase(),
    heroStatementLower:
      partial.heroStatementLower?.trim() || DEFAULT_BRAND_CONFIG.heroStatementLower,
    heroStatementSentence:
      partial.heroStatementSentence?.trim() || DEFAULT_BRAND_CONFIG.heroStatementSentence,
    heroSubcopy: partial.heroSubcopy?.trim() || DEFAULT_BRAND_CONFIG.heroSubcopy,
    foundedYear: partial.foundedYear?.trim() || DEFAULT_BRAND_CONFIG.foundedYear,
    contactEmail: partial.contactEmail?.trim() || DEFAULT_BRAND_CONFIG.contactEmail,
  };
}

/**
 * Finds the next and previous project in the portfolio list for modal carousel navigation.
 */
export function getAdjacentWorks(
  works: ProjectWork[],
  currentId: string
): { prev: ProjectWork; next: ProjectWork } {
  const idx = works.findIndex((w) => w.id === currentId);
  if (idx === -1 || works.length === 0) {
    return { prev: works[0], next: works[0] };
  }
  const prevIdx = (idx - 1 + works.length) % works.length;
  const nextIdx = (idx + 1) % works.length;
  return {
    prev: works[prevIdx],
    next: works[nextIdx],
  };
}

/**
 * Matches a service item by category key.
 */
export function findServiceByCategory(
  services: ServiceItem[],
  category: Exclude<WorkCategory, 'ALL'>
): ServiceItem | undefined {
  return services.find((s) => s.categoryKey === category);
}
