import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { ServiceItem, WorkCategory } from '../data/studioData';

interface ServicesSectionProps {
  services: ServiceItem[];
  onCommissionScope: (scope: Exclude<WorkCategory, 'ALL'>) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onCommissionScope,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('service-brand');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="services"
      className="py-24 md:py-36 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-black/10"
    >
      {/* Section Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-4 border-b border-black/10 items-end">
        <div className="lg:col-span-7">
          <p className="font-mono-label text-[#666666] mb-4">02 — CAPABILITIES & SERVICES</p>
          <h2 className="headline-giant font-medium text-[#111111]">
            <span className="lowercase text-[#666666] font-normal">four </span>
            <span>Disciplines.</span>
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className="text-sm md:text-base text-[#666666] leading-relaxed">
            We operate as an integrated senior unit—combining strategic brand positioning,
            flagship engineering, documentary production, and kinetic motion under one roof.
          </p>
        </div>
      </div>

      {/* Full-Width Interactive Horizontal Service Rows Separated by 1px Borders */}
      <div className="divide-y divide-black/10 border-b border-black/10">
        {services.map((service) => {
          const isExpanded = expandedId === service.id;
          const isHovered = hoveredId === service.id;

          return (
            <div key={service.id} className="transition-colors duration-300 ease-editorial">
              {/* Interactive Row Header */}
              <button
                type="button"
                onClick={() => toggleRow(service.id)}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-expanded={isExpanded}
                className={`w-full text-left py-8 md:py-10 px-4 md:px-8 transition-colors duration-300 ease-editorial flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer ${
                  isHovered || isExpanded
                    ? 'bg-[#0A0A0A] text-[#F7F7F5]'
                    : 'bg-transparent text-[#111111]'
                }`}
              >
                {/* Left: Index + Discipline Display Title */}
                <div className="flex items-baseline gap-6 md:gap-10">
                  <span
                    className={`font-mono-label ${
                      isHovered || isExpanded ? 'text-neutral-400' : 'text-[#666666]'
                    }`}
                  >
                    {service.index}
                  </span>
                  <h3 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-none">
                    {service.title}
                  </h3>
                </div>

                {/* Center: Short Summary + Floating Preview Badge on Hover/Active */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  <span
                    className={`text-sm md:text-base max-w-md ${
                      isHovered || isExpanded ? 'text-neutral-300' : 'text-[#666666]'
                    }`}
                  >
                    {service.shortSummary}
                  </span>

                  <span
                    className={`font-mono-label px-3 py-1 border transition-opacity duration-200 whitespace-nowrap ${
                      isHovered || isExpanded
                        ? 'opacity-100 border-white/30 text-[#F7F7F5]'
                        : 'opacity-0 lg:opacity-60 border-black/15 text-[#666666]'
                    }`}
                  >
                    {service.badgeText}
                  </span>
                </div>

                {/* Right: Expand Indicator */}
                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  <span
                    className={`font-mono-label ${
                      isHovered || isExpanded ? 'text-neutral-300' : 'text-[#666666]'
                    }`}
                  >
                    {isExpanded ? 'CLOSE SPEC' : 'INSPECT'}
                  </span>
                  {isExpanded ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Expanded Architectural Specification Drawer */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden bg-[#0A0A0A] text-[#F7F7F5] border-t border-white/12"
                  >
                    <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      {/* Column 1: Lead Statement & Benchmark Proof */}
                      <div className="lg:col-span-5 space-y-6">
                        <p className="font-mono-label text-neutral-400">
                          ARCHITECTURAL SPECIFICATION — {service.timelineWeeks}
                        </p>
                        <p className="text-base md:text-lg text-neutral-200 leading-relaxed">
                          {service.leadStatement}
                        </p>
                        <div className="pt-4 border-t border-white/12">
                          <span className="font-mono-label text-neutral-400 block mb-1">
                            VERIFIED CLIENT OUTCOME
                          </span>
                          <p className="text-sm font-medium text-[#F7F7F5]">
                            {service.benchmarkMetric}
                          </p>
                        </div>
                      </div>

                      {/* Column 2: Concrete Deliverables List */}
                      <div className="lg:col-span-4 space-y-4">
                        <p className="font-mono-label text-neutral-400">
                          CORE DELIVERABLES
                        </p>
                        <ul className="divide-y divide-white/10 border-t border-b border-white/10">
                          {service.deliverables.map((item, i) => (
                            <li
                              key={item}
                              className="py-3 text-sm text-neutral-200 flex items-center justify-between gap-4"
                            >
                              <span>{item}</span>
                              <span className="font-mono-label text-neutral-500">
                                0{i + 1}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => onCommissionScope(service.categoryKey)}
                          className="mt-4 w-full py-3.5 px-5 rounded-full bg-[#F7F7F5] text-[#0A0A0A] hover:bg-neutral-200 font-mono-label inline-flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Commission {service.title} Scope</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Column 3: Visual Preview Container */}
                      <div className="lg:col-span-3">
                        <div className="aspect-[4/3] w-full overflow-hidden border border-white/15 bg-neutral-900">
                          <img
                            src={service.previewImage}
                            alt={`${service.title} discipline showcase`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <p className="font-mono-label text-neutral-400 mt-2">
                          ARCHIVE REF — {service.categoryKey}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
