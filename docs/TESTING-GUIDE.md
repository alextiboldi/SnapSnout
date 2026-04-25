# SnapSnout Feature Branch Testing Guide

Each feature lives in its own git worktree and can be tested independently.

## Prerequisites

- PostgreSQL running (via Supabase)
- `.env` configured with Supabase credentials
- For AI Studio: add `ANTHROPIC_API_KEY` to `.env`

## Starting a Feature for Testing

```bash
# Navigate to the worktree
cd ../snapsnout-<feature>

# Install dependencies (shared node_modules, but good practice)
pnpm install

# For branches with schema changes, apply migrations:
npx prisma migrate dev

# For all branches, regenerate Prisma client:
npx prisma generate

# Start dev server
pnpm dev
```

---

## 1. User Profile (`../snapsnout-user-profile`)

**Branch:** `feature/user-profile`
**Schema changes:** None

### What was built
- Profile editing page at `/settings/profile`
- Server action for name + avatar update
- "Edit Profile" link on the settings page

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Profile link appears | Go to `/settings` | See "Edit Profile" row with your name, email, and avatar (or person icon) at the top, before "Your Pets" |
| 2 | Profile page loads | Click the profile row | `/settings/profile` shows form with name input, email (read-only), avatar preview |
| 3 | Update name | Change name, click Save | Success message appears. Go back to `/settings` — new name shown in the profile row |
| 4 | Upload avatar | Click "Change photo", select an image | Preview updates immediately with the new image |
| 5 | Avatar persists | Save with new avatar, reload page | Avatar still shows (stored in Supabase `pet-photos` bucket under `{userId}/profile/`) |
| 6 | Email is read-only | Try to edit the email field | Field is disabled with helper text explaining why |
| 7 | Empty name rejected | Clear name field, try to save | Error or validation prevents empty name |

---

## 2. Milestone Tags (`../snapsnout-milestone-tags`)

**Branch:** `feature/milestone-tags`
**Schema changes:** None (tags field already exists on Milestone model)

### What was built
- Tag editor component on milestone rows
- Tag filter chips on the milestones page (URL-based via `?tag=`)
- Server action `updateMilestoneTags`

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Tag filter bar | Go to `/milestones` with a pet that has milestones | Tag filter section visible (may be empty if no tags yet) |
| 2 | Add tags | Find a tag editor on an upcoming milestone. Type "training" and press Enter | Tag chip appears. Refresh page — tag persists |
| 3 | Add via comma | Type "health, fun" in the tag input | Two separate tags added: "health" and "fun" |
| 4 | Remove tag | Click the X on a tag chip | Tag removed. Refresh — gone from DB |
| 5 | Autocomplete | Add "training" to one milestone. On another milestone, start typing "tra" | Autocomplete suggests "training" |
| 6 | Filter by tag | Click a tag chip in the filter bar | URL changes to `?tag=training`. Only milestones with that tag shown |
| 7 | Clear filter | Click "Clear" button in filter bar | All milestones shown again, `?tag=` param removed |
| 8 | Normalization | Add tag " Training " (with spaces, uppercase) | Stored as "training" (trimmed, lowercased) |
| 9 | Featured card tags | Featured milestone with tags | Tags still render with `#tag` styling on the featured card |

---

## 3. Monthly Photo Series (`../snapsnout-monthly-photos`)

**Branch:** `feature/monthly-photo-series`
**Schema changes:** None (isMonthlyPhoto/monthNumber already exist on Photo model)

### What was built
- Monthly photo timeline page at `/milestones/monthly`
- Photo upload per month with server action
- "Monthly photo due" card on home page

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Due indicator | Go to `/` (home) with a pet that has a gotcha day | If the current month's photo hasn't been taken, see a card like "Month N photo time!" linking to `/milestones/monthly` |
| 2 | Monthly page loads | Navigate to `/milestones/monthly` | Grid of month cards (1 through current month, max 24). Empty months show dashed placeholders with camera icon |
| 3 | Upload photo | Click an empty month slot, select an image | Photo uploads, appears in that month's card with M{n} badge |
| 4 | Duplicate prevented | Try uploading again to the same month | Error — photo already exists for this month |
| 5 | Month calculation | Pet with gotcha day 6 months ago | Shows months 1-6. Month 6 marked as "due" if no photo |
| 6 | Photo display | Upload a few monthly photos | Each shows with the M{n} badge overlay, capture date |
| 7 | Due card disappears | Upload photo for the current month, go back to `/` | The "monthly photo due" card should no longer appear |
| 8 | New pet | Create a new pet with gotcha day = today | Monthly page shows only Month 1 |

---

## 4. Notification Preferences (`../snapsnout-notif-prefs`)

**Branch:** `feature/notification-preferences`
**Schema changes:** YES — new `notification_preferences` table

### Setup
```bash
cd ../snapsnout-notif-prefs
npx prisma migrate dev   # Apply the migration
npx prisma generate
pnpm dev
```

