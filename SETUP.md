# Family Sync — Setup Guide

> Upload the chaos. Get one clean plan.

## What's Built

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | Mobile-first iPhone-style UI |
| Database | Base44 Entities | Family, members, uploads, events, tasks |
| Auth | Base44 Auth | Email/password + Google sign-in |
| AI Extraction | Base44 `InvokeLLM` | Structured schedule parsing |
| File Storage | Base44 `UploadFile` | Images + PDFs |
| Backend | Base44 Functions | AI extraction function |
| Calendar Export | ICS generator | Download to any calendar app |

---

## Step 1 — Install Base44 CLI

Open your terminal in the `family-sync/` folder:

```bash
cd "family-sync"
npm install
```

## Step 2 — Log in to Base44

```bash
npx base44 login
```

This opens a browser for authentication. Complete the flow, then return to terminal.

## Step 3 — Create the Base44 App

```bash
npx base44 create FamilySync --path .
```

> ⚠️ This creates the Base44 app and generates `base44/.app.jsonc` with your app ID.
> After this runs, copy your **App ID** from the output.

## Step 4 — Set your App ID

Create a `.env.local` file:

```bash
echo "VITE_BASE44_APP_ID=your_app_id_here" > .env.local
```

Also update `src/api/base44Client.js` line 5 to set the default fallback:
```js
appId: import.meta.env.VITE_BASE44_APP_ID || "your_app_id_here",
```

## Step 5 — Push the Data Model

```bash
npx base44 entities push
```

This creates all your database tables: Family, FamilyMember, Upload, ExtractedItem, ApprovedEvent, TaskItem, PackingItem.

## Step 6 — Deploy the AI Function

```bash
npx base44 functions deploy
```

This deploys the `extract-schedule` backend function that powers AI extraction.

## Step 7 — Enable Auth

```bash
npx base44 auth password-login enable
npx base44 auth social-login google enable
npx base44 auth push
```

## Step 8 — Run Locally

```bash
npx base44 dev
```

Or just the frontend:

```bash
npm run dev
```

Open: **http://localhost:5173**

---

## Deploying to Production

```bash
npm run build
npx base44 deploy -y
```

Your app will be live at a Base44 hosted URL.

---

## File Structure

```
family-sync/
├── base44/
│   ├── config.jsonc              # App name, build settings
│   ├── entities/                 # Data model (7 entities)
│   │   ├── family.jsonc
│   │   ├── family-member.jsonc
│   │   ├── upload.jsonc
│   │   ├── extracted-item.jsonc  # ← Core of the review system
│   │   ├── approved-event.jsonc
│   │   ├── task-item.jsonc
│   │   └── packing-item.jsonc
│   └── functions/
│       └── extract-schedule/
│           └── entry.ts          # ← AI extraction engine
├── src/
│   ├── api/base44Client.js       # SDK setup
│   ├── components/
│   │   ├── ui/                   # Button, Card, Badge, Input, Modal
│   │   ├── BottomNav.jsx         # iPhone-style tab bar
│   │   ├── EventCard.jsx         # Calendar event display
│   │   ├── ReviewCard.jsx        # Approve/edit/reject card
│   │   └── UploadCard.jsx        # Upload inbox item
│   ├── pages/
│   │   ├── AuthPage.jsx          # Sign in / Sign up
│   │   ├── HomePage.jsx          # Dashboard with this week + actions
│   │   ├── UploadPage.jsx        # Upload inbox + type selector
│   │   ├── ReviewPage.jsx        # AI review queue
│   │   ├── GamePlanPage.jsx      # Weekly view + ICS export
│   │   └── FamilyPage.jsx        # Add/edit family members
│   └── utils/
│       ├── mockData.js           # Demo data (remove in production)
│       └── icsExport.js          # .ics calendar file generator
└── SETUP.md                      # This file
```

---

## What the AI Extracts

When a parent uploads text, the `extract-schedule` function returns structured items of these types:

| Type | Example |
|---|---|
| `calendar_event` | "Practice Tuesday 5:30pm, Field 4" |
| `task` | "Register for State Cup by Friday" |
| `payment` | "$75 tournament fee due Monday" |
| `form_required` | "Medical consent form needed before camp" |
| `packing_item` | "Bring jersey, cleats, shin guards" |
| `travel_note` | "Park in Lot B, enter Gate 3" |
| `conflict_warning` | Two events at the same time |
| `general_note` | "Coach says no practice on holiday weekend" |

Each item includes a **confidence score** (0–1). Items below 0.7 are flagged yellow for extra parent review.

---

## Next Steps (Post-MVP)

- [ ] Push notifications (web push or email digest)
- [ ] Google/Apple Calendar direct sync (via Base44 Google Calendar connector)
- [ ] PWA manifest + offline support
- [ ] Stripe integration for subscription plans (Base44 Stripe connector)
- [ ] Recurring event expansion
- [ ] Multi-family / team manager view
- [ ] Carpool coordination
- [ ] Capacitor packaging for App Store

---

## Subscription Structure (Future)

| Plan | Price | Limits |
|---|---|---|
| Free | $0 | 5 uploads/month, 1 family |
| Plus | $9.99/mo | Unlimited uploads, 1 family, push notifications |
| Team | $19.99/mo | Unlimited uploads, multi-family, team manager tools |

The `Family.subscription_status` entity field is already in the schema, ready for Stripe integration.

---

## Privacy

Family Sync is built privacy-forward:
- No public profiles
- No child social features  
- Children's data never exposed publicly
- All uploads processed in-memory and stored encrypted
- No advertising or data selling
