# 🍗 HFC Order Management System (OMS)
### High-Performance, Offline-First Restaurant POS & Operations Suite

Designed according to **Apple's Human Interface Guidelines (HIG)** using frosted Liquid Glass materials, dynamic vibrant colors, tactile audio feedback, and continuous squircle curvature. Built with **Next.js 15, React 19, Tailwind CSS, Dexie.js (IndexedDB), and Supabase PostgreSQL**.

---

## 🌟 Core Highlights

- **100% Offline-First Architecture**: Runs locally on the vendor's laptop using Dexie.js (IndexedDB) and local Service Worker caching. Operates with zero downtime even without an internet connection.
- **Bi-Directional Auto Sync**: When internet reconnects, the built-in outbox engine automatically syncs pending mutations (orders, inventory deductions, shifts, and table updates) to your cloud database.
- **Apple HIG Design Standards**:
  - Translucent Liquid Glass headers and navigation sidebars (`backdrop-blur-xl`).
  - Standard materials for card content and modal sheets.
  - 44×44pt touch hit targets on all operational buttons.
  - Pure Web Audio API synthesized Apple payment chimes and tactile click tones.
  - High-contrast typography hierarchy and dynamic light/dark modes.
- **Vercel & Supabase Ready**:
  - Frontend hosted on Vercel's edge network for free.
  - Cloud PostgreSQL hosted on **Supabase Free Tier** (500MB DB, automated backups, realtime sync) or **Neon**.
- **Default Currency**: **PKR (Rs.)** with **0% default sales tax** (fully customizable inside settings).

---

## 🚀 Key Modules & Features

### 1. POS Terminal & Fast Order Processing
- **Menu Catalogue**: Deals & Combos, Crispy Broast, Burgers & Sandwiches, Loaded Fries & Wings, Drinks & Shakes.
- **Cupertino Segmented Order Channels**: Dine-In, Takeaway, and Home Delivery.
- **Modifiers & Addon Sheets**: Customize spice levels (Mild, Hot & Spicy, Ghost Chili), cuts (Leg vs. Chest), cheese slices, and custom kitchen notes.
- **Cart Tray**: Real-time tax calculation, discount coupon codes, delivery fees, and split payment modes (Cash / Card).

### 2. Table Layout & Floor Management
- Graphical visual table floor plan across **Indoor Hall**, **Terrace & Outdoor**, and **VIP Family Rooms**.
- Status indicators: `Available` (🟢), `Occupied` (🟠), `Bill Printed` (🔵), and `Reserved` (🟣).
- One-click table assignment and bill printing.

### 3. Home Delivery & Rider Dispatch
- Customer address, phone number, and landmark management.
- Live transit pipeline: `Awaiting Dispatch` $\to$ `Out with Rider` $\to$ `Delivered & Cash Collected`.
- Active rider assignment from on-duty delivery staff.

### 4. Kitchen Display System (KDS)
- High-contrast fry & grill order tickets.
- Live elapsed stopwatch timers (green $< 10$m, yellow $10-18$m, red pulse $> 18$m).
- Interactive checkbox checklist for kitchen chefs to mark items as they finish frying.

### 5. Thermal Receipt Printing (80mm / 58mm)
- Printable thermal receipt styled via `@media print`.
- Features store logo, order token number (e.g. `HFC-105`), itemized breakdown, tax, delivery fee, grand total, barcode, and QR code.
- Quick "Copy Text" button for sending receipts via WhatsApp or SMS.

### 6. Stock & Inventory Control
- Live inventory tracking of chicken fillets, broast chicken, burger buns, crinkle fries, oil, cheese, and beverages.
- **Automatic stock deduction** upon order completion.
- Low-stock threshold alert pills and one-click restock adjustments.

### 7. Staff Roles & Cash Register Reconciliation
- Multi-role directory: Admin, Manager, Cashier, Kitchen Chef, Delivery Rider, Waiter.
- **Fast 4-Digit PIN Quick Switch**: Instant terminal unlock for shared cashier counters.
- **Shift & Cash Drawer Balancing**: Opening cash float, cash sales, card sales, expected closing balance, and discrepancy tracking.

### 8. Sales Analytics & Reports
- Live gross sales, total orders, and average ticket size.
- Dining channel revenue split (Dine-in vs. Takeaway vs. Delivery).
- Payment method breakdown (Cash vs. Card).
- Top 5 bestselling menu items.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS with Apple HIG Design Tokens |
| **Local Storage** | Dexie.js (IndexedDB) with reactive hooks (`dexie-react-hooks`) |
| **Cloud Database** | Supabase PostgreSQL (Free Tier) |
| **Offline PWA** | Web Service Worker (`sw.js`) + Web App Manifest |
| **Audio** | Native Web Audio API (100% offline synthesis) |
| **Hosting** | Vercel (Frontend & Serverless API Routes) |

---

## 💻 Getting Started Locally

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build for Production
```bash
npm run build
npm start
```

---

## 📱 How to Run 100% Offline on the Vendor's Laptop

1. Open the application in Google Chrome or Microsoft Edge.
2. In the browser address bar, click the **Install App** icon (or click the 3 dots $\to$ *Install "HFC Order Management System"*).
3. The app will launch in its own standalone desktop window.
4. **Disconnect the internet or turn off Wi-Fi**:
   - The top status pill will turn red: **"🔴 Offline (Operating locally)"**.
   - You can create orders, check out, print receipts, manage tables, and adjust stock with zero network connection.
5. **Reconnect Wi-Fi**:
   - The status pill will pulse yellow: **"🟡 Syncing to Cloud..."**
   - All offline actions will flush automatically to Supabase.
   - Status updates to: **"🟢 Online & Cloud Synced"**.

---

## ☁️ Setting Up the Free Supabase Cloud Database

1. Sign up for free at [supabase.com](https://supabase.com).
2. Create a new project (e.g., `hfc-restaurant-db`).
3. In the left navigation, click **SQL Editor** $\to$ **New query**.
4. Open the `supabase/schema.sql` file in this repository, paste the contents into the editor, and click **Run**.
5. Go to **Project Settings** $\to$ **API**:
   - Copy the **Project URL**.
   - Copy the **`anon` `public` API key**.
6. Open HFC POS $\to$ Click **Settings** in the sidebar $\to$ Paste the URL and Anon Key into the **Supabase Cloud Database** section $\to$ Click **Test Cloud Connection** $\to$ Click **Save Changes**.

---

## 🚀 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Keep the default settings (Framework: Next.js) and click **Deploy**.
5. Your restaurant OMS is live and shareable across all branch laptops and mobile tablets!