### What was built
- `NotificationPreference` model in Prisma
- Toggle persistence via `updateNotificationPreference` server action
- Settings page loads saved preferences

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Default state | Go to `/settings` as a new user (no preference row) | All three toggles ON (milestone reminders, photo reminders, birthday countdown) |
| 2 | Toggle off | Turn off "Milestone Reminders" | Toggle switches off immediately (optimistic UI) |
| 3 | Persistence | Reload the page | "Milestone Reminders" is still OFF |
| 4 | Toggle on | Turn "Milestone Reminders" back on | Switches on, persists on reload |
| 5 | Independent toggles | Turn off photo reminders, keep others on | Only photo reminders off after reload |
| 6 | DB check | Check the database directly | `notification_preferences` row exists with correct boolean values |

### DB Verification
```sql
SELECT * FROM notification_preferences WHERE user_id = '<your-user-id>';
```

---

## 5. Pet Memorial (`../snapsnout-memorial`)

**Branch:** `feature/pet-memorial`
**Schema changes:** YES — adds `tribute_note` column to `pets` table

### Setup
```bash
cd ../snapsnout-memorial
npx prisma migrate dev   # Apply the migration
npx prisma generate
pnpm dev
```

### What was built
- Memorial hero component (muted styling, Rainbow Bridge badge)
- Tribute note field on pet form
- Conditional UI on home + milestones pages

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Normal pet unaffected | View home with a living pet | Normal PetProfileHero, QuickActions, NextMilestoneCard — no change |
| 2 | Create memorial pet | Create or edit a pet, toggle "In Loving Memory" | Deceased date field appears. NEW: tribute note textarea also appears |
| 3 | Tribute note | Type a tribute message, save | Note persists on reload |
| 4 | Memorial home page | Set active pet to a deceased pet, go to `/` | MemorialHero shows: muted photo (desaturated), "In Loving Memory" banner, Rainbow Bridge badge, life dates, tribute note in a quoted card |
| 5 | No quick actions | Home page for memorial pet | QuickActions section hidden. NextMilestoneCard hidden |
| 6 | Recent memories shown | Home page for memorial pet with completed milestones | RecentMilestones carousel still visible (life story) |
| 7 | Milestones: Life Story | Go to `/milestones` for a memorial pet | Subtitle reads "{name}'s Life Story" instead of "{name}'s Journey" |
| 8 | No upcoming section | Milestones page for memorial pet | "Coming Up" section hidden. Today/upcoming stats hidden from summary bar |
| 9 | No FAB | Milestones page for memorial pet | Floating action button (create card) hidden |
| 10 | Sharing still works | Share a milestone from a memorial pet | Share link still functional |

---

## 6. AI Studio Backend (`../snapsnout-ai-studio`)

**Branch:** `feature/ai-studio-backend`
**Schema changes:** None
**Extra dependency:** `@anthropic-ai/sdk`

### Setup
```bash
cd ../snapsnout-ai-studio
pnpm install             # Installs @anthropic-ai/sdk
npx prisma generate

# Add to .env:
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

pnpm dev
```

### What was built
- Claude Haiku integration for card text generation
- API route `POST /api/studio/generate`
- Photo upload to Supabase for studio source material
- Save generated cards as milestones
- Rewired generate page (server component wrapper + client form)

### Test Steps

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Page loads with pet | Go to `/studio/generate` with an active pet | Page shows pet name, upload area, style selector, generate button |
| 2 | No pet redirect | Remove active pet, go to `/studio/generate` | Redirects or shows message to add a pet first |
| 3 | Upload photo | Click "Add photo" button, select an image | Photo uploads to Supabase, thumbnail preview appears |
| 4 | Upload multiple | Upload 2-3 photos | All thumbnails shown in the source material area |
| 5 | Select style | Choose "Renaissance" from style dropdown | Style updates in the settings panel |
| 6 | Generate card | Click Generate with photos + style selected | Loading state appears. After a few seconds, AI-generated title + description appears in the preview card |
| 7 | Card content | Check the generated text | Matches the style theme (e.g., Renaissance = flowery classical language) |
| 8 | Custom prompt | Enter a custom prompt like "Pixar animation style", generate | Card text reflects the custom style |
| 9 | Save to timeline | Click "Save to Timeline" | Success feedback. Go to `/milestones` — new milestone with "ai-studio" tag |
| 10 | Share | Click Share button | Native share sheet or clipboard copy |
| 11 | Without API key | Remove `ANTHROPIC_API_KEY`, try generating | Graceful error message shown |

### API Verification
```bash
curl -X POST http://localhost:3000/api/studio/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{"style":"Field Journal","petId":"<pet-uuid>"}'
```
Expected: JSON with `title`, `description`, `tags` fields.

---

## Quick Reference

| Feature | Worktree | Route(s) | Migration? | Extra Setup |
|---------|----------|----------|------------|-------------|
| User Profile | `snapsnout-user-profile` | `/settings/profile` | No | — |
| Milestone Tags | `snapsnout-milestone-tags` | `/milestones?tag=x` | No | — |
| Monthly Photos | `snapsnout-monthly-photos` | `/milestones/monthly` | No | — |
| Notif Prefs | `snapsnout-notif-prefs` | `/settings` | Yes | `prisma migrate dev` |
| Pet Memorial | `snapsnout-memorial` | `/`, `/milestones` | Yes | `prisma migrate dev` |
| AI Studio | `snapsnout-ai-studio` | `/studio/generate` | No | `ANTHROPIC_API_KEY` in `.env` |
