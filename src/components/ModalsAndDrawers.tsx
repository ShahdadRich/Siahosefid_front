import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';
import {
  ProjectWork,
  PerspectiveArticle,
  WorkCategory,
  BrandConfig,
  DEFAULT_BRAND_CONFIG,
} from '../data/studioData';
import {
  EnquiryFormInput,
  SubmittedEnquiry,
  validateEnquiryForm,
  createEnquiryReference,
  getAdjacentWorks,
  resolveBrandConfig,
} from '../utils/studioLogic';

/* ============================================================================
 * 1. CASE STUDY LIGHTBOX MODAL
 * ========================================================================== */
interface CaseStudyModalProps {
  work: ProjectWork | null;
  allWorks: ProjectWork[];
  onClose: () => void;
  onSelectWork: (work: ProjectWork) => void;
  onCommissionSimilar: (scope: Exclude<WorkCategory, 'ALL'>, projectTitle: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  work,
  allWorks,
  onClose,
  onSelectWork,
  onCommissionSimilar,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (work) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [work, onClose]);

  if (!work) return null;

  const { prev, next } = getAdjacentWorks(allWorks, work.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Case study: ${work.title}`}
        className="fixed inset-0 z-50 bg-[#0A0A0A]/95 text-[#F7F7F5] overflow-y-auto"
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 py-8 md:py-12">
          {/* Top Modal Header */}
          <div className="flex items-center justify-between gap-4 pb-6 mb-10 border-b border-white/15">
            <div className="font-mono-label text-neutral-400 flex items-center gap-2">
              <span className="text-[#F7F7F5]">{work.index} — CASE STUDY</span>
              <span aria-hidden="true">·</span>
              <span>{work.category}</span>
              <span aria-hidden="true">·</span>
              <span>{work.location}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study modal"
              className="px-5 py-2 rounded-full border border-white/30 hover:bg-[#F7F7F5] hover:text-[#0A0A0A] font-mono-label inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Case Study Title & Hero Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12 items-end">
            <div className="lg:col-span-8">
              <p className="font-mono-label text-neutral-400 mb-3">
                CLIENT: {work.client} · {work.year}
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[0.95] text-[#F7F7F5]">
                {work.title}
              </h2>
              <p className="text-lg text-neutral-300 mt-4 max-w-2xl">{work.subtitle}</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <button
                type="button"
                onClick={() => onCommissionSimilar(work.category, work.title)}
                className="px-6 py-3.5 rounded-full bg-[#F7F7F5] text-[#0A0A0A] hover:bg-neutral-200 font-mono-label inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Commission Similar Scope</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Visual Frame */}
          <div className="w-full aspect-[16/9] overflow-hidden border border-white/15 bg-neutral-900 mb-12">
            <img
              src={work.image}
              alt={work.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* 3-Column Quantified Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 px-6 border-y border-white/15 mb-12">
            {work.metrics.map((m, idx) => (
              <div key={m.label}>
                <span className="font-mono-label text-neutral-400 block mb-2">
                  [0{idx + 1} — VERIFIED METRIC]
                </span>
                <p className="text-3xl md:text-4xl font-medium text-[#F7F7F5] tabular-nums">
                  {m.value}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Challenge / Architecture / Outcome + Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h3 className="font-mono-label text-neutral-400 mb-2">01 — CHALLENGE</h3>
                <p className="text-base text-neutral-200 leading-relaxed">{work.challenge}</p>
              </div>
              <div>
                <h3 className="font-mono-label text-neutral-400 mb-2">
                  02 — ARCHITECTURAL INTERVENTION
                </h3>
                <p className="text-base text-neutral-200 leading-relaxed">
                  {work.architecture}
                </p>
              </div>
              <div>
                <h3 className="font-mono-label text-neutral-400 mb-2">
                  03 — COMMERCIAL OUTCOME
                </h3>
                <p className="text-base text-neutral-200 leading-relaxed">{work.outcome}</p>
              </div>
            </div>

            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/15 pt-8 lg:pt-0 lg:pl-8 space-y-6">
              <div>
                <h3 className="font-mono-label text-neutral-400 mb-3">
                  SHIPPED DELIVERABLES
                </h3>
                <ul className="space-y-2.5 border-t border-white/10 pt-3">
                  {work.deliverables.map((del, i) => (
                    <li
                      key={del}
                      className="text-sm text-neutral-200 flex items-center justify-between gap-2 pb-2 border-b border-white/10"
                    >
                      <span>{del}</span>
                      <span className="font-mono-label text-neutral-500">0{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="font-mono-label text-neutral-500">{work.credits}</p>
            </div>
          </div>

          {/* Next / Previous Project Navigation */}
          <div className="pt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onSelectWork(prev)}
              className="font-mono-label text-neutral-300 hover:text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>PREV: {prev.title}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectWork(next)}
              className="font-mono-label text-neutral-300 hover:text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <span>NEXT: {next.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ============================================================================
 * 2. PERSPECTIVE ESSAY READER MODAL
 * ========================================================================== */
interface ArticleModalProps {
  article: PerspectiveArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
        className="fixed inset-0 z-50 bg-[#F7F7F5] text-[#111111] overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-16">
          <div className="flex items-center justify-between pb-6 mb-10 border-b border-black/10">
            <div className="font-mono-label text-[#666666]">
              <span>{article.index} — {article.category}</span>
              <span aria-hidden="true"> · </span>
              <span>{article.date}</span>
              <span aria-hidden="true"> · </span>
              <span>{article.readTime}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close essay reader"
              className="px-5 py-2 rounded-full border border-[#111111] hover:bg-[#0A0A0A] hover:text-[#F7F7F5] font-mono-label inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Close Reader</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="font-mono-label text-[#666666] mb-3">{article.subtitle}</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.05] text-[#111111] mb-8">
            {article.title}
          </h2>

          <div className="py-5 px-6 border border-black/15 bg-black/[0.02] mb-10">
            <p className="font-mono-label text-[#666666] mb-1">THESIS SUMMARY</p>
            <p className="text-base font-medium text-[#111111] leading-relaxed">
              {article.keyTakeaway}
            </p>
          </div>

          <div className="space-y-6 text-base md:text-lg text-[#111111] leading-relaxed">
            {article.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-black/10 flex items-center justify-between font-mono-label text-[#666666]">
            <span>
              AUTHORED BY {article.author} — {article.authorRole}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#111111] hover:underline underline-offset-4 cursor-pointer"
            >
              RETURN TO INDEX ↑
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ============================================================================
 * 3. PROJECT ENQUIRY MODAL (WITH VALIDATION & ARCHIVAL RECEIPT)
 * ========================================================================== */
interface EnquiryModalProps {
  isOpen: boolean;
  initialScope: Exclude<WorkCategory, 'ALL'>;
  initialProjectNote?: string;
  onClose: () => void;
  onSubmitted: (submission: SubmittedEnquiry) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  initialScope,
  initialProjectNote,
  onClose,
  onSubmitted,
}) => {
  const [form, setForm] = useState<EnquiryFormInput>({
    name: '',
    email: '',
    company: '',
    scope: initialScope,
    budgetRange: '$100k – $250k',
    brief: initialProjectNote ? `Interested in scope similar to ${initialProjectNote}. ` : '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormInput, string>>>({});
  const [receipt, setReceipt] = useState<SubmittedEnquiry | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      scope: initialScope,
      brief: initialProjectNote
        ? `Interested in a commission similar to ${initialProjectNote}. `
        : prev.brief,
    }));
  }, [initialScope, initialProjectNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEnquiryForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const submission: SubmittedEnquiry = {
      ...form,
      referenceCode: createEnquiryReference(form, Date.now()),
      submittedAtIso: new Date().toISOString(),
    };
    setErrors({});
    setReceipt(submission);
    onSubmitted(submission);
  };

  const resetAndClose = () => {
    setReceipt(null);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Project Commission Enquiry"
        className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      >
        <div className="w-full max-w-2xl bg-[#F7F7F5] text-[#111111] border border-black/20 p-6 md:p-10 my-auto">
          <div className="flex items-center justify-between pb-5 mb-8 border-b border-black/10">
            <span className="font-mono-label text-[#666666]">
              NEW COMMISSION ENQUIRY — DIRECT PRINCIPAL REVIEW
            </span>
            <button
              type="button"
              onClick={resetAndClose}
              aria-label="Close enquiry modal"
              className="px-4 py-1.5 rounded-full border border-[#111111] hover:bg-[#0A0A0A] hover:text-[#F7F7F5] font-mono-label inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {receipt ? (
            <div className="py-8 space-y-6">
              <div className="flex items-center gap-3 text-[#111111]">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-mono-label">
                  COMMISSION BRIEF LOGGED — REF {receipt.referenceCode}
                </span>
              </div>
              <h3 className="text-3xl font-medium">
                Thank you, {receipt.name}.
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Your brief for <strong className="text-[#111111]">{receipt.company}</strong> (
                {receipt.scope} Discipline · {receipt.budgetRange}) has been routed directly to our
                managing partners. You will receive a written architectural response at{' '}
                <span className="underline">{receipt.email}</span> within 24 business hours.
              </p>
              <div className="p-4 border border-black/15 bg-black/[0.03] font-mono-label text-[#111111] space-y-1">
                <div>REFERENCE ID: {receipt.referenceCode}</div>
                <div>DISCIPLINE SCOPE: {receipt.scope}</div>
                <div>ALLOCATION BUDGET: {receipt.budgetRange}</div>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-3 rounded-full bg-[#0A0A0A] text-[#F7F7F5] font-mono-label cursor-pointer"
              >
                Return to Portfolio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-medium text-[#111111]">
                Initiate a studio dialogue.
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="enquiry-name"
                    className="block font-mono-label text-[#111111] mb-2"
                  >
                    01. YOUR NAME *
                  </label>
                  <input
                    id="enquiry-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aria Hosseini"
                    className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 focus:border-[#111111] focus:outline-none text-sm"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-700 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="enquiry-email"
                    className="block font-mono-label text-[#111111] mb-2"
                  >
                    02. WORK EMAIL *
                  </label>
                  <input
                    id="enquiry-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="aria@organization.com"
                    className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 focus:border-[#111111] focus:outline-none text-sm"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-700 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="enquiry-company"
                    className="block font-mono-label text-[#111111] mb-2"
                  >
                    03. BRAND OR ORGANIZATION *
                  </label>
                  <input
                    id="enquiry-company"
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Atelier Monolith"
                    className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 focus:border-[#111111] focus:outline-none text-sm"
                  />
                  {errors.company && (
                    <p className="mt-1.5 text-xs text-red-700 font-medium">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="enquiry-budget"
                    className="block font-mono-label text-[#111111] mb-2"
                  >
                    04. ALLOCATED INVESTMENT
                  </label>
                  <select
                    id="enquiry-budget"
                    value={form.budgetRange}
                    onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F5] border border-black/25 focus:border-[#111111] focus:outline-none text-sm"
                  >
                    <option value="$50k – $100k">$50k – $100k</option>
                    <option value="$100k – $250k">$100k – $250k</option>
                    <option value="$250k – $500k">$250k – $500k</option>
                    <option value="$500k+ Flagship Retainer">$500k+ Flagship Retainer</option>
                  </select>
                </div>
              </div>

              {/* Discipline Selector */}
              <div>
                <span className="block font-mono-label text-[#111111] mb-2">
                  05. PRIMARY DISCIPLINE SCOPE
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['BRAND', 'DIGITAL', 'CONTENT', 'MOTION'] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setForm({ ...form, scope: sc })}
                      className={`py-2.5 px-3 font-mono-label border transition-colors cursor-pointer ${
                        form.scope === sc
                          ? 'bg-[#0A0A0A] text-[#F7F7F5] border-[#0A0A0A]'
                          : 'bg-transparent text-[#111111] border-black/20 hover:border-[#111111]'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="enquiry-brief"
                  className="block font-mono-label text-[#111111] mb-2"
                >
                  06. PROJECT BRIEF & TARGET LAUNCH *
                </label>
                <textarea
                  id="enquiry-brief"
                  rows={4}
                  value={form.brief}
                  onChange={(e) => setForm({ ...form, brief: e.target.value })}
                  placeholder="Describe your product, architectural goals, and desired launch quarter..."
                  className="w-full p-3.5 bg-transparent border border-black/25 focus:border-[#111111] focus:outline-none text-sm"
                />
                {errors.brief && (
                  <p className="mt-1.5 text-xs text-red-700 font-medium">{errors.brief}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-3 font-mono-label text-[#666666] hover:text-[#111111] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#0A0A0A] text-[#F7F7F5] hover:bg-[#222222] font-mono-label cursor-pointer"
                >
                  Transmit Commission Brief
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ============================================================================
 * 4. BRAND IDENTITY CUSTOMIZER MODAL (FOR CUSTOM BRAND NAME / TOPIC)
 * ========================================================================== */
interface BrandCustomizerModalProps {
  isOpen: boolean;
  currentConfig: BrandConfig;
  onSave: (newConfig: BrandConfig) => void;
  onClose: () => void;
}

export const BrandCustomizerModal: React.FC<BrandCustomizerModalProps> = ({
  isOpen,
  currentConfig,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<BrandConfig>(currentConfig);

  useEffect(() => {
    setDraft(currentConfig);
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(resolveBrandConfig(draft));
    onClose();
  };

  const handleReset = () => {
    onSave(DEFAULT_BRAND_CONFIG);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Personalize Brand Identity"
        className="fixed inset-0 z-50 bg-[#0A0A0A]/90 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      >
        <div className="w-full max-w-xl bg-[#F7F7F5] text-[#111111] border border-black/20 p-6 md:p-10 my-auto">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/10">
            <span className="font-mono-label text-[#666666]">
              BRAND IDENTITY CONFIGURATOR
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close brand customizer"
              className="px-4 py-1.5 rounded-full border border-[#111111] font-mono-label inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleApply} className="space-y-5">
            <div>
              <label
                htmlFor="custom-brand-name"
                className="block font-mono-label text-[#111111] mb-1.5"
              >
                STUDIO / BRAND WORDMARK (نام برند یا موضوع سایت)
              </label>
              <input
                id="custom-brand-name"
                type="text"
                value={draft.brandName}
                onChange={(e) => setDraft({ ...draft, brandName: e.target.value })}
                placeholder="DIRTVERSE®"
                className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="custom-brand-tagline"
                className="block font-mono-label text-[#111111] mb-1.5"
              >
                PROPOSITION TAGLINE
              </label>
              <input
                id="custom-brand-tagline"
                type="text"
                value={draft.brandTagline}
                onChange={(e) => setDraft({ ...draft, brandTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-city-1"
                  className="block font-mono-label text-[#111111] mb-1.5"
                >
                  PRIMARY CITY
                </label>
                <input
                  id="custom-city-1"
                  type="text"
                  value={draft.primaryCity}
                  onChange={(e) => setDraft({ ...draft, primaryCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="custom-city-2"
                  className="block font-mono-label text-[#111111] mb-1.5"
                >
                  SECONDARY CITY
                </label>
                <input
                  id="custom-city-2"
                  type="text"
                  value={draft.secondaryCity}
                  onChange={(e) => setDraft({ ...draft, secondaryCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-hero-lower"
                  className="block font-mono-label text-[#111111] mb-1.5"
                >
                  HERO LINE 1 (LOWERCASE)
                </label>
                <input
                  id="custom-hero-lower"
                  type="text"
                  value={draft.heroStatementLower}
                  onChange={(e) => setDraft({ ...draft, heroStatementLower: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="custom-hero-sentence"
                  className="block font-mono-label text-[#111111] mb-1.5"
                >
                  HERO LINE 2 (SENTENCE CASE)
                </label>
                <input
                  id="custom-hero-sentence"
                  type="text"
                  value={draft.heroStatementSentence}
                  onChange={(e) =>
                    setDraft({ ...draft, heroStatementSentence: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-transparent border border-black/25 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4 border-t border-black/10">
              <button
                type="button"
                onClick={handleReset}
                className="font-mono-label text-[#666666] hover:text-[#111111] cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#0A0A0A] text-[#F7F7F5] font-mono-label cursor-pointer"
              >
                Apply Brand Identity
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
