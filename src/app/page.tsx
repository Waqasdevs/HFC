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
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Scroll-triggered section reveal via IntersectionObserver (Part B7)
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-section');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HFC OS Pakistan',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Windows, Android, iOS',
    description:
      'Offline-first restaurant POS, 80mm thermal KOT routing, Kitchen Display System, and zero-commission direct delivery management built for Pakistani restaurants.',
    offers: {
      '@type': 'Offer',
      price: '4500',
      priceCurrency: 'PKR',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#F5F5F7] selection:bg-[#AD96F1] selection:text-[#010102] overflow-x-hidden">
      {/* Skip to content link for keyboard accessibility (Part B9) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:py-2 focus:px-3 focus:rounded-lg focus:bg-[#AD96F1] focus:text-[#010102] caption-1"
      >
        Skip to main content
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <FloatingNav />

      <main id="main-content">
        {/* HERO SECTION: Split Asymmetric Stage with 1080p Bespoke Video & 3-Layer Scroll Parallax */}
        <section
          aria-labelledby="hero-heading"
          className="relative min-h-[100svh] pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 flex items-center overflow-hidden bg-[#010102]"
        >
          {/* Parallax Layer 1 (Deep Background): Bespoke 1080p Cinematic Video + Poster Frame */}
          <div
            ref={heroBgRef}
            className="absolute inset-0 pointer-events-none will-change-transform"
            aria-hidden="true"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/landing/hero-poster.jpg"
              className="w-full h-full object-cover opacity-50"
            >
              <source src="/videos/hero-cinematic.mp4" type="video/mp4" />
            </video>
            {/* Dark atmospheric masks so Cobalt Black #010102 dominates */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#010102] via-[#010102]/85 to-[#010102]/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#010102] via-transparent to-[#010102]/80" />
          </div>

          <div className="relative z-10 max-w-[1160px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left 7 Columns: Value Proposition and Single Primary CTA */}
              <div className="lg:col-span-7 flex flex-col items-start">
                {/* Hero Headline: max-w-[680px] + subtle #FFFFFF to #9B9B9B left-to-right gradient */}
                <h1
                  id="hero-heading"
                  className="heading-1 hero-heading-gradient max-w-[680px] balance-heading not-italic"
                >
                  Zero lag dinner rushes.
                </h1>

                {/* Subheadline: max-w-[680px] */}
                <p className="body-2 text-[#9B9B9B] max-w-[620px] mt-6 pretty-body not-italic">
                  HFC OS fires 80mm kitchen tokens in 40 milliseconds, keeps working when PTCL fiber drops, and replaces thirty percent delivery commissions with your own direct rider ledger.
                </p>

                {/* Single Primary CTA + Live Interactive Demo Action */}
                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <a
                    href="#launch-form"
                    className="py-2 px-3 rounded-lg bg-[#AD96F1] hover:opacity-95 text-[#010102] body-3 font-semibold inline-flex items-center gap-2.5 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
                  >
                    <span>Start Free Counter Setup</span>
                    <SolarArrowRightBold className="w-5 h-5" />
                  </a>

                  <Link
                    href="/pos"
                    className="py-2 px-3 rounded-lg bg-[#181818] hover:bg-[#1F1F1F] text-[#F5F5F7] body-3 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#58F6B1]" />
                    <span>Try Live POS in Browser</span>
                  </Link>
                </div>

                {/* Above-the-fold Proof Signal (no raw mono outside code) */}
                <div className="mt-10 pt-6 flex flex-wrap items-center gap-6 text-[#9B9B9B]">
                  <div className="flex items-center gap-2">
                    <SolarPrinterBoldDuotone className="w-5 h-5 text-[#58F6B1]" />
                    <span className="caption-2 font-medium text-[#F5F5F7] not-italic">
                      80mm ESC/POS Printing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SolarBoltBoldDuotone className="w-5 h-5 text-[#AD96F1]" />
                    <span className="caption-2 font-medium text-[#F5F5F7] not-italic">
                      100% Local IndexedDB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SolarShieldCheckBoldDuotone className="w-5 h-5 text-[#58F6B1]" />
                    <span className="caption-2 font-medium text-[#F5F5F7] not-italic">
                      PKR &amp; FBR GST Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Parallax Layer 2 & 3 Live Counter Hardware & KOT Stage */}
              <div className="lg:col-span-5 relative">
                {/* Parallax Layer 2 (Midground): Live Counter Terminal Card */}
                <div
                  ref={heroMidRef}
                  className="rounded-2xl bg-[#181818] p-2 will-change-transform"
                >
                  <div className="rounded-lg bg-[#010102] p-5">
                    <div className="flex items-center justify-between pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#58F6B1]" />
                        <span className="caption-2 text-[#F5F5F7] font-medium not-italic">
                          Gulberg Counter 01 • Offline Safe
                        </span>
                      </div>
                      <span className="py-0.5 px-2 rounded bg-[#181818] text-sm text-[#AD96F1] font-medium not-italic">
                        Shift Open
                      </span>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="rounded-lg bg-[#181818] p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[#F5F5F7] font-semibold not-italic">
                            2x Zinger Mighty Deal
                          </div>
                          <div className="text-[#9B9B9B] text-sm not-italic">
                            Fry Pass • Extra Spicy Mayo
                          </div>
                        </div>
                        <span className="text-[#58F6B1] font-medium not-italic">Rs. 1,580</span>
                      </div>

                      <div className="rounded-lg bg-[#181818] p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[#F5F5F7] font-semibold not-italic">
                            1x Chicken Karahi Full
                          </div>
                          <div className="text-[#9B9B9B] text-sm not-italic">
                            Tandoor &amp; Wok • Desi Ghee
                          </div>
                        </div>
                        <span className="text-[#58F6B1] font-medium not-italic">Rs. 2,450</span>
                      </div>

                      <div className="rounded-lg bg-[#181818] p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[#F5F5F7] font-semibold not-italic">
                            4x Garlic Roghni Naan
                          </div>
                          <div className="text-[#9B9B9B] text-sm not-italic">
                            Clay Oven • Butter Brushed
                          </div>
                        </div>
                        <span className="text-[#58F6B1] font-medium not-italic">Rs. 480</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-[#9B9B9B] not-italic">
                          Net Payable (Incl. 5% GST)
                        </div>
                        <div className="heading-4 text-[#F5F5F7] not-italic">
                          Rs. 4,736
                        </div>
                      </div>
                      <Link
                        href="/pos"
                        className="py-2 px-3 rounded-lg bg-[#58F6B1] text-[#010102] caption-1 font-semibold not-italic"
                      >
                        Fire KOT #418
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Parallax Layer 3 (Foreground Depth): Floating Kitchen Telemetry Pill */}
                <div
                  ref={heroFgRef}
                  className="mt-4 sm:-mt-6 sm:ml-8 rounded-2xl bg-[#1F1F1F] p-2 will-change-transform"
                >
                  <div className="rounded-lg bg-[#010102] p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="caption-2 text-[#AD96F1] font-medium not-italic">
                        Thermal Slip Dispatched
                      </div>
                      <div className="caption-2 text-[#9B9B9B] mt-0.5 not-italic">
                        Tandoor + Fry Station printed in 38ms
                      </div>
                    </div>
                    <span className="py-1 px-2.5 rounded bg-[#181818] caption-2 text-[#58F6B1] font-medium shrink-0 not-italic">
                      0% Commission
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mandatory Scroll-Synced Word-by-Word Tagline Reveal Section (Part B11) */}
        <TaglineRevealSection />

        {/* Interactive 4-Output Counter Architecture Section */}
        <div className="reveal-section">
          <InteractiveOutputStage />
        </div>

        {/* Problem-to-Solution + PKR Margin Simulator + 4-Stage Shift Flow */}
        <div className="reveal-section">
          <MarginAndStagesSection />
        </div>

        {/* Proof, Two-Field PKR Pricing, Run-In FAQ, and Live Workspace Provisioner */}
        <div className="reveal-section">
          <PricingFaqAndLaunch />
        </div>
      </main>
    </div>
  );
}
