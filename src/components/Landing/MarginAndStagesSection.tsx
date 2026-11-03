'use client';

import React, { useState } from 'react';
import { SolarCheckCircleBold } from './SolarIcons';

interface StageItem {
  id: string;
  title: string;
  metric: string;
  description: string;
  consoleLine: string;
}

const SHIFT_STAGES: StageItem[] = [
  {
    id: 'entry',
    title: 'Counter Entry',
    metric: '4.2 sec average entry',
    description:
      'Cashiers tap category, item, modifier, and fire. Visual Urdu and English keys eliminate training delays for new counter staff.',
    consoleLine: 'ORDER #420 -> 2x ZINGER DEAL, 1x KARAHI FULL [DINE-IN T04]',
  },
  {
    id: 'split',
    title: 'Station Split',
    metric: '40ms local LAN print',
    description:
      'BBQ items print at the grill while burgers route to the fryer screen simultaneously. Even if internet fiber drops, local LAN printing never pauses.',
    consoleLine: 'ESC/POS -> 192.168.1.201 (TANDOOR) + 192.168.1.202 (FRY PASS) OK',
  },
  {
    id: 'dispatch',
    title: 'Rider Dispatch',
    metric: 'Rs. 0 commission on orders',
    description:
      'Assign waiting bike riders with customer WhatsApp pin locations and track exact COD cash float per rider before they leave the branch.',
    consoleLine: 'RIDER ASSIGNED -> USMAN (CD70) • COD FLOAT RS. 3,450 LOGGED',
  },
  {
    id: 'settle',
    title: 'Shift Closing',
    metric: '100% cash and Raast matched',
    description:
      'Match physical cash, JazzCash, EasyPaisa, and bank transfers against every fired KOT. Export clean daily Z reports for your accountant.',
    consoleLine: 'Z-REPORT CLOSED -> NET SALES RS. 184,500 • VARIANCE RS. 0',
  },
];

