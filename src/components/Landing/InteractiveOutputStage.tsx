'use client';

import React, { useState } from 'react';
import {
  SolarBoltBoldDuotone,
  SolarChefHatBoldDuotone,
  SolarCheckCircleBold,
  SolarPrinterBoldDuotone,
  SolarShieldCheckBoldDuotone,
} from './SolarIcons';

type OutputTab = 'kot' | 'kds' | 'floor' | 'rider';

interface TicketItem {
  qty: number;
  name: string;
  station: string;
  pricePkr: number;
}

const SAMPLE_ITEMS: TicketItem[] = [
  { qty: 2, name: 'Zinger Mighty Burger', station: 'FRY PASS', pricePkr: 1580 },
  { qty: 1, name: 'Chicken Karahi Full (Desi Ghee)', station: 'TANDOOR & WOK', pricePkr: 2450 },
  { qty: 4, name: 'Garlic Roghni Naan', station: 'TANDOOR', pricePkr: 480 },
  { qty: 2, name: 'Mint Margarita Jug', station: 'BAR', pricePkr: 840 },
];

export default function InteractiveOutputStage() {
  const [activeTab, setActiveTab] = useState<OutputTab>('kot');
  const [offlineSimulated, setOfflineSimulated] = useState<boolean>(false);
  const [kotPrintedCount, setKotPrintedCount] = useState<number>(418);

  const subtotal = SAMPLE_ITEMS.reduce((acc, item) => acc + item.pricePkr, 0);
  const gst = Math.round(subtotal * 0.05);
  const netTotal = subtotal + gst;

  return (
    <section
      id="architecture"
      aria-labelledby="architecture-heading"
      className="py-20 sm:py-24 px-4 sm:px-6 bg-[#010102]"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2
              id="architecture-heading"
              className="heading-2 text-[#F5F5F7] max-w-[540px] balance-heading not-italic"
            >
              One tap routes stations.
            </h2>
          </div>

          <p className="body-4 text-[#9B9B9B] max-w-[440px] pretty-body not-italic">
            Inspect the actual output produced by HFC OS inside a busy Pakistani branch. Toggle between the 80mm thermal slip, kitchen display pass, table floor status, and direct WhatsApp rider dispatch.
          </p>
        </div>

        {/* Outer Container: rounded-2xl (16px) with p-2 (8px gap) -> Inner container: rounded-lg (8px) per B3 */}
        <div className="rounded-2xl bg-[#181818] p-2">
          <div className="rounded-lg bg-[#010102] p-4 sm:p-8">
            {/* Mode Switcher Bar (No decorative numbers) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6">
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="System output views">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'kot'}
                  onClick={() => setActiveTab('kot')}
                  className={`py-2 px-3 rounded-lg caption-1 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic ${
                    activeTab === 'kot'
                      ? 'bg-[#AD96F1] text-[#010102]'
                      : 'bg-[#181818] text-[#9B9B9B] hover:text-[#F5F5F7]'
                  }`}
                >
                  <SolarPrinterBoldDuotone className="w-4 h-4" />
                  <span>Thermal KOT &amp; Bill</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'kds'}
                  onClick={() => setActiveTab('kds')}
                  className={`py-2 px-3 rounded-lg caption-1 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic ${
                    activeTab === 'kds'
                      ? 'bg-[#AD96F1] text-[#010102]'
                      : 'bg-[#181818] text-[#9B9B9B] hover:text-[#F5F5F7]'
                  }`}
                >
                  <SolarChefHatBoldDuotone className="w-4 h-4" />
                  <span>Kitchen Display Pass</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'floor'}
                  onClick={() => setActiveTab('floor')}
                  className={`py-2 px-3 rounded-lg caption-1 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic ${
                    activeTab === 'floor'
                      ? 'bg-[#AD96F1] text-[#010102]'
                      : 'bg-[#181818] text-[#9B9B9B] hover:text-[#F5F5F7]'
                  }`}
                >
                  <SolarBoltBoldDuotone className="w-4 h-4" />
                  <span>Family Table Map</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'rider'}
                  onClick={() => setActiveTab('rider')}
                  className={`py-2 px-3 rounded-lg caption-1 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic ${
                    activeTab === 'rider'
                      ? 'bg-[#AD96F1] text-[#010102]'
                      : 'bg-[#181818] text-[#9B9B9B] hover:text-[#F5F5F7]'
                  }`}
                >
                  <SolarShieldCheckBoldDuotone className="w-4 h-4" />
                  <span>Direct Rider Ledger</span>
                </button>
              </div>

              {/* Offline simulation toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOfflineSimulated((v) => !v)}
                  className={`py-2 px-3 rounded-lg caption-2 inline-flex items-center gap-2 transition-transform duration-200 ease-weighted active:scale-[0.98] not-italic ${
                    offlineSimulated
                      ? 'bg-[#272727] text-[#58F6B1]'
                      : 'bg-[#181818] text-[#F5F5F7]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      offlineSimulated ? 'bg-[#58F6B1]' : 'bg-[#AD96F1]'
                    }`}
                  />
                  <span>
                    {offlineSimulated
                      ? 'Fiber offline: Local IndexedDB active'
                      : 'Network active: Local first engine'}
                  </span>
                </button>
              </div>
            </div>

            {/* Stage Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 5 Columns: Narrative + Telemetry */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {activeTab === 'kot' && (
                  <>
                    <h3 className="heading-3 text-[#F5F5F7] balance-heading not-italic">
                      Prints kitchen tokens in 40 milliseconds.
                    </h3>
                    <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                      When your cashier hits fire, HFC OS splits the order by kitchen station. Tandoor items print at the clay oven while burgers route to the fryer pass without waiting for cloud roundtrips.
                    </p>
                    <div className="rounded-2xl bg-[#181818] p-2">
                      <div className="rounded-lg bg-[#1F1F1F] p-4 flex items-center justify-between">
                        <div>
                          <div className="caption-2 text-[#9B9B9B] not-italic">
                            Shift Slips Printed
                          </div>
                          <div className="heading-4 text-[#F5F5F7] mt-1 not-italic">
                            #{kotPrintedCount}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setKotPrintedCount((c) => c + 1)}
                          className="py-2 px-3 rounded-lg bg-[#58F6B1] text-[#010102] caption-1 transition-transform duration-200 ease-weighted active:scale-[0.97] not-italic"
                        >
                          Test Fire Slip
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'kds' && (
                  <>
                    <h3 className="heading-3 text-[#F5F5F7] balance-heading not-italic">
                      Color timed tickets prevent cold karahi.
                    </h3>
                    <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                      Chefs see exact preparation timers per dish. As soon as an order crosses twelve minutes, the card elevates to high priority so dine in tables and waiting riders receive piping hot food together.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">Average Pass Time</div>
                        <div className="heading-4 text-[#58F6B1] mt-1 not-italic">08m 42s</div>
                      </div>
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">Lost Paper Slips</div>
                        <div className="heading-4 text-[#F5F5F7] mt-1 not-italic">Zero per shift</div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'floor' && (
                  <>
                    <h3 className="heading-3 text-[#F5F5F7] balance-heading not-italic">
                      Turn family hall tables twice as fast.
                    </h3>
                    <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                      See every occupied table, running bill total in PKR, and course status from the main cashier terminal. Merge joint family tables or split corporate bills in two taps.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">Active Covers</div>
                        <div className="heading-4 text-[#F5F5F7] mt-1 not-italic">64 Guests</div>
                      </div>
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">Running Floor Bill</div>
                        <div className="heading-4 text-[#AD96F1] mt-1 not-italic">Rs. 48,950</div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'rider' && (
                  <>
                    <h3 className="heading-3 text-[#F5F5F7] balance-heading not-italic">
                      Keep one hundred percent of delivery revenue.
                    </h3>
                    <p className="body-4 text-[#9B9B9B] pretty-body not-italic">
                      Assign orders to your own bike riders with one tap. HFC OS tracks cash float handed to each rider, pending COD collections, and Raast QR transfers so night closing takes three minutes.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">Commission Fee</div>
                        <div className="heading-4 text-[#58F6B1] mt-1 not-italic">Rs. 0 (0%)</div>
                      </div>
                      <div className="rounded-xl bg-[#181818] p-4">
                        <div className="caption-2 text-[#9B9B9B] not-italic">COD Reconciled</div>
                        <div className="heading-4 text-[#F5F5F7] mt-1 not-italic">100% Match</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right 7 Columns: Live Interactive Fragment */}
              <div className="lg:col-span-7">
                {activeTab === 'kot' && (
                  <div className="rounded-2xl bg-[#181818] p-2">
                    <div className="rounded-lg bg-[#1F1F1F] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
                      {/* Simulated 80mm Thermal Paper Receipt (data-ui strictly on interface artifact) */}
                      <div
                        data-ui="true"
                        className="w-full md:w-[340px] rounded-lg bg-[#F5F5F7] text-[#010102] p-6"
                      >
                        <div className="text-center pb-4 mb-4">
                          <div className="text-sm font-bold tracking-tight not-italic">
                            HFC GULBERG BRANCH
                          </div>
                          <div className="caption-2 text-[#313131] mt-1 not-italic">
                            MM ALAM ROAD, LAHORE • STRN 4198201
                          </div>
                          <div className="mt-2 inline-block px-2 py-0.5 rounded bg-[#010102] text-[#58F6B1] caption-2 font-semibold not-italic">
                            KOT SLIP #{kotPrintedCount} • DINE IN T-09
                          </div>
                        </div>

                        <div className="space-y-3 py-3 text-sm">
                          {SAMPLE_ITEMS.map((item) => (
                            <div key={item.name} className="flex justify-between gap-2">
                              <div>
                                <span className="font-bold not-italic">{item.qty}x </span>
                                <span className="not-italic">{item.name}</span>
                                <div className="caption-2 text-[#555555] not-italic">
                                  [{item.station}]
                                </div>
                              </div>
                              <div className="font-semibold shrink-0 not-italic">
                                Rs. {item.pricePkr.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 mt-3 space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="not-italic">SUBTOTAL</span>
                            <span className="not-italic">Rs. {subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="not-italic">PRA GST (5%)</span>
                            <span className="not-italic">Rs. {gst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold pt-2">
                            <span className="not-italic">NET PAYABLE</span>
                            <span className="not-italic">Rs. {netTotal.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 text-center caption-2 text-[#555555] not-italic">
                          {offlineSimulated
                            ? 'Queued in local Dexie engine • Zero data loss'
                            : 'Synced to local LAN printer • Raast QR ready'}
                        </div>
                      </div>

                      {/* Station Routing Breakdown */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="rounded-lg bg-[#181818] p-4">
                          <div className="flex items-center justify-between">
                            <span className="caption-2 text-[#58F6B1] font-medium not-italic">
                              Station A • Tandoor &amp; Wok
                            </span>
                            <span className="caption-2 text-[#F5F5F7] not-italic">
                              192.168.1.201
                            </span>
                          </div>
                          <p className="body-5 text-[#F5F5F7] mt-2 not-italic">
                            1x Chicken Karahi Full, 4x Garlic Roghni Naan
                          </p>
                        </div>

                        <div className="rounded-lg bg-[#181818] p-4">
                          <div className="flex items-center justify-between">
                            <span className="caption-2 text-[#AD96F1] font-medium not-italic">
                              Station B • Fry Station
                            </span>
                            <span className="caption-2 text-[#F5F5F7] not-italic">
                              192.168.1.202
                            </span>
                          </div>
                          <p className="body-5 text-[#F5F5F7] mt-2 not-italic">
                            2x Zinger Mighty Burger (Extra Crispy)
                          </p>
                        </div>

                        <div className="rounded-lg bg-[#181818] p-4">
                          <div className="flex items-center justify-between">
                            <span className="caption-2 text-[#9B9B9B] not-italic">
                              Cashier Drawer • USB RJ11
                            </span>
                            <span className="caption-2 text-[#58F6B1] not-italic">
                              Auto kick on settle
                            </span>
                          </div>
                          <p className="body-5 text-[#9B9B9B] mt-2 not-italic">
                            Customer bill and FBR invoice QR printed at counter
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'kds' && (
                  <div className="rounded-2xl bg-[#181818] p-2">
                    <div
                      data-ui="true"
                      className="rounded-lg bg-[#1F1F1F] p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="rounded-lg bg-[#181818] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="py-1 px-2 rounded bg-[#AD96F1] text-[#010102] caption-2 font-semibold not-italic">
                              #418 • Dine In T-09
                            </span>
                            <span className="caption-2 text-[#58F6B1] font-medium not-italic">
                              03:14 elapsed
                            </span>
                          </div>
                          <ul className="space-y-2 text-sm text-[#F5F5F7]">
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">2x Zinger Mighty Burger</span>
                              <span className="caption-1 text-[#58F6B1] font-semibold not-italic">READY</span>
                            </li>
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">1x Chicken Karahi Full</span>
                              <span className="caption-1 text-[#AD96F1] font-semibold not-italic">COOKING</span>
                            </li>
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">4x Garlic Roghni Naan</span>
                              <span className="caption-1 text-[#AD96F1] font-semibold not-italic">CLAY OVEN</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 flex items-center justify-between">
                          <span className="caption-2 text-[#9B9B9B] not-italic">
                            Server: Bilal A.
                          </span>
                          <span className="py-1 px-3 rounded bg-[#58F6B1] text-[#010102] caption-2 font-medium not-italic">
                            Bump Pass
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#181818] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="py-1 px-2 rounded bg-[#58F6B1] text-[#010102] caption-2 font-semibold not-italic">
                              #419 • Direct Delivery
                            </span>
                            <span className="caption-2 text-[#F5F5F7] font-medium not-italic">
                              01:09 elapsed
                            </span>
                          </div>
                          <ul className="space-y-2 text-sm text-[#F5F5F7]">
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">3x Beef Seekh Kabab Roll</span>
                              <span className="caption-1 text-[#AD96F1] font-semibold not-italic">GRILL</span>
                            </li>
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">1x Family Platter Deal 2</span>
                              <span className="caption-1 text-[#AD96F1] font-semibold not-italic">PREP</span>
                            </li>
                            <li className="flex items-center justify-between py-1.5 px-2 rounded bg-[#272727]">
                              <span className="not-italic">2x Fresh Lime Soda</span>
                              <span className="caption-1 text-[#58F6B1] font-semibold not-italic">READY</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 flex items-center justify-between">
                          <span className="caption-2 text-[#9B9B9B] not-italic">
                            Rider: Usman (CD-70)
                          </span>
                          <span className="py-1 px-3 rounded bg-[#272727] text-[#F5F5F7] caption-2 not-italic">
                            Packing
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'floor' && (
                  <div className="rounded-2xl bg-[#181818] p-2">
                    <div
                      data-ui="true"
                      className="rounded-lg bg-[#1F1F1F] p-6 grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {[
                        { id: 'T-01', zone: 'Ground Hall', guests: '4 Guests', bill: 'Rs. 3,850', state: 'Served' },
                        { id: 'T-02', zone: 'Ground Hall', guests: '6 Guests', bill: 'Rs. 7,420', state: 'Firing' },
                        { id: 'T-04', zone: 'Family Booth', guests: '8 Guests', bill: 'Rs. 12,900', state: 'Bill Printed' },
                        { id: 'T-07', zone: 'Family Booth', guests: '2 Guests', bill: 'Rs. 2,150', state: 'Served' },
                        { id: 'T-09', zone: 'Rooftop Lawn', guests: '5 Guests', bill: 'Rs. 5,618', state: 'Firing' },
                        { id: 'T-12', zone: 'Rooftop Lawn', guests: 'Available', bill: 'Rs. 0', state: 'Ready' },
                      ].map((table) => (
                        <div key={table.id} className="rounded-lg bg-[#181818] p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="heading-5 text-[#F5F5F7] not-italic">
                              {table.id}
                            </span>
                            <span
                              className={`py-0.5 px-2 rounded caption-2 font-medium not-italic ${
                                table.state === 'Ready'
                                  ? 'bg-[#272727] text-[#9B9B9B]'
                                  : table.state === 'Firing'
                                  ? 'bg-[#AD96F1] text-[#010102]'
                                  : 'bg-[#58F6B1] text-[#010102]'
                              }`}
                            >
                              {table.state}
                            </span>
                          </div>
                          <div className="mt-4">
                            <div className="caption-2 text-[#9B9B9B] not-italic">{table.zone}</div>
                            <div className="body-4 text-[#F5F5F7] mt-1 not-italic">
                              {table.bill}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'rider' && (
                  <div className="rounded-2xl bg-[#181818] p-2">
                    <div
                      data-ui="true"
                      className="rounded-lg bg-[#1F1F1F] p-6 space-y-3"
                    >
                      {[
                        {
                          rider: 'Usman Ali • Bike LHR-4821',
                          area: 'DHA Phase 5 & Askari 11',
                          orders: '3 Drops Active',
                          cashInHand: 'Rs. 8,450 COD',
                          status: 'En Route',
                        },
                        {
                          rider: 'Kamran Shah • Bike LHR-9104',
                          area: 'Gulberg III & Garden Town',
                          orders: '2 Drops Active',
                          cashInHand: 'Rs. 4,920 Raast Paid',
                          status: 'At Counter',
                        },
                        {
                          rider: 'Noman Tariq • Bike LHR-2290',
                          area: 'Johar Town Block G',
                          orders: 'Shift Settled',
                          cashInHand: 'Rs. 19,800 Verified',
                          status: 'Drawer Matched',
                        },
                      ].map((row) => (
                        <div
                          key={row.rider}
                          className="rounded-lg bg-[#181818] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="body-4 text-[#F5F5F7] font-semibold not-italic">
                              {row.rider}
                            </div>
                            <div className="caption-2 text-[#9B9B9B] mt-0.5 not-italic">
                              {row.area} • {row.orders}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="body-4 text-[#58F6B1] font-semibold not-italic">
                              {row.cashInHand}
                            </span>
                            <span className="py-1 px-2.5 rounded bg-[#272727] caption-2 text-[#F5F5F7] not-italic">
                              {row.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photographic Editorial Pair Anchoring Real Pakistani Kitchen Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-2xl bg-[#181818] p-2">
            <div className="rounded-lg overflow-hidden relative aspect-[16/10] bg-[#010102]">
              <img
                src="/images/landing/kitchen-fire-pass.jpg"
                alt="Pakistani restaurant kitchen pass with stainless steel counter and fiery wok station"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010102] via-[#010102]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="body-5 text-[#F5F5F7] font-medium not-italic">
                  Hot wok &amp; tandoor pass: Built for 48°C commercial kitchens and high volume Friday dinner rushes.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#181818] p-2">
            <div className="rounded-lg overflow-hidden relative aspect-[16/10] bg-[#010102]">
              <img
                src="/images/landing/counter-hardware-dark.jpg"
                alt="Minimal dark anodized cashier counter with 80mm thermal receipt printer in a modern café"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010102] via-[#010102]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="body-5 text-[#F5F5F7] font-medium not-italic">
                  Cashier counter terminal: Runs on existing Windows, Android, or iPad hardware with plug and play 80mm printers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
