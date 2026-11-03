'use client';

import React, { useEffect, useRef, useState } from 'react';

const TAGLINE_TEXT =
  'Built for Pakistani kitchens where PTCL drops, riders crowd the counter, and thirty percent aggregator commissions quietly erase restaurant margins.';

const WORDS = TAGLINE_TEXT.split(' ');

export default function TaglineRevealSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [activeWordCount, setActiveWordCount] = useState<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setActiveWordCount(WORDS.length);
      return;
    }

    let rafId = 0;

    const updateProgress = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Start revealing when section enters 82% of viewport, finish by 22%
      const startY = viewportHeight * 0.82;
      const endY = viewportHeight * 0.22;
      const rawProgress = (startY - rect.top) / (startY - endY);
      const clamped = Math.max(0, Math.min(1, rawProgress));
      const count = Math.round(clamped * WORDS.length);
      setActiveWordCount(count);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Core Philosophy"
      className="py-20 sm:py-24 px-4 sm:px-6 bg-[#010102]"
    >
      <div className="max-w-[960px] mx-auto">
        <p className="text-xl sm:text-2xl lg:text-4xl font-semibold tracking-tight leading-[1.3] balance-heading not-italic">
          {WORDS.map((word, idx) => {
            const isActivated = idx < activeWordCount;
            const isHighlight =
              word === 'Pakistani' ||
              word === 'thirty' ||
              word === 'percent' ||
              word === 'margins.';

            return (
              <span
                key={`${word}-${idx}`}
                className="inline-block mr-[0.28em] transition-opacity duration-200 ease-weighted"
                style={{
                  opacity: isActivated ? 1 : 0.28,
                  color: isActivated
                    ? isHighlight
                      ? '#AD96F1'
                      : '#F5F5F7'
                    : '#9B9B9B',
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