export default function MarginAndStagesSection() {
  const [dailyOrders, setDailyOrders] = useState<number>(85);
  const [avgTicketPkr, setAvgTicketPkr] = useState<number>(1450);
  const [aggregatorSharePct, setAggregatorSharePct] = useState<number>(40);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);

  const monthlyGrossSales = dailyOrders * avgTicketPkr * 30;
  const aggregatorVolume = Math.round(monthlyGrossSales * (aggregatorSharePct / 100));
  const aggregatorCommissionBurn = Math.round(aggregatorVolume * 0.28);
  const hfcMonthlyLicense = 4500;
  const monthlyCapturedSavings = Math.max(0, aggregatorCommissionBurn - hfcMonthlyLicense);
  const annualCapturedSavings = monthlyCapturedSavings * 12;

  return (
    <>
      {/* Problem to Solution + PKR Margin Simulator */}
      <section
        id="economics"
        aria-labelledby="economics-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#181818]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 5 Columns: Narrative */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <h2
                id="economics-heading"
                className="heading-2 text-[#F5F5F7] balance-heading not-italic"
              >
                Keep every rupee.
              </h2>
              <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                Most Pakistani restaurants run on fragile cloud web pages that freeze when PTCL fiber blinks, while delivery apps take nearly a third of every hard earned order.
              </p>

              <div className="space-y-4 pt-2">
                <div className="rounded-xl bg-[#010102] p-4">
                  <div className="caption-1 text-[#9B9B9B] not-italic">
                    Legacy Cloud POS &amp; Aggregator Trap
                  </div>
                  <p className="body-5 text-[#9B9B9B] mt-1 pretty-body not-italic">
                    28% to 32% commission deducted per order, frozen checkout screens during Friday load shedding, and handwritten kitchen slips lost in grease.
                  </p>
                </div>

                <div className="rounded-xl bg-[#010102] p-4">
                  <div className="caption-1 text-[#58F6B1] inline-flex items-center gap-2 not-italic">
                    <SolarCheckCircleBold className="w-4 h-4" />
                    <span>HFC OS Local First Counter Engine</span>
                  </div>
                  <p className="body-5 text-[#F5F5F7] mt-1 pretty-body not-italic">
                    Flat Rs. 4,500 monthly branch license, zero commission on direct WhatsApp and phone deliveries, and instant IndexedDB offline storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Interactive PKR Margin Calculator */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#010102] p-2">
                <div className="rounded-lg bg-[#1F1F1F] p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-6">
                    <h3 className="heading-4 text-[#F5F5F7] not-italic">
                      Branch Margin Simulator
                    </h3>
                    <span className="py-1 px-2.5 rounded bg-[#181818] caption-2 text-[#58F6B1] font-semibold not-italic">
                      Live PKR Calculator
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Slider 1: Daily Orders */}
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label
                          htmlFor="daily-orders-range"
                          className="body-5 text-[#F5F5F7] not-italic"
                        >
                          Daily Branch Orders (Dine In + Takeaway + Delivery)
                        </label>
                        <span className="heading-5 text-[#AD96F1] not-italic">
                          {dailyOrders} orders / day
                        </span>
                      </div>
                      <input
                        id="daily-orders-range"
                        type="range"
                        min={20}
                        max={300}
                        step={5}
                        value={dailyOrders}
                        onChange={(e) => setDailyOrders(Number(e.target.value))}
                        className="w-full accent-[#AD96F1] cursor-pointer h-2 rounded-lg bg-[#181818]"
                      />
                    </div>

                    {/* Slider 2: Average Ticket Size */}
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label
                          htmlFor="avg-ticket-range"
                          className="body-5 text-[#F5F5F7] not-italic"
                        >
                          Average Bill Size (PKR)
                        </label>
                        <span className="heading-5 text-[#AD96F1] not-italic">
                          Rs. {avgTicketPkr.toLocaleString()}
                        </span>
                      </div>
                      <input
                        id="avg-ticket-range"
                        type="range"
                        min={500}
                        max={4500}
                        step={50}
                        value={avgTicketPkr}
                        onChange={(e) => setAvgTicketPkr(Number(e.target.value))}
                        className="w-full accent-[#AD96F1] cursor-pointer h-2 rounded-lg bg-[#181818]"
                      />
                    </div>

                    {/* Slider 3: Direct Delivery Share Shifted */}
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label
                          htmlFor="aggregator-share-range"
                          className="body-5 text-[#F5F5F7] not-italic"
                        >
                          Orders Shifted from Aggregator to Direct Fleet
                        </label>
                        <span className="heading-5 text-[#58F6B1] not-italic">
                          {aggregatorSharePct}% of volume
                        </span>
                      </div>
                      <input
                        id="aggregator-share-range"
                        type="range"
                        min={10}
                        max={80}
                        step={5}
                        value={aggregatorSharePct}
                        onChange={(e) => setAggregatorSharePct(Number(e.target.value))}
                        className="w-full accent-[#58F6B1] cursor-pointer h-2 rounded-lg bg-[#181818]"
                      />
                    </div>
                  </div>

                  {/* Output Ledger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="rounded-lg bg-[#181818] p-4">
                      <div className="heading-3 text-[#F5F5F7] not-italic">
                        Rs. {aggregatorCommissionBurn.toLocaleString()}
                      </div>
                      <p className="caption-1 text-[#9B9B9B] mt-1 not-italic">
                        Monthly commission leakage at 28% cut
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#010102] p-4">
                      <div className="heading-3 text-[#58F6B1] not-italic">
                        Rs. {annualCapturedSavings.toLocaleString()}
                      </div>
                      <p className="caption-1 text-[#58F6B1] mt-1 not-italic">
                        Net profit retained per year after license
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 4-Stage Shift Flow */}
      <section
        id="workflow"
        aria-labelledby="workflow-heading"
        className="py-20 sm:py-24 px-4 sm:px-6 bg-[#010102]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2
                id="workflow-heading"
                className="heading-2 text-[#F5F5F7] max-w-[540px] balance-heading not-italic"
              >
                Four tap shift flow.
              </h2>
            </div>
            <p className="body-4 text-[#9B9B9B] max-w-[420px] pretty-body not-italic">
              Step through the operational stages of a dinner shift. Every action is engineered to reduce counter queues and eliminate end of night cash discrepancies.
            </p>
          </div>

          {/* Interactive Stage Selector (No decorative numbers) */}
          <div className="rounded-2xl bg-[#181818] p-2">
            <div className="rounded-lg bg-[#1F1F1F] p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {SHIFT_STAGES.map((stage, idx) => {
                  const isCurrent = idx === activeStageIdx;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStageIdx(idx)}
                      className={`text-left rounded-lg p-4 transition-transform duration-200 ease-weighted active:scale-[0.98] ${
                        isCurrent
                          ? 'bg-[#010102] text-[#F5F5F7]'
                          : 'bg-[#181818] text-[#9B9B9B] hover:text-[#F5F5F7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`caption-2 font-medium not-italic ${
                            isCurrent ? 'text-[#58F6B1]' : 'text-[#9B9B9B]'
                          }`}
                        >
                          {stage.title}
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-[#AD96F1]" />
                        )}
                      </div>
                      <div className="caption-2 text-[#AD96F1] mt-2 not-italic">
                        {stage.metric}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Detail Bar */}
              <div className="rounded-lg bg-[#010102] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-[600px]">
                  <h3 className="heading-3 text-[#F5F5F7] not-italic">
                    {SHIFT_STAGES[activeStageIdx].title}
                  </h3>
                  <p className="body-4 text-[#9B9B9B] mt-2 pretty-body not-italic">
                    {SHIFT_STAGES[activeStageIdx].description}
                  </p>
                </div>

                <div
                  data-ui="true"
                  className="rounded-lg bg-[#181818] p-4 text-[#58F6B1] lg:min-w-[380px] not-italic"
                >
                  <div className="text-[#9B9B9B] mb-1 caption-1 not-italic">Live System Bus Log</div>
                  <code className="text-sm font-mono not-italic">{SHIFT_STAGES[activeStageIdx].consoleLine}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-4">
            <div>
              <div className="heading-3 text-[#AD96F1] not-italic">Instant</div>
              <h3 className="heading-5 text-[#F5F5F7] mt-2 not-italic">
                Zero Cloud Lag on PTCL Outages
              </h3>
              <p className="body-5 text-[#9B9B9B] mt-2 pretty-body not-italic">
                Every menu item, modifier, customer phone record, and shift ledger lives inside browser IndexedDB storage first and syncs in the background when connectivity returns.
              </p>
            </div>

            <div>
              <div className="heading-3 text-[#58F6B1] not-italic">80mm</div>
              <h3 className="heading-5 text-[#F5F5F7] mt-2 not-italic">
                Plug &amp; Play Thermal Printers
              </h3>
              <p className="body-5 text-[#9B9B9B] mt-2 pretty-body not-italic">
                Works out of the box with Black Copper, SpeedX, Xprinter, and Epson USB or Ethernet thermal printers commonly stocked in Hall Road Lahore and Saddar Karachi.
              </p>
            </div>

            <div>
              <div className="heading-3 text-[#F5F5F7] not-italic">3 Roles</div>
              <h3 className="heading-5 text-[#F5F5F7] mt-2 not-italic">
                PIN Locked Cashier Permissions
              </h3>
              <p className="body-5 text-[#9B9B9B] mt-2 pretty-body not-italic">
                Separate Cashier, Kitchen Expo, and Branch Manager PIN codes so voided items, discounts, and cash drawer pops are logged with an immutable timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
