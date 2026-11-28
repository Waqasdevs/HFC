import type { Order, RestaurantSettings } from '@/types';

export function formatReceiptLine(left: string, right: string, width = 42): string {
  left = String(left || '');
  right = String(right || '');
  const spaceNeeded = width - left.length - right.length;
  if (spaceNeeded <= 0) {
    const maxLeft = Math.max(0, width - right.length - 1);
    left = left.substring(0, maxLeft);
    return left + ' ' + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

export function formatCenter(text: string, width = 42): string {
  text = String(text || '').trim();
  if (text.length >= width) return text;
  const leftPad = Math.floor((width - text.length) / 2);
  return ' '.repeat(leftPad) + text;
}

export function generateCustomerReceiptText(
  order: Order,
  settings: RestaurantSettings,
  width = 42,
  includeHeaderText = true
): string {
  const line = '-'.repeat(width);
  const doubleLine = '='.repeat(width);
  const lines: string[] = [];

  if (includeHeaderText) {
    lines.push(formatCenter('HFC', width));
    lines.push(formatCenter('HASEEB FOOD CAFE', width));
  }
  lines.push(line);

  // Token & Order Type (using ASCII '-' instead of unicode bullet)
  lines.push(formatCenter(`*** ${order.token} ***`, width));
  const orderTypeStr = `${order.type.replace('_', ' ').toUpperCase()}${order.tableNumber ? ` - TABLE ${order.tableNumber}` : ''}`;
  lines.push(formatCenter(orderTypeStr, width));
  lines.push(line);

  // Date & Cashier
  const dateStr = new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  lines.push(formatReceiptLine('Date:', dateStr, width));
  lines.push(formatReceiptLine('Cashier:', order.serverName || 'Counter', width));

  if (order.customer?.name) {
    lines.push(formatReceiptLine('Customer:', order.customer.name, width));
    lines.push(formatReceiptLine('Phone:', order.customer.phone, width));
    if (order.customer.address) {
      lines.push(`Address: ${order.customer.address}`);
    }
  }

  lines.push(line);
  lines.push(formatReceiptLine('ITEM', 'QTY x PRICE = TOTAL', width));
  lines.push(line);

  // Items
  for (const item of order.items) {
    const itemTotal = `${settings.currency} ${item.price * item.quantity}`;
    lines.push(formatReceiptLine(item.name, itemTotal, width));
    lines.push(`  ${item.quantity} @ ${settings.currency} ${item.price}`);
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      lines.push(`  + ${item.selectedModifiers.map(m => m.choiceName).join(', ')}`);
    }
    if (item.notes) {
      lines.push(`  Note: ${item.notes}`);
    }
  }

  lines.push(line);
  lines.push(formatReceiptLine('Subtotal:', `${settings.currency} ${order.subtotal}`, width));
  if (order.discount > 0) {
    lines.push(formatReceiptLine('Discount:', `-${settings.currency} ${order.discount}`, width));
  }
  if (order.deliveryCharge > 0) {
    lines.push(formatReceiptLine('Delivery Fee:', `+${settings.currency} ${order.deliveryCharge}`, width));
  }
  if (order.tax > 0) {
    lines.push(formatReceiptLine(`Tax (${settings.taxRate || 0}%):`, `+${settings.currency} ${order.tax}`, width));
  }
  lines.push(doubleLine);
  lines.push(formatReceiptLine('GRAND TOTAL:', `${settings.currency} ${order.total}`, width));
  lines.push(doubleLine);

  const paymentText = order.paymentStatus === 'paid'
    ? `${order.paymentMethod.toUpperCase()} (PAID)`
    : `UNPAID (${order.type === 'dine_in' ? 'PAY AT COUNTER' : 'COD'})`;
  lines.push(formatReceiptLine('Payment Mode:', paymentText, width));
  lines.push(line);

  // Home Delivery Call Information
  lines.push(formatCenter('For Home Delivery Call:', width));
  lines.push(formatCenter('0343-5140308 / 0310-1879930', width));
  lines.push('');
  lines.push(formatCenter('Thank You for Dining With Us!', width));
  lines.push(formatCenter('Powered by HFC POS', width));

  return lines.join('\n');
}

export function generateKitchenSlipText(order: Order, width = 42): string {
  const line = '-'.repeat(width);
  const doubleLine = '='.repeat(width);
  const lines: string[] = [];

  lines.push('');
  lines.push(formatCenter('*** KITCHEN SLIP (KOT) ***', width));
  lines.push(formatCenter(order.token, width));
  const orderTypeStr = `${order.type.replace('_', ' ').toUpperCase()}${order.tableNumber ? ` - TABLE ${order.tableNumber}` : ''}`;
  lines.push(formatCenter(orderTypeStr, width));
  lines.push(formatCenter(`Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, width));
  lines.push(doubleLine);
  lines.push(formatReceiptLine('QTY  ITEM', 'STATION', width));
  lines.push(line);

  for (const item of order.items) {
    lines.push(`${item.quantity}x  ${item.name}`);
    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      lines.push(`    + ${item.selectedModifiers.map(m => m.choiceName).join(', ')}`);
    }
    if (item.notes) {
      lines.push(`    NOTE: ${item.notes}`);
    }
  }

  lines.push(line);
  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
  lines.push(formatReceiptLine(`Total Items: ${totalQty}`, 'Kitchen Pass', width));

  return lines.join('\n');
}

export interface BrandHeader {
  title: string;
  subtitle?: string;
}

export function printThermalText(
  text: string,
  title = 'Receipt',
  brandHeader?: BrandHeader
): void {
  if (typeof window === 'undefined') return;

  let iframe = document.getElementById('thermal-print-iframe') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'thermal-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '100px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  } else {
    iframe.style.width = '80mm';
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const brandHtml = brandHeader
    ? `<div class="brand-header">
        <div class="brand-title">${escapeHtml(brandHeader.title)}</div>
        ${brandHeader.subtitle ? `<div class="brand-subtitle">${escapeHtml(brandHeader.subtitle)}</div>` : ''}
      </div>`
    : '';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(title)}</title>
      <style id="thermal-page-style">
        @page {
          size: 80mm 297mm;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          width: 80mm;
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 12px;
          line-height: 1.25;
          letter-spacing: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt-sheet {
          width: 78mm;
          max-width: 78mm;
          margin: 0 auto;
          padding: 4mm 2mm 25mm 2mm;
          background: #ffffff !important;
          color: #000000 !important;
        }
        .brand-header {
          text-align: center;
          margin-bottom: 4px;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
        }
        .brand-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 3px;
          line-height: 1.05;
          color: #000000 !important;
        }
        .brand-subtitle {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-top: 2px;
          color: #000000 !important;
        }
        pre {
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          white-space: pre-wrap;
          word-break: break-all;
          color: #000000 !important;
          background: #ffffff !important;
        }
      </style>
    </head>
    <body>
      <div class="receipt-sheet">
        ${brandHtml}
        <pre>${escapedText}</pre>
      </div>
    </body>
    </html>
  `);
  doc.close();

  const applyExactPageSize = () => {
    const sheetEl = doc.querySelector('.receipt-sheet');
    const pageStyleEl = doc.getElementById('thermal-page-style');
    if (!sheetEl || !pageStyleEl) return;
    const heightPx = Math.ceil(sheetEl.getBoundingClientRect().height);
    if (heightPx > 0) {
      // @page `80mm auto` is invalid in CSS Paged Media and ignored by Chromium (falling back to Letter/A4).
      // Setting exact `80mm <height>mm` keeps receipts to their true length on strictly 1 sheet.
      const heightMm = Math.max(50, Math.ceil((heightPx * 25.4) / 96) + 2);
      if (iframe) iframe.style.height = `${heightPx + 8}px`;
      pageStyleEl.textContent =
        pageStyleEl.textContent?.replace(/size:\s*80mm\s+[^;]+;/, `size: 80mm ${heightMm}mm;`) || '';
    }
  };

  applyExactPageSize();

  setTimeout(() => {
    try {
      applyExactPageSize();
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 100);
}

export function printCustomerReceipt(order: Order, settings: RestaurantSettings): void {
  const text = generateCustomerReceiptText(order, settings, 42, false);
  printThermalText(text, order.token || 'Receipt', {
    title: 'HFC',
    subtitle: 'HASEEB FOOD CAFE',
  });
}

export function printKitchenSlip(order: Order): void {
  const text = generateKitchenSlipText(order);
  printThermalText(text, `KOT-${order.token || 'Order'}`);
}

export interface SalesReportPrintPayload {
  periodLabel: string;
  currency: string;
  totalPaidRevenue: number;
  paidTicketsCount: number;
  pendingUnpaidRevenue: number;
  unpaidTicketsCount: number;
  totalOrderTickets: number;
  cancelledTicketsCount: number;
  averageTicket: number;
  dineInCount: number;
  dineInRevenue: number;
  takeawayCount: number;
  takeawayRevenue: number;
  deliveryCount: number;
  deliveryRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  brotherStats: Record<string, { count: number; revenue: number }>;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  orders: Order[];
}

export function printSalesReport(report: SalesReportPrintPayload): void {
  if (typeof window === 'undefined') return;

  let iframe = document.getElementById('report-print-iframe') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'report-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const esc = (s: unknown) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const c = esc(report.currency);
  const fmt = (n: number) => `${c} ${Number(n || 0).toLocaleString()}`;

  const brothersRows = Object.entries(report.brotherStats)
    .map(
      ([name, stats]) => `
      <tr>
        <td>${esc(name)}</td>
        <td class="right">${stats.count}</td>
        <td class="right bold">${fmt(stats.revenue)}</td>
      </tr>`
    )
    .join('') || '<tr><td colspan="3" class="muted">No settled orders in this period</td></tr>';

  const topItemRows = report.topItems
    .map(
      (item, idx) => `
      <tr>
        <td>#${idx + 1} ${esc(item.name)}</td>
        <td class="right">${item.quantity}</td>
        <td class="right bold">${fmt(item.revenue)}</td>
      </tr>`
    )
    .join('') || '<tr><td colspan="3" class="muted">No items sold in this period</td></tr>';

  const orderRows = report.orders
    .slice(0, 100)
    .map(
      (o) => `
      <tr>
        <td class="bold">${esc(o.token)}</td>
        <td>${esc(o.type.replace('_', ' ').toUpperCase())}</td>
        <td>${esc(o.serverName?.split(' ')[0] || 'Haseeb')}</td>
        <td>${esc((o.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', '))}</td>
        <td>${esc(o.paymentMethod.toUpperCase())}</td>
        <td>${esc(o.paymentStatus.toUpperCase())}</td>
        <td class="right bold">${fmt(o.total)}</td>
      </tr>`
    )
    .join('') || '<tr><td colspan="7" class="muted">No transactions found in this period</td></tr>';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HFC Sales Report - ${esc(report.periodLabel)}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          color: #111111;
          background: #ffffff;
          font-size: 11px;
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #111;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .brand { font-size: 20px; font-weight: 900; letter-spacing: 0.5px; }
        .sub { font-size: 11px; color: #555; }
        .meta { text-align: right; font-size: 10px; color: #444; }
        .kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .kpi {
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          padding: 10px;
        }
        .kpi-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: 700; }
        .kpi-val { font-size: 16px; font-weight: 900; margin-top: 3px; }
        .kpi-sub { font-size: 9px; color: #555; margin-top: 2px; }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }
        .section {
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          break-inside: avoid;
        }
        .section h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: #222; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { padding: 5px 6px; border-bottom: 1px solid #e4e4e7; text-align: left; }
        th { background: #f4f4f5; font-weight: 700; text-transform: uppercase; font-size: 9px; color: #444; }
        .right { text-align: right; }
        .bold { font-weight: 700; }
        .muted { color: #777; text-align: center; padding: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">HFC — HASEEB FOOD CAFE</div>
          <div class="sub">Sales &amp; Financial Audit Report &bull; ${esc(report.periodLabel)}</div>
        </div>
        <div class="meta">
          Generated: ${esc(new Date().toLocaleString())}
        </div>
      </div>

      <div class="kpis">
        <div class="kpi">
          <div class="kpi-label">Net Paid Revenue</div>
          <div class="kpi-val">${fmt(report.totalPaidRevenue)}</div>
          <div class="kpi-sub">From ${report.paidTicketsCount} paid tickets</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Unpaid / Counter Bills</div>
          <div class="kpi-val">${fmt(report.pendingUnpaidRevenue)}</div>
          <div class="kpi-sub">${report.unpaidTicketsCount} awaiting settlement</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Total Tickets</div>
          <div class="kpi-val">${report.totalOrderTickets} Orders</div>
          <div class="kpi-sub">${report.cancelledTicketsCount} cancelled</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Avg Ticket Size</div>
          <div class="kpi-val">${fmt(report.averageTicket)}</div>
          <div class="kpi-sub">Per paid transaction</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="section">
          <h3>Channel &amp; Payment Breakdown</h3>
          <table>
            <tbody>
              <tr><td>Dine-In (${report.dineInCount} orders)</td><td class="right bold">${fmt(report.dineInRevenue)}</td></tr>
              <tr><td>Takeaway (${report.takeawayCount} orders)</td><td class="right bold">${fmt(report.takeawayRevenue)}</td></tr>
              <tr><td>Home Delivery (${report.deliveryCount} orders)</td><td class="right bold">${fmt(report.deliveryRevenue)}</td></tr>
              <tr><td>Cash Collected</td><td class="right bold">${fmt(report.cashRevenue)}</td></tr>
              <tr><td>Card / Online Transfer</td><td class="right bold">${fmt(report.cardRevenue)}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Cashier Brother Shift Audit</h3>
          <table>
            <thead><tr><th>Cashier</th><th class="right">Paid Orders</th><th class="right">Revenue</th></tr></thead>
            <tbody>${brothersRows}</tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h3>Top Selling Menu Items</h3>
        <table>
          <thead><tr><th>Item</th><th class="right">Qty Sold</th><th class="right">Gross Revenue</th></tr></thead>
          <tbody>${topItemRows}</tbody>
        </table>
      </div>

      <div class="section">
        <h3>Transaction Ledger (${Math.min(report.orders.length, 100)} of ${report.orders.length} orders)</h3>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Channel</th>
              <th>Cashier</th>
              <th>Items</th>
              <th>Method</th>
              <th>Status</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>${orderRows}</tbody>
        </table>
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 150);
}
