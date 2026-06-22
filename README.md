# Family Sync — AI Family Sports Organizer

> **Upload the chaos. Get one clean family game plan.**

Family Sync turns messy real-life schedule inputs — screenshots, coach emails, tournament schedules, camp notices, PDFs, pasted text — into one clean weekly family game plan.

---

## What It Does

1. **Parent uploads** messy schedule content (screenshot, PDF, email paste, quick note)
2. **AI extracts** events, tasks, deadlines, payments, forms, packing needs, leave-by times
3. **Parent reviews** and approves each item (nothing is auto-saved)
4. **App generates** a clean weekly GamePlan view
5. **Parent exports** to calendar (.ics) and gets leave-by reminders

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS 3.x       |
| Backend    | Base44 (auth, database, functions, AI)   |
| AI         | Base44 InvokeLLM via backend function    |
| Routing    | React Router v6                          |
| Dates      | date-fns                                 |
| Icons      | lucide-react                             |
| PWA        | vite-plugin-pwa + Workbox                |
| Calendar   | RFC 5545 ICS (client-side generation)    |

---

## Architecture

```
src/
├── services/               ← ALL backend calls live here
│   ├── base44Client.js     ← SDK singleton (only file importing @base44/sdk)
│   ├── auth.service.js
│   ├── family.service.js
│   ├── upload.service.js
│   ├── extraction.service.js   ← AI orchestrator
│   ├── review.service.js
│   ├── events.service.js
│   ├── tasks.service.js
│   ├── calendar.service.js     ← ICS generation (zero backend deps)
│   ├── ai/
│   │   ├── extractionProvider.js   ← Provider interface + type docs
│   │   ├── base44Provider.js       ← Default: Base44 InvokeLLM
│   │   └── openaiProvider.stub.js  ← Migration stub
│   └── mock/
│       └── mockData.js         ← Demo mode data
├── contexts/
│   └── FamilyContext.jsx   ← Family state provider (no prop drilling)
├── pages/                  ← React pages — import from services only
│   ├── AuthPage.jsx
│   ├── HomePage.jsx
│   ├── UploadPage.jsx
│   ├── ReviewPage.jsx
│   ├── GamePlanPage.jsx
│   └── FamilyPage.jsx
├── components/
│   ├── AppLayout.jsx
│   ├── BottomNav.jsx
│   ├── ReviewCard.jsx
│   ├── EventCard.jsx
│   ├── UploadCard.jsx
│   └── ui/                 ← Button, Card, Badge, Modal, Input
└── App.jsx                 ← Auth state machine + router

base44/
├── config.jsonc            ← Base44 app config
├── entities/               ← Database schema (see SCHEMA.md)
└── functions/
    └── extract-schedule/   ← AI extraction backend function
        └── entry.ts
```

### Portability Principle

**UI components never import from `@base44/sdk` directly.** Every Base44 call goes through `src/services/`. To migrate to a different backend (Supabase, Firebase, custom API), update the service files — the React components don't change.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Base44 account (free at [base44.com](https://base44.com))

### 1. Install dependencies
```bash
cd family-sync
npm install
```

### 2. Run in demo mode (no backend needed)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) — the app runs fully with mock data.

### 3. Connect Base44 (full backend)

```bash
# Log in to Base44 CLI
npx base44 login

# Create the app (run from the family-sync directory)
npx base44 create FamilySync --path .

# Copy the app ID shown and add it to your env:
echo "VITE_BASE44_APP_ID=your_app_id_here" > .env.local

# Push entity schemas to Base44
npx base44 entities push

# Deploy the AI extraction backend function
npx base44 functions deploy

# Enable auth in Base44 dashboard → Auth → Enable Email + Google

# Start the dev server
npm run dev
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## Environment Variables

| Variable               | Required | Description                              |
|------------------------|----------|------------------------------------------|
| `VITE_BASE44_APP_ID`   | No*      | Your Base44 app ID. Without this, app runs in demo mode. |
| `VITE_EXTRACTION_API_URL` | No    | Alternative AI extraction endpoint (for future migration) |

*Demo mode works without any env vars set.

---

## Demo Mode

When `VITE_BASE44_APP_ID` is not set (or is `YOUR_APP_ID`), the app enters demo mode:
- All service calls return mock data from `src/services/mock/mockData.js`
- No network calls are made
- The full UI is exercisable
- A console warning is logged

---

## AI Extraction — Swapping Providers

The AI extraction is decoupled from the UI via a provider interface:

```js
// src/services/ai/extractionProvider.js — interface
// Each provider must implement:
{
  name: string,
  extract(rawText, familyContext) → Promise<ExtractionResult>
}
```

To swap providers, call `setExtractionProvider()` in `src/main.jsx` before the app mounts:

```js
// Example: swap to a custom API server
import { setExtractionProvider } from './services/extraction.service.js';
import { openaiProvider } from './services/ai/openaiProvider.stub.js';

// Fill in the stub, then:
setExtractionProvider(openaiProvider);
```

See `src/services/ai/openaiProvider.stub.js` for the pattern.

---

## PWA / Mobile

The app is PWA-ready:
- `public/manifest.json` — full Web App Manifest with shortcuts and Share Target
- `vite-plugin-pwa` — generates service worker on build with Workbox
- iOS meta tags in `index.html` — Add to Home Screen works on Safari
- `viewport-fit=cover` — content respects iPhone notch and Dynamic Island
- Input font-size 16px — prevents iOS auto-zoom on tap

To test "Add to Home Screen" on iOS:
1. `npm run build && npm run preview`
2. Open on iPhone Safari → Share → Add to Home Screen

### Capacitor (App Store path)

The app is designed to wrap with Capacitor without a rewrite:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init FamilySync com.familysync.app
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

---

## Entity Schema

See [SCHEMA.md](./SCHEMA.md) for the full entity map, field definitions, confidence score bands, and migration notes.

---

## Roadmap

**v0.1 (MVP — this build)**
- [x] Upload inbox (image, PDF, text, note)
- [x] AI extraction with confidence scoring
- [x] Parent review queue (approve / edit / reject)
- [x] Weekly GamePlan view
- [x] Leave-by time reminders
- [x] Packing checklist
- [x] ICS calendar export
- [x] PWA manifest + service worker
- [x] Demo mode

**v0.2**
- [ ] Push notifications for upcoming events (Web Push + VAPID)
- [ ] Shared family view (invite second parent)
- [ ] Recurring event detection
- [ ] Conflict detection (two family members needed at same time)

**v0.3**
- [ ] Subscription paywall (Free / Plus / Team)
- [ ] App Store release via Capacitor

---

## Privacy

- Children are stored as `FamilyMember` records, not user accounts
- No children ever have login credentials
- Family data is never shared or used for advertising
- 90-day retention policy after account deactivation
- All data encrypted at rest and in transit via Base44
