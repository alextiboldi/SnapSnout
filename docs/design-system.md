# SnapSnout — Design System Overhaul

> **Working name**: *Pawprint Clay* — a playful, family-warm evolution of the existing "Gaia's Blueprint" tokens.

## TL;DR

Take the cozy, hand-crafted feel the app already has and dial it more playful, more tactile, more *family*. Keep the warm clay/ochre/butter foundation. Add bouncy clay shadows, rounder display type, sticker-style accents, and a new coral highlight for celebrations.

---

## 1 · Direction

| Axis | Before | After |
|---|---|---|
| **Aesthetic** | Earthy blueprint, hand-drawn edges | Tactile clay + sticker book |
| **Typography** | Plus Jakarta Sans / Manrope / Space Grotesk | **Fredoka** (display) / **Nunito** (body) / Space Grotesk (data labels only) |
| **Mood** | Sober artisan | Warm, bouncy, joyful — without being childish |
| **Motion** | Subtle springs | Pronounced press feedback, staggered reveals, celebration micro-animations on milestone completion |
| **Highlights** | Ochre + butter only | Add **Coral Pop** as a celebration / "moment of joy" accent |
| **Surfaces** | Flat ambient cards | Claymorphism — soft pillow shadows + faint inner glow |

The aesthetic foundation isn't being replaced. It's getting **more rounded, more bouncy, and more emotionally readable** — because this app is fundamentally about love between people and their pets.

---

## 2 · Color tokens

The existing palette stays. Three additions:

```css
/* Coral Pop — celebrations, completion confetti, "today" highlights */
--color-pop:                  #ff6b6b;
--color-pop-dim:              #ee5a52;
--color-pop-container:        #ffd5d2;
--color-on-pop:               #ffffff;
--color-on-pop-container:     #5a0d09;

/* Sage — calm secondary for "completed/done" states (pairs nicely with coral) */
--color-sage:                 #6b9d7e;
--color-sage-dim:             #4f7d61;
--color-sage-container:       #d6ebdc;
--color-on-sage:              #ffffff;
--color-on-sage-container:    #143420;
```

**Semantic mapping**

| Token | Use for |
|---|---|
| `primary` (ochre) | Brand identity, primary CTAs, navigation accent |
| `secondary` (butter) | Big shouty buttons, premium banner, badges |
| `tertiary` (blueprint blue) | Data, dates, links, technical labels |
| `pop` (coral) | "Today" milestones, celebration confetti, share-success toasts, **completed milestone glow** |
| `sage` | Subtle "done" states, gentle success ticks |
| `error` | Destructive only |

**Contrast notes**: All foreground/background pairs in the doc verify ≥4.5:1 against their `on-` counterpart. Coral on white passes 4.6:1 for `text-pop`; coral on `pop-container` is for chip/badge backgrounds only — keep text on it dark.

---

## 3 · Typography

Switch headlines to **Fredoka** (rounded geometric, warm but legible) and body to **Nunito** (humanist sans, family-friendly). Both are Google Fonts, both have variable axes, both ship with great cyrillic + latin coverage.

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headline | **Fredoka** | 500, 600, 700 | Tighter tracking on hero, looser on body headings |
| Body | **Nunito** | 400, 600, 700 | 16px base on mobile, 1.55 line-height |
| Label / data | **Space Grotesk** | 500, 700 | Kept for tabular numbers, dates, technical chips — gives data confidence |

**Type scale** (mobile → desktop):

```
Hero      32 → 48
Title     22 → 28
Subtitle  18 → 22
Body      16 → 16
Caption   13 → 13
Label     11 → 11
```

---

## 4 · Shape & elevation (Claymorphism)

Cards are pillows. Soft, dual shadows + a faint inset highlight gives the illusion of dough.

```css
/* Pillow shadow — for cards, hero blocks, modals */
.shadow-clay {
  box-shadow:
    /* outer pillow */
    0 14px 28px -10px rgba(154, 81, 30, 0.18),
    0 4px 10px rgba(55, 56, 49, 0.06),
    /* inner highlight that catches the eye */
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    inset 0 -2px 4px rgba(154, 81, 30, 0.08);
}

.shadow-clay-lg {
  box-shadow:
    0 24px 44px -14px rgba(154, 81, 30, 0.22),
    0 8px 16px rgba(55, 56, 49, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -3px 6px rgba(154, 81, 30, 0.1);
}

/* Pressed state — for primary buttons; flips the shadow inward */
.shadow-clay-pressed {
  box-shadow:
    inset 0 4px 8px rgba(154, 81, 30, 0.25),
    inset 0 -1px 0 rgba(255, 255, 255, 0.5);
}
```

**Radius scale**: bumped up across the board. Cards use `rounded-[28px]`, modals `rounded-[36px]`, primary buttons `rounded-full`. The existing `irregular-border` hand-drawn corners stay for hero blocks and feature cards — they're a brand signature.

---

## 5 · Motion

