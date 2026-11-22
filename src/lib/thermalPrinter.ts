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

export function generateCustomerReceiptText(order: Order, settings: RestaurantSettings, width = 42): string {
  const line = '-'.repeat(width);
  const doubleLine = '='.repeat(width);
  const lines: string[] = [];

  // Top spacing (prevents cutter from cutting header)
  lines.push('');
  const restaurantName = (settings.restaurantName || 'HFC (Haseeb Food Cafe)').replace(/Corner/gi, 'Cafe');
  lines.push(formatCenter(restaurantName.toUpperCase(), width));
  // Tagline removed per customer specification
  const address = settings.address || 'Masjid Ghousia Town Chitti Mitti, Bhimber Road, Samahni';
  lines.push(formatCenter(address, width));
  const phone = settings.phone || '0343-5140308 / 0310-1879930';
  lines.push(formatCenter(`Ph: ${phone}`, width));
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

  // Trailing paper feed lines (ensures entire receipt feeds past cutter/tear bar)
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');

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

  // Trailing paper feed lines for KOT
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');

  return lines.join('\n');
}

export function printThermalText(text: string, title = 'Receipt'): void {
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

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: 80mm auto;
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
          width: 100%;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 12px;
          line-height: 1.25;
          letter-spacing: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        pre {
          width: 78mm;
          max-width: 78mm;
          margin: 0 auto;
          padding: 6mm 2mm 25mm 2mm;
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
      <pre>${escapedText}</pre>
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
  }, 100);
}

export function printCustomerReceipt(order: Order, settings: RestaurantSettings): void {
  const text = generateCustomerReceiptText(order, settings);
  printThermalText(text, order.token || 'Receipt');
}

export function printKitchenSlip(order: Order): void {
  const text = generateKitchenSlipText(order);
  printThermalText(text, `KOT-${order.token || 'Order'}`);
}
