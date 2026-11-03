'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, seedInitialData } from '@/lib/db';
import {
  SolarArrowRightBold,
  SolarCheckCircleBold,
  SolarShieldCheckBoldDuotone,
} from './SolarIcons';

interface FaqEntry {
  q: string;
  a: string;
}

export const LANDING_FAQ_ITEMS: FaqEntry[] = [
  {
    q: 'What happens if PTCL fiber or 4G disconnects during Friday rush?',
    a: 'HFC OS continues firing orders, printing 80mm kitchen tokens over local USB or LAN cables, and settling bills with zero interruption. Every order is stored locally in IndexedDB on your counter machine and syncs automatically once internet returns.',
  },
  {
    q: 'Do we need to buy expensive proprietary POS touchscreen hardware?',
    a: 'No. HFC OS runs inside Chrome or Edge on any Windows PC, laptop, Android tablet, or iPad you already own. It pairs directly with standard 80mm thermal printers from Black Copper, Xprinter, SpeedX, and Epson.',
  },
  {
    q: 'Can we print separate slips for Tandoor, Grill, and Fryer passes?',
    a: 'Yes. Each menu category or individual dish can be assigned to a specific kitchen station or KDS screen so a single cashier tap routes tokens to the exact chef pass.',
  },
  {
    q: 'How does HFC OS handle GST, PRA, SRB, KPRA, and FBR invoice formatting?',
    a: 'You can configure your exact tax rate (or 0% for unregistered counters), STRN/NTN numbers, and custom invoice prefixes inside Branch Settings. Every customer receipt prints a clean itemized breakdown in PKR.',
  },
  {
    q: 'How do we manage our own delivery riders and Cash on Delivery floats?',
    a: 'When a direct WhatsApp or phone order arrives, you assign it to one of your branch riders. HFC OS tracks the exact petty cash float handed to the rider and reconciles collected COD cash and Raast transfers at shift close.',
  },
  {
    q: 'Can cashiers delete or void an order after printing the bill?',
    a: 'Cashier accounts can punch and settle orders, while voids, refunds, price overrides, and Z report drawer resets require a four digit Manager PIN and record an immutable audit trail.',
  },
  {
    q: 'How long does it take to import our burger, karahi, or pizza menu?',
    a: 'Most branches go live in under fifteen minutes. You can start with our preloaded Pakistani fast food and desi restaurant menu templates or enter your own categories and deals directly.',
  },
];