| Token | Value | Used for |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Press, modal open, sticker drop |
| `--ease-warm` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | General transitions |
| `--dur-tap` | `120ms` | Press feedback |
| `--dur-micro` | `200ms` | Hover, focus, color shifts |
| `--dur-modal` | `320ms` | Sheets, overlays |
| `--dur-celebrate` | `600ms` | Confetti, milestone unlock pop |

**Press deformation**: tappable cards and buttons scale to `0.96` on `:active` with `--ease-spring`. Already in place via `.spring-active`.

**Stagger**: list items animate in with a 50ms stagger using `animation-delay`.

**Confetti hook**: when a milestone is marked complete, fire a one-shot coral burst centered on the milestone card. Disabled under `prefers-reduced-motion`.

---

## 6 · Iconography

Material Symbols Outlined stays — already loaded, consistent across the app, free, universal. Two rules:

1. Always use **filled** variant for active state, **outlined** for inactive — never mix in the same row.
2. Default size `text-xl`; never smaller than `text-base` to keep tap-targetable padding around icons.

For brand mascot moments (empty states, splash), allow custom SVG illustrations of pets in the warm clay palette. None ship in this overhaul yet — placeholder slots only.

---

## 7 · Component recipes

### Pillow card (default)
```jsx
<div className="rounded-[28px] bg-surface-container-lowest shadow-clay p-5 md:p-6">
  ...
</div>
```

### Hero card with hand-drawn corners
```jsx
<div className="irregular-border bg-surface-container-lowest shadow-clay-lg p-6 md:p-8">
  ...
</div>
```

### Squishy primary button
```jsx
<button className="rounded-full bg-primary text-on-primary px-6 py-3.5
                   font-display font-bold shadow-clay
                   spring-active hover:shadow-clay-lg
                   active:shadow-clay-pressed transition-shadow">
  Start tracking
</button>
```

### Sticker badge (for "Today!", "New!", "Streak")
```jsx
<span className="inline-flex items-center gap-1 rounded-full bg-pop text-on-pop
                 px-3 py-1 font-display text-xs font-bold
                 shadow-clay -rotate-3 spring-active">
  <Icon name="bolt" filled />
  Today!
</span>
```

### Bottom-nav item
- Min 64×56 tap area
- Filled icon + sticker-coral active dot below the label
- Stagger fade-in on first mount

### Empty state
- Centered SVG mascot illustration (100×100 min)
- Fredoka headline (Display)
- Nunito body subtitle
- One primary squishy CTA — never two

---

## 8 · Surface-by-surface notes

| Surface | Change |
|---|---|
| **Splash** | Replace generic logo bounce with the coral confetti + Fredoka wordmark. Keep ≤2 seconds. |
| **Onboarding** | Three slides → keep, but each gets a sticker-style illustration and Fredoka heading. |
| **Home** | Pet hero card uses clay-lg shadow + sticker "X months old" badge. Quick actions become squishy buttons. |
| **Milestones list** | Each row is a pillow card. Completed milestones get a sage tick + faint sage tint. Today gets the coral sticker. Featured milestone is hero-sized with clay-lg + a coral "Today!" sticker if applicable. |
| **Milestone detail modal** | Already a strong pattern — bump to claymorphism shadows, swap to Fredoka title, add the coral confetti burst on first share. |
| **Photo gallery** | Square thumbnails get `rounded-[20px]` + clay shadow on hover. |
| **Settings** | Section headers use Fredoka. Each section is a pillow card. Family avatars get a 1px coral ring when "you". |
| **Family invite modal** | Already in good shape. Bump shadows to clay, copy/send buttons squishy. |
| **Public share page** | Hero card gets clay-lg + a coral "shared with love" badge in the corner. |

---

## 9 · Light mode only (for now)

Dark mode is **explicitly out of scope** for this overhaul. The clay aesthetic depends on light surfaces and warm tints — a proper dark mode needs its own palette pass. Defer until the warm direction is locked.

---

## 10 · Pre-delivery checklist

- [ ] All foreground/background pairs ≥4.5:1
- [ ] All tap targets ≥44×44px
- [ ] Press states give visible feedback within 120ms
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Type scale tested at iPhone SE width (375px)
- [ ] Fredoka + Nunito loaded with `display: swap` and preconnect
- [ ] No emoji used as structural icons (ok inside content like milestone descriptions)
- [ ] Sticker badges don't replace accessible labels — they reinforce them
- [ ] Confetti animation is a one-shot, not a loop

---

## 11 · Rollout

This document is the spec. The actual rollout is staged:

1. **Foundations** *(this commit)*: tokens in `globals.css`, fonts in `layout.tsx`, utility classes (`shadow-clay`, `shadow-clay-pressed`, `font-display`, `text-pop`, `text-sage`).
2. **Page-by-page**: home → milestones → settings → splash → onboarding → public share → auth pages.
3. **Polish**: confetti, sticker mascots, micro-celebrations.

Each page gets its own PR so you can review the visual diff incrementally.
