'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import FloatingNav from '@/components/Landing/FloatingNav';
import TaglineRevealSection from '@/components/Landing/TaglineRevealSection';
import InteractiveOutputStage from '@/components/Landing/InteractiveOutputStage';
import MarginAndStagesSection from '@/components/Landing/MarginAndStagesSection';
import PricingFaqAndLaunch, {
  LANDING_FAQ_ITEMS,
} from '@/components/Landing/PricingFaqAndLaunch';
import {
  SolarArrowRightBold,
  SolarBoltBoldDuotone,
  SolarPrinterBoldDuotone,
  SolarShieldCheckBoldDuotone,
} from '@/components/Landing/SolarIcons';

export default function LandingPage() {
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const heroMidRef = useRef<HTMLDivElement | null>(null);
  const heroFgRef = useRef<HTMLDivElement | null>(null);

  // Transform-based 3-layer scroll parallax with mobile damping & prefers-reduced-motion support
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId = 0;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      if (scrollY > 1400) return;

      const isMobile = window.innerWidth < 768;
      const mobileFactor = isMobile ? 0.45 : 1;

      if (heroBgRef.current) {
        const bgOffset = Math.round(scrollY * 0.22 * mobileFactor);
        heroBgRef.current.style.transform = `translate3d(0, ${bgOffset}px, 0) scale(1.06)`;
      }
      if (heroMidRef.current) {
        const midOffset = Math.round(scrollY * -0.07 * mobileFactor);
        heroMidRef.current.style.transform = `translate3d(0, ${midOffset}px, 0)`;
      }
      if (heroFgRef.current) {
        const fgOffset = Math.round(scrollY * -0.14 * mobileFactor);
        heroFgRef.current.style.transform = `translate3d(0, ${fgOffset}px, 0)`;
      }
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#010102] text-[#F5F5F7] font-sans antialiased overflow-x-hidden selection:bg-[#AD96F1] selection:text-[#010102]">
      {/* Floating navigation bar */}
      <FloatingNav />

      <main className="relative z-10">
        {/* ============================================================ */}
        {/* HERO SECTION — 3-Layer Atmospheric Kitchen Pass             */}
        {/* ============================================================ */}
        <section
          className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-28 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden"
          aria-label="HFC OS Hero Section"
        >
          {/* Layer 1: Parallax Background with Kitchen Fire Atmosphere */}
          <div
            ref={heroBgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -top-16 -bottom-16 bg-cover bg-center bg-no-repeat opacity-40 will-change-transform"
            style={{
              backgroundImage: 'url(/images/landing/kitchen-fire-pass.jpg)',
              transform: 'scale(1.06)',
            }}
          />

          {/* Layer 2: Gradient Lighting & Radial Depth Overlay */}
          <div
            ref={heroMidRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#010102]/80 via-[#010102]/60 to-[#010102] will-change-transform"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,rgba(173,150,241,0.18),transparent_70%)]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[360px] bg-[radial-gradient(circle,rgba(88,246,177,0.12),transparent_70%)] blur-3xl pointer-events-none" />
          </div>

          {/* Layer 3: Foreground Hero Narrative Typography & Interactive Actions */}
          <div
            ref={heroFgRef}
            className="relative z-20 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 will-change-transform"
          >
            {/* Live Kitchen Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818]/90 border border-[#272727] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58F6B1] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#58F6B1]" />
              </span>
              <span className="caption-1 text-[#F5F5F7]">
                Proven in production at Haseeb&apos;s Foods Café (Samahni, AJK)
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="display text-[#F5F5F7] tracking-tight max-w-4xl mx-auto">
              The Offline-First Restaurant OS Built for Pakistani Kitchens.
            </h1>

            {/* Sub-Headline */}
            <p className="body-1 text-[#9B9B9B] max-w-2xl mx-auto">
              When PTCL cuts out, power flickers, and Friday rush floods your counter,
              HFC OS keeps printing 80mm thermal KOTs, flashing kitchen screens, and ringing bills without zero-point cloud delay.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#interactive-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#AD96F1] hover:opacity-95 text-[#010102] font-semibold text-sm transition-transform duration-200 ease-weighted active:scale-[0.98] shadow-apple-md"
              >
                <span>Interactive Live Demo</span>
                <SolarArrowRightBold className="w-4 h-4" />
              </a>

              <Link
                href="/pos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#181818] hover:bg-[#1F1F1F] border border-[#272727] text-[#F5F5F7] font-semibold text-sm transition-transform duration-200 ease-weighted active:scale-[0.98]"
              >
                <SolarBoltBoldDuotone className="w-4 h-4 text-[#58F6B1]" />
                <span>Launch Restaurant POS</span>
              </Link>
            </div>

            {/* Core Proof Numbers Strip */}
            <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#010102]/70 border border-[#1F1F1F] backdrop-blur-md">
                <div className="flex items-center gap-2 text-[#58F6B1] mb-1">
                  <SolarShieldCheckBoldDuotone className="w-4 h-4" />
                  <span className="caption-2 font-mono uppercase tracking-wider text-[#9B9B9B]">Architecture</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F7]">100% Offline</div>
                <p className="caption-2 text-[#9B9B9B] mt-1">IndexedDB stores every order locally</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#010102]/70 border border-[#1F1F1F] backdrop-blur-md">
                <div className="flex items-center gap-2 text-[#AD96F1] mb-1">
                  <SolarPrinterBoldDuotone className="w-4 h-4" />
                  <span className="caption-2 font-mono uppercase tracking-wider text-[#9B9B9B]">KOT Printing</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F7]">80mm Thermal</div>
                <p className="caption-2 text-[#9B9B9B] mt-1">ESC/POS USB & Network ready</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#010102]/70 border border-[#1F1F1F] backdrop-blur-md">
                <div className="flex items-center gap-2 text-[#58F6B1] mb-1">
                  <SolarBoltBoldDuotone className="w-4 h-4" />
                  <span className="caption-2 font-mono uppercase tracking-wider text-[#9B9B9B]">Hardware</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F7]">Rs. 0 Upfront</div>
                <p className="caption-2 text-[#9B9B9B] mt-1">Runs on existing laptop, tablet or PC</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#010102]/70 border border-[#1F1F1F] backdrop-blur-md">
                <div className="flex items-center gap-2 text-[#AD96F1] mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#AD96F1]" />
                  <span className="caption-2 font-mono uppercase tracking-wider text-[#9B9B9B]">Commission</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F7]">0% Aggregator</div>
                <p className="caption-2 text-[#9B9B9B] mt-1">Direct home delivery fleet manager</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TAGLINE REVEAL — Scroll-Linked Editorial Kinetic Statement   */}
        {/* ============================================================ */}
        <TaglineRevealSection />

        {/* ============================================================ */}
        {/* INTERACTIVE STAGE — Tabbed Terminal / KDS / Thermal / Mobile */}
        {/* ============================================================ */}
        <section id="interactive-demo" className="scroll-mt-24">
          <InteractiveOutputStage />
        </section>

        {/* ============================================================ */}
        {/* MARGIN & ARCHITECTURE COMPARISON — Aggregator Cut vs HFC OS */}
        {/* ============================================================ */}
        <section id="architecture" className="scroll-mt-24">
          <MarginAndStagesSection />
        </section>

        {/* ============================================================ */}
        {/* HARDWARE GALLERY — Pakistani Counter Realities               */}
        {/* ============================================================ */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto" aria-label="Kitchen Hardware Reality">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="caption-1 text-[#AD96F1] uppercase tracking-wider font-mono">Counter Realities</span>
            <h2 className="title-1 text-[#F5F5F7] mt-2">Built for the Way Pakistani Food is Actually Made.</h2>
            <p className="body-4 text-[#9B9B9B] mt-2">
              From open-flame charcoal tandoor fires to humid fryer stations and late-night dine-in rush, HFC OS is designed for dirty fingers, loud kitchens, and unstable connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-3xl overflow-hidden border border-[#272727] bg-[#181818]">
              <div
                className="h-56 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: 'url(/images/landing/counter-hardware-dark.jpg)' }}
              />
              <div className="p-6">
                <span className="caption-2 font-mono text-[#58F6B1]">COUNTER DISPATCH</span>
                <h3 className="title-3 text-[#F5F5F7] mt-1">High-Speed Order Taker</h3>
                <p className="body-5 text-[#9B9B9B] mt-2">
                  Touch-optimized keyboard hotkeys and large item tiles allow cashiers to key in a 7-item dine-in feast in under 8 seconds.
                </p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-[#272727] bg-[#181818]">
              <div
                className="h-56 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: 'url(/images/landing/dining-hall-night.jpg)' }}
              />
              <div className="p-6">
                <span className="caption-2 font-mono text-[#AD96F1]">FLOOR & FAMILY SEATING</span>
                <h3 className="title-3 text-[#F5F5F7] mt-1">Visual Floor Layout</h3>
                <p className="body-5 text-[#9B9B9B] mt-2">
                  Real-time color-coded table occupancy map with privacy hall separation. See guest timers and pending bills at a glance.
                </p>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-[#272727] bg-[#181818]">
              <div
                className="h-56 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: 'url(/images/landing/kitchen-fire-pass.jpg)' }}
              />
              <div className="p-6">
                <span className="caption-2 font-mono text-[#58F6B1]">KITCHEN PASS</span>
                <h3 className="title-3 text-[#F5F5F7] mt-1">Instant Station KOTs</h3>
                <p className="body-5 text-[#9B9B9B] mt-2">
                  Direct routing sends Karahi orders to the burner pass and Burgers to the fry station instantly without mix-ups or lost slips.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRICING, FAQ & LAUNCH ONBOARDING LEAD CAPTURE                */}
        {/* ============================================================ */}
        <section id="pricing" className="scroll-mt-24">
          <PricingFaqAndLaunch />
        </section>
      </main>

      {/* JSON-LD Structured Data for Restaurant POS SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'HFC OS Pakistan',
            operatingSystem: 'Windows, macOS, Android, iOS, Linux (Web PWA)',
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PKR',
              description: 'Free single-counter tier with offline IndexedDB storage and 80mm ESC/POS thermal printing.',
            },
            description:
              'The offline-first restaurant operating system engineered specifically for Pakistani kitchens, load shedding, and thermal KOT receipts.',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '48',
            },
          }),
        }}
      />
    </div>
  );
}
