'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SolarArrowRightBold } from './SolarIcons';

export default function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 transition-transform duration-300 ease-weighted"
      aria-label="Primary Navigation"
    >
      <div
        className={`max-w-[1160px] mx-auto rounded-2xl px-4 py-3 flex items-center justify-between transition-opacity duration-300 ease-weighted ${
          scrolled
            ? 'bg-[#181818]/90 backdrop-blur-md shadow-[0_24px_48px_rgba(0,0,0,0.65)]'
            : 'bg-[#010102]/75 backdrop-blur-sm'
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AD96F1] rounded-lg"
        >
          <span className="w-8 h-8 rounded-lg bg-[#181818] flex items-center justify-center relative overflow-hidden">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#AD96F1] block transition-transform duration-300 ease-weighted group-hover:scale-110" />
            <span className="w-2 h-2 rounded-full bg-[#58F6B1] absolute bottom-1 right-1" />
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-[#F5F5F7] font-semibold tracking-tight text-base not-italic">
              HFC OS
            </span>
            <span className="hidden sm:inline-block caption-2 font-medium text-[#9B9B9B] not-italic">
              Pakistan
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main sections">
          <a
            href="#architecture"
            className="body-5 text-[#9B9B9B] hover:text-[#F5F5F7] transition-opacity duration-200 not-italic"
          >
            Architecture
          </a>
          <a
            href="#economics"
            className="body-5 text-[#9B9B9B] hover:text-[#F5F5F7] transition-opacity duration-200 not-italic"
          >
            Margin Math
          </a>
          <a
            href="#workflow"
            className="body-5 text-[#9B9B9B] hover:text-[#F5F5F7] transition-opacity duration-200 not-italic"
          >
            Shift Flow
          </a>
          <a
            href="#pricing"
            className="body-5 text-[#9B9B9B] hover:text-[#F5F5F7] transition-opacity duration-200 not-italic"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="body-5 text-[#9B9B9B] hover:text-[#F5F5F7] transition-opacity duration-200 not-italic"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="hidden sm:inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] text-[#F5F5F7] caption-1 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
          >
            <span className="w-2 h-2 rounded-full bg-[#58F6B1]" />
            Open Live POS
          </Link>

          <a
            href="#launch-form"
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-[#AD96F1] hover:opacity-95 text-[#010102] caption-1 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
          >
            <span>Start Free Counter</span>
            <SolarArrowRightBold className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#181818] text-[#F5F5F7]"
            aria-expanded={menuOpen}
            aria-controls="mobile-full-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full viewport overlay menu for mobile */}
      <div
        id="mobile-full-menu"
        aria-hidden={!menuOpen}
        className={`md:hidden fixed inset-0 top-[76px] bg-[#010102]/95 backdrop-blur-xl px-6 py-8 transition-opacity duration-300 ease-weighted ${
          menuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        <div className="flex flex-col gap-6 max-w-sm mx-auto">
          <a
            href="#architecture"
            onClick={() => setMenuOpen(false)}
            className="heading-4 text-[#F5F5F7] not-italic"
          >
            Counter Architecture
          </a>
          <a
            href="#economics"
            onClick={() => setMenuOpen(false)}
            className="heading-4 text-[#F5F5F7] not-italic"
          >
            Zero Commission Math
          </a>
          <a
            href="#workflow"
            onClick={() => setMenuOpen(false)}
            className="heading-4 text-[#F5F5F7] not-italic"
          >
            Four Tap Shift Flow
          </a>
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="heading-4 text-[#F5F5F7] not-italic"
          >
            Flat PKR Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMenuOpen(false)}
            className="heading-4 text-[#F5F5F7] not-italic"
          >
            Operator Questions
          </a>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/pos"
              onClick={() => setMenuOpen(false)}
              className="w-full py-2 px-3 rounded-lg bg-[#181818] text-[#58F6B1] caption-1 text-center not-italic"
            >
              Launch Live POS Demo
            </Link>
            <a
              href="#launch-form"
              onClick={() => setMenuOpen(false)}
              className="w-full py-2 px-3 rounded-lg bg-[#AD96F1] text-[#010102] caption-1 text-center not-italic"
            >
              Configure Your Branch
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