export default function PricingFaqAndLaunch() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [cityName, setCityName] = useState('Lahore');
  const [phoneInput, setPhoneInput] = useState('');
  const [taxRateInput, setTaxRateInput] = useState('5');
  const [formError, setFormError] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleProvisionWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = restaurantName.trim();
    const trimmedPhone = phoneInput.trim();

    if (trimmedName.length < 2) {
      setFormError('Please enter your restaurant or café name (at least 2 characters).');
      return;
    }

    if (trimmedPhone.length < 7) {
      setFormError('Please enter a valid Pakistani branch phone or WhatsApp number.');
      return;
    }

    setIsProvisioning(true);
    try {
      await seedInitialData();
      const parsedTax = Math.max(0, Math.min(25, Number(taxRateInput) || 0));

      await db.settings.update('default', {
        restaurantName: trimmedName,
        tagline: `${cityName} Main Branch`,
        address: `${cityName}, Pakistan`,
        phone: trimmedPhone,
        taxRate: parsedTax,
      });

      router.push('/pos');
    } catch {
      router.push('/pos');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <>
      {/* Proof & Production Origin Section */}
      <section
        aria-labelledby="proof-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#181818]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <h2
                id="proof-heading"
                className="heading-2 text-[#F5F5F7] balance-heading not-italic"
              >
                Forged on our counter.
              </h2>
              <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                We did not build HFC OS in a detached software agency. We built it to run our own high volume fried chicken and grill counter after watching cloud POS tabs crash every Friday night.
              </p>

              {/* Verified Production Benchmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl bg-[#010102] p-4">
                  <div className="heading-4 text-[#58F6B1] not-italic">100%</div>
                  <div className="caption-2 text-[#9B9B9B] mt-1 not-italic">
                    Offline Uptime
                  </div>
                </div>
                <div className="rounded-xl bg-[#010102] p-4">
                  <div className="heading-4 text-[#AD96F1] not-italic">4 Taps</div>
                  <div className="caption-2 text-[#9B9B9B] mt-1 not-italic">
                    Order to KOT Print
                  </div>
                </div>
                <div className="rounded-xl bg-[#010102] p-4 col-span-2 sm:col-span-1">
                  <div className="heading-4 text-[#F5F5F7] not-italic">Rs. 0</div>
                  <div className="caption-2 text-[#9B9B9B] mt-1 not-italic">
                    Per Order Commission
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#010102] p-2">
                <div className="rounded-lg overflow-hidden relative aspect-[16/10]">
                  <img
                    src="/images/landing/dining-hall-night.jpg"
                    alt="Warm evening Pakistani restaurant dining hall during dinner service"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Field Flat PKR Pricing Section */}
      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#010102]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2
                id="pricing-heading"
                className="heading-2 text-[#F5F5F7] max-w-[540px] balance-heading not-italic"
              >
                Flat PKR pricing.
              </h2>
            </div>
            <p className="body-4 text-[#9B9B9B] max-w-[420px] pretty-body not-italic">
              Start on your existing counter computer today at zero cost. Upgrade to unlimited multi printer station routing for less than the commission on fifteen aggregator orders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field 1: Single Counter Starter */}
            <div className="rounded-2xl bg-[#181818] p-2 flex flex-col justify-between">
              <div className="rounded-lg bg-[#1F1F1F] p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="heading-3 text-[#F5F5F7] not-italic">Single Counter</h3>
                    <span className="py-1 px-2.5 rounded bg-[#181818] caption-2 text-[#F5F5F7] not-italic">
                      Express Cafés
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="heading-1 text-[#F5F5F7] not-italic">Rs. 0</span>
                    <span className="body-4 text-[#9B9B9B] not-italic">
                      / first 30 days
                    </span>
                  </div>

                  <p className="body-4 text-[#9B9B9B] mt-4 pretty-body not-italic">
                    Full offline POS, 80mm receipt printing, customer CRM, and daily shift closing reports running locally in your browser.
                  </p>

                  <ul className="space-y-3 mt-6">
                    {[
                      'Unlimited Dine In, Takeaway, and Direct Delivery orders',
                      '80mm USB thermal receipt and KOT slip printing',
                      'Offline first IndexedDB storage with JSON backup export',
                      'Preloaded Pakistani burger, pizza, and desi karahi menu',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 body-5 text-[#F5F5F7]">
                        <SolarCheckCircleBold className="w-5 h-5 text-[#58F6B1] shrink-0 mt-0.5" />
                        <span className="not-italic">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href="/pos"
                    className="w-full py-2 px-3 rounded-lg bg-[#272727] hover:bg-[#313131] text-[#F5F5F7] caption-1 inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic"
                  >
                    <span>Open Instant Counter Now</span>
                    <SolarArrowRightBold className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Field 2: Full Branch License */}
            <div className="rounded-2xl bg-[#AD96F1] p-2 flex flex-col justify-between">
              <div className="rounded-lg bg-[#181818] p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="heading-3 text-[#F5F5F7] not-italic">Full Branch</h3>
                    <span className="py-1 px-2.5 rounded bg-[#AD96F1] caption-2 text-[#010102] font-semibold not-italic">
                      Most Popular
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="heading-1 text-[#58F6B1] not-italic">Rs. 4,500</span>
                    <span className="body-4 text-[#9B9B9B] not-italic">
                      / month per branch
                    </span>
                  </div>

                  <p className="body-4 text-[#9B9B9B] mt-4 pretty-body not-italic">
                    Complete multi station kitchen display routing, family hall floor management, rider cash reconciliation, and priority WhatsApp engineering support.
                  </p>

                  <ul className="space-y-3 mt-6">
                    {[
                      'Everything in Single Counter plus multi station LAN KOT routing',
                      'Interactive Kitchen Display System (KDS) with prep timers',
                      'Own rider fleet ledger with COD and Raast QR reconciliation',
                      'PIN locked Cashier, Kitchen, and Manager audit logs',
                      'Dedicated onboarding for your menu and thermal printers',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 body-5 text-[#F5F5F7]">
                        <SolarCheckCircleBold className="w-5 h-5 text-[#AD96F1] shrink-0 mt-0.5" />
                        <span className="not-italic">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <a
                    href="#launch-form"
                    className="w-full py-2 px-3 rounded-lg bg-[#AD96F1] hover:opacity-95 text-[#010102] caption-1 inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic"
                  >
                    <span>Configure Branch Workspace</span>
                    <SolarArrowRightBold className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Reversal Guarantee Strip */}
          <div className="mt-8 rounded-2xl bg-[#181818] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <SolarShieldCheckBoldDuotone className="w-6 h-6 text-[#58F6B1] shrink-0" />
              <p className="body-5 text-[#F5F5F7] pretty-body not-italic">
                Zero lock in guarantee: Export your entire menu, customer phone book, and sales history as clean JSON or CSV at any second. No hardware lease traps.
              </p>
            </div>
            <span className="caption-2 text-[#58F6B1] font-medium shrink-0 not-italic">
              30 Day Risk Free Trial
            </span>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (No decorative numbers) */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#181818]"
      >
        <div className="max-w-[960px] mx-auto">
          <h2
            id="faq-heading"
            className="heading-2 text-[#F5F5F7] max-w-[540px] balance-heading not-italic"
          >
            Frequently asked questions.
          </h2>

          <div className="mt-12 space-y-6">
            {LANDING_FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-xl bg-[#010102] p-6">
                <h3 className="heading-5 text-[#F5F5F7] not-italic">{item.q}</h3>
                <p className="body-4 text-[#9B9B9B] mt-3 pretty-body not-italic">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA & Live Branch Workspace Provisioner */}
      <section
        id="launch-form"
        aria-labelledby="launch-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#010102]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="rounded-2xl bg-[#181818] p-2">
            <div className="rounded-lg bg-[#1F1F1F] p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 flex flex-col gap-6">
                <h2
                  id="launch-heading"
                  className="heading-2 text-[#F5F5F7] balance-heading not-italic"
                >
                  Launch your counter.
                </h2>
                <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                  Enter your restaurant name and city below. We will configure your local HFC OS branch workspace with PKR currency, tax settings, and kitchen stations, then open your live POS immediately.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5 body-5 text-[#F5F5F7]">
                    <SolarCheckCircleBold className="w-5 h-5 text-[#58F6B1]" />
                    <span className="not-italic">No credit card or cloud signup wait</span>
                  </div>
                  <div className="flex items-center gap-2.5 body-5 text-[#F5F5F7]">
                    <SolarCheckCircleBold className="w-5 h-5 text-[#58F6B1]" />
                    <span className="not-italic">Preloaded with 26 authentic Pakistani menu items</span>
                  </div>
                  <div className="flex items-center gap-2.5 body-5 text-[#F5F5F7]">
                    <SolarCheckCircleBold className="w-5 h-5 text-[#58F6B1]" />
                    <span className="not-italic">Test 80mm KOT slip printing and KDS right now</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <form
                  onSubmit={handleProvisionWorkspace}
                  noValidate
                  className="rounded-xl bg-[#010102] p-6 sm:p-8 space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="heading-5 text-[#F5F5F7] not-italic">
                      Instant Branch Setup
                    </span>
                    <span className="caption-2 text-[#58F6B1] font-medium not-italic">
                      Local Dexie Engine Ready
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="branch-restaurant-name"
                      className="block caption-1 text-[#F5F5F7] mb-2 not-italic"
                    >
                      Restaurant or Café Name
                    </label>
                    <input
                      id="branch-restaurant-name"
                      type="text"
                      required
                      placeholder="e.g. Salt & Crave Grill"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full rounded-lg bg-[#181818] px-3.5 py-2.5 text-[#F5F5F7] placeholder-[#9B9B9B]/50 body-5 focus:outline-none focus:ring-2 focus:ring-[#AD96F1]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="branch-city"
                        className="block caption-1 text-[#F5F5F7] mb-2 not-italic"
                      >
                        City
                      </label>
                      <select
                        id="branch-city"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="w-full rounded-lg bg-[#181818] px-3.5 py-2.5 text-[#F5F5F7] body-5 focus:outline-none focus:ring-2 focus:ring-[#AD96F1]"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Gujranwala">Gujranwala</option>
                        <option value="Sialkot">Sialkot</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="branch-tax"
                        className="block caption-1 text-[#F5F5F7] mb-2 not-italic"
                      >
                        Default GST %
                      </label>
                      <select
                        id="branch-tax"
                        value={taxRateInput}
                        onChange={(e) => setTaxRateInput(e.target.value)}
                        className="w-full rounded-lg bg-[#181818] px-3.5 py-2.5 text-[#F5F5F7] body-5 focus:outline-none focus:ring-2 focus:ring-[#AD96F1]"
                      >
                        <option value="0">0% (Unregistered)</option>
                        <option value="5">5% (Card / FBR Tier)</option>
                        <option value="15">15% (SRB / KPRA)</option>
                        <option value="16">16% (PRA Standard)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="branch-phone"
                      className="block caption-1 text-[#F5F5F7] mb-2 not-italic"
                    >
                      Branch WhatsApp or Phone Number
                    </label>
                    <input
                      id="branch-phone"
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full rounded-lg bg-[#181818] px-3.5 py-2.5 text-[#F5F5F7] placeholder-[#9B9B9B]/50 body-5 focus:outline-none focus:ring-2 focus:ring-[#AD96F1]"
                    />
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="rounded-lg bg-[#272727] p-3 caption-2 text-[#58F6B1] not-italic"
                    >
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="w-full py-2 px-3 rounded-lg bg-[#AD96F1] hover:opacity-95 text-[#010102] caption-1 inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] disabled:opacity-50 not-italic"
                  >
                    <span>
                      {isProvisioning
                        ? 'Provisioning Local Counter...'
                        : 'Configure & Open My POS Now'}
                    </span>
                    <SolarArrowRightBold className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <Link
                      href="/pos"
                      className="caption-2 text-[#9B9B9B] hover:text-[#F5F5F7] underline underline-offset-4 not-italic"
                    >
                      Or skip setup and open default HFC Gulberg demo counter
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Privacy & Terms anchors per Part B10 */}
      <footer className="py-12 px-4 sm:px-6 bg-[#010102]">
        <div className="max-w-[1160px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#181818] flex items-center justify-center relative">
              <span className="w-3 h-3 rounded-sm bg-[#AD96F1] block" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#58F6B1] absolute bottom-1 right-1" />
            </span>
            <div>
              <span className="caption-1 text-[#F5F5F7] not-italic">HFC OS Pakistan</span>
              <span className="caption-3 text-[#9B9B9B] block not-italic">
                Offline First Restaurant Operating System • Lahore, Pakistan
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 caption-2 text-[#9B9B9B]">
            <Link href="/pos" className="hover:text-[#F5F5F7] not-italic">
              Live POS Terminal
            </Link>
            <a href="#architecture" className="hover:text-[#F5F5F7] not-italic">
              80mm KOT Spec
            </a>
            <a href="#pricing" className="hover:text-[#F5F5F7] not-italic">
              PKR Pricing
            </a>
            <a href="#privacy" id="privacy" className="hover:text-[#F5F5F7] not-italic">
              Privacy Policy (100% Local Data)
            </a>
            <a href="#terms" id="terms" className="hover:text-[#F5F5F7] not-italic">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
