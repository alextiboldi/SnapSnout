# PetVault — iOS Implementation Plan

**"Baby Pics, but for pets"**
Shareable milestone cards + age tracking + photo timeline for puppies, rescues, and every pet in between.

**Build Timeline:** 7 days (~7-8 hours/day, ~52 hours total)
**Platform:** iOS 17+ (iPhone only for MVP, iPad later)
**Target:** App Store launch by end of Day 7

---

## 1. Tech Stack & Architecture Decisions

### Why Native Swift / SwiftUI

SwiftUI is the right call for this app. The entire product is about beautiful, fluid UI — the age counter animating, milestone cards rendering to images, smooth photo galleries, widgets. React Native or Flutter would add friction to every one of those interactions. SwiftUI also gives native access to WidgetKit, CloudKit, StoreKit 2, and the photo picker without bridging layers.

Target iOS 17+ minimum. This drops ~5% of active iPhones but unlocks SwiftData (replacing Core Data boilerplate), the new Observable macro, interactive widgets, and StoreKit 2's modern subscription APIs. The audience for this app skews young and tech-forward — they're on current iOS.

### Data Layer: SwiftData + CloudKit

SwiftData is the persistence layer. It replaces Core Data with a declarative, Swift-native API that works directly with SwiftUI. Models are defined as plain Swift classes with the @Model macro. Relationships, queries, and migrations are handled automatically for the scope of this MVP.

CloudKit handles sync. The key decision here is using CloudKit's automatic sync through NSPersistentCloudKitContainer (which SwiftData wraps). This means zero server infrastructure, zero ongoing cost, and automatic iCloud sync across the user's devices. Pet profiles, milestones, and photo metadata sync silently. Photos themselves are stored as CloudKit assets (CKAsset), which Apple hosts for free within the user's iCloud storage quota.

This architecture means: no backend to build, no server to maintain, no database to manage, no authentication system to implement. Apple handles all of it through the user's Apple ID. For a 7-day build, this is critical.

### Project Structure

Organize the Xcode project into five main groups:

- **Models** — SwiftData model definitions (Pet, Milestone, Photo)
- **Views** — SwiftUI screens organized by feature (Home, Timeline, Cards, Photos, Settings)
- **ViewModels** — Observable classes that bridge models to views
- **Services** — Notification scheduling, image rendering, StoreKit management
- **Resources** — Card templates, milestone databases, asset catalogs

Use the MVVM pattern loosely. Don't over-architect — this is a 7-day build. ViewModels where state logic gets complex (card rendering, milestone scheduling), direct @Query bindings to SwiftData where it's simple (pet list, photo gallery).

---

## 2. Data Models

### Pet

The Pet model is the root entity. It stores:

- **name** (String) — the pet's display name
- **species** (enum: dog, cat) — determines which milestone set loads
- **lifestage** (enum: puppy, kitten, adult, senior) — determines onboarding path and milestone set
- **breedName** (String, optional) — display name of breed
- **breedSize** (enum: small, medium, large, giant) — affects milestone timing for puppies
- **dateOfBirth** (Date, optional) — known for puppies/breeders, often unknown for rescues
- **gotchaDay** (Date) — the day the pet came home; always required; serves as the anchor date for rescue/adult milestones
- **photoData** (Data, optional) — the pet's profile photo stored as compressed JPEG data
- **createdAt** (Date) — when the profile was created in the app

The Pet has a one-to-many relationship with Milestone and Photo.

The age display logic works as follows: if dateOfBirth is set, show "X years, X months, X days old." If only gotchaDay is set, show "X months, X days in forever home." If both are set, show age from DOB as primary and "Home for X months" as secondary. This dual-date system is what makes the app work for both puppies and rescues without separate flows.

### Milestone

The Milestone model represents both auto-generated and custom milestones:

- **title** (String) — display title like "First Bath 🛁"
- **descriptionText** (String) — subtitle like "Splashy introduction to grooming"
- **anchorType** (enum: fromDOB, fromGotchaDay, manual) — what date the milestone is relative to
- **targetOffset** (TimeInterval, optional) — number of seconds from the anchor date when this milestone is expected (e.g., 6 months = 15,778,800 seconds). Nil for manual/custom milestones.
- **targetDate** (Date, computed) — calculated from anchor date + offset, or manually set
- **completedDate** (Date, optional) — when the user marked it complete; nil means upcoming
- **photoData** (Data, optional) — photo attached when completing the milestone
- **notes** (String, optional) — user's notes about the milestone
- **isCustom** (Bool) — whether the user created this milestone
- **isShareable** (Bool) — whether this milestone type generates a shareable card
- **sortOrder** (Int) — for ordering in the timeline

The Milestone belongs to a Pet.

When a new Pet is created, the app auto-generates milestones from the appropriate preset list (puppy, adult dog, senior dog, kitten, or adult cat) and calculates target dates based on the pet's DOB or gotcha day and breed size. This happens synchronously during the "Add Pet" flow — the user sees their populated timeline immediately.

### Photo

The Photo model stores the photo timeline entries:

- **imageData** (Data) — compressed JPEG data
- **capturedDate** (Date) — when the photo was taken or added
- **caption** (String, optional) — user-added caption
- **isMonthlyPhoto** (Bool) — whether this was prompted by the monthly photo reminder
- **monthNumber** (Int, optional) — which month this corresponds to (for monthly growth tracking)

The Photo belongs to a Pet and optionally links to a Milestone.

---

## 3. Screen-by-Screen Specification

### 3.1 Onboarding Flow (3 screens)

Shown only on first launch. Three full-screen pages with a page indicator at the bottom and a "Get Started" button on the last page.

**Screen 1 — "Every moment matters"**
Hero illustration or animation of a pet age counter ticking up. Brief text: "Track your pet's age, milestones, and growth — beautifully." Focus on the emotional hook.

**Screen 2 — "Share the love"**
Example of a shareable milestone card. Text: "Create gorgeous milestone cards to share on Instagram, Stories, and more." Show the card being "shared" with a subtle animation.

**Screen 3 — "Let's meet your pet"**
Transitions directly into the Add Pet flow. Text: "Tell us about your pet to get started." Button: "Add My Pet."

### 3.2 Add Pet Flow

This is a multi-step sheet (presented modally) with 3-4 steps. Progress indicator at top.

**Step 1 — Name & Photo**
Large circular photo placeholder at top (tap to add from camera or library). Text field below for pet's name. This step should feel personal and warm immediately.

**Step 2 — Species & Lifestage**
Two large toggle cards: Dog or Cat. Below that, a segmented control or toggle cards for lifestage. For dogs: "Puppy (under 1 year)" / "Adult" / "Senior (7+ years)." For cats: "Kitten (under 1 year)" / "Adult" / "Senior (11+ years)."

This is the critical fork. The selection here determines which milestone set loads and which dates are required in the next step.

**Step 3 — Breed & Dates**
Breed picker: searchable list of the top 50 most popular breeds for the selected species, grouped by size (small, medium, large, giant for dogs). Include a "Mixed / Unknown" option that asks the user to estimate size. The breed selection determines breedSize, which adjusts puppy milestone timing.

Date fields change based on lifestage:
- **Puppy/Kitten path:** "Date of Birth" (required) + "Gotcha Day" (optional, defaults to today if blank). Most puppy buyers know the exact DOB from the breeder.
- **Adult/Senior path:** "Gotcha Day / Adoption Date" (required) + "Date of Birth" (optional, with helper text "Don't know? That's okay!"). The gotcha day is the anchor.

**Step 4 — Confirmation**
Show the pet's profile card as it will appear: photo, name, age (calculated live), and a preview of the first few upcoming milestones. "Looks great!" button saves and navigates to the home screen.

### 3.3 Home Screen (Tab 1: "Home")

This is the hero screen. It must be beautiful enough to screenshot on its own.

**Layout:**
- Top: pet's profile photo (large circle, ~120pt diameter), centered
- Below photo: pet's name in large, elegant serif font
- Below name: live age counter in a slightly smaller weight. Format depends on what dates are available (see age display logic in Data Models). The age should feel alive — if someone stares at it long enough, the "days" number ticks up at midnight.
- Below age counter: a secondary line for rescue pets showing "Home for X months, X days" if both DOB and gotcha day are set
- Divider
- "Next Milestone" card: a rounded rectangle showing the next upcoming milestone's emoji + title + "in X days" countdown. Tapping it navigates to the milestone detail. If the milestone is today, the card should be celebratory (confetti accent, "TODAY!" badge).
- Below: "Recent Milestones" section showing the last 2-3 completed milestones as small horizontal cards with thumbnail photos.
- If multiple pets exist: a horizontal pet switcher at the very top (row of circular avatars, tappable to switch). The active pet has a subtle ring/highlight.

**Key interaction:** Pull-to-refresh is not needed (data is local). The screen should feel static and serene, like a beautiful portrait of your pet, not a busy dashboard.

### 3.4 Milestone Timeline (Tab 2: "Milestones")

A vertical scrollable timeline. This is where all milestones live — upcoming and completed.

**Layout:**
- Top: pet's name + a small age badge
- "Add Milestone" button (floating or in the top-right nav bar)
- Timeline: a continuous vertical line on the left side (thin, colored line). Each milestone is a card branching off the line.

**Milestone states:**

*Upcoming milestones:* Grayed out slightly. Show title, description, and expected date ("Expected: March 15"). A subtle countdown ("in 12 days"). Not tappable for completion yet — but user can tap to "Complete Early" if the milestone happened ahead of schedule.

*Today's milestones:* Highlighted with accent color. Pulsing dot on the timeline. Prominent "Complete This Milestone" button. This is the moment that matters — the user taps, adds a photo, and creates a shareable card.

*Completed milestones:* Full color. Show the photo thumbnail, completion date, and a small "Share" button to regenerate the card. Tapping opens the milestone detail.

**Milestone Detail Sheet (modal):**
- Full photo (or camera prompt if no photo yet)
- Milestone title and description
- Date completed (editable)
- Notes text field
- "Create Shareable Card" button (the primary CTA, prominent)
- "Delete Milestone" (destructive, at bottom)

**Add Custom Milestone Sheet:**
- Emoji picker (grid of common emojis, or type-to-search)
- Title text field
- Description text field (optional)
- Date (optional — if blank, milestone goes to "anytime" section)
- Toggle: "Make this shareable" (default on)

### 3.5 Shareable Card Creator (Sheet/Modal)

This is the most important screen in the entire app. It's triggered from completing a milestone or tapping "Create Card" on a completed milestone.

**Flow:**

1. **Photo selection:** If the milestone already has a photo, it's pre-loaded. If not, prompt camera/library picker. The photo is the background or hero element of the card.

2. **Template picker:** Horizontal scrollable row of template thumbnails at the bottom of the screen. Each thumbnail is a live mini-preview of how the card will look with the user's photo and milestone text. Free templates are selectable; premium templates show a small lock icon and tapping them triggers the paywall.

3. **Live preview:** The main area of the screen shows a full-size preview of the card as it will be exported. It updates live as the user swipes between templates.

4. **Aspect ratio toggle:** A small toggle or segmented control: "Stories (9:16)" or "Post (1:1)". Changing this adjusts the preview and export dimensions.

5. **Export:** A large "Share" button at the bottom. Tapping it renders the card to a high-resolution image and opens the iOS share sheet (UIActivityViewController). The user can then share directly to Instagram, Messages, save to camera roll, AirDrop, etc.

**Template Specifications (5 templates for MVP):**

*Template 1 — "Clean":* White background. Pet photo in a large circle centered in the upper third. Milestone title below in black serif font. Age and date in smaller gray text below that. Minimal, elegant, Apple-esque. Free.

*Template 2 — "Playful":* Colored background (soft blue, pink, or green based on a palette). Pet photo in a rounded rectangle with a playful border/pattern. Milestone title in a rounded, friendly sans-serif font. Confetti or star decorations in corners. Free.

*Template 3 — "Bold":* Dark background (near-black or deep navy). Pet photo large, edge-to-edge or with a dramatic crop. Milestone title in large, all-caps bold sans-serif. Age in accent color. High contrast, striking, modern. Free.

*Template 4 — "Vintage":* Muted warm tones (cream, sage, dusty rose). Pet photo with a subtle film grain overlay and rounded corners. Milestone title in a classic serif or script font. Date formatted in a nostalgic style ("March 15, 2026"). Soft vignette effect. Premium.

*Template 5 — "Pastel":* Soft gradient background (lavender to pink, or mint to sky). Pet photo in a soft-edged frame. Handwritten-style font for milestone title. Dreamy, airy, Instagram-aesthetic. Premium.

All templates include a subtle "PetVault" watermark in the bottom corner. For premium users, this can be toggled off.

**Image Rendering:**
Cards are rendered programmatically using SwiftUI views converted to UIImage via ImageRenderer (iOS 16+). Each template is a SwiftUI view that takes the pet's photo, milestone title, age text, date, and app branding as inputs. The view is rendered at 2x or 3x resolution for crisp exports. Stories format renders at 1080×1920 pixels. Post format renders at 1080×1080 pixels.

### 3.6 Photo Timeline (Tab 3: "Photos")

A chronological photo gallery of all photos associated with the pet — milestone photos and standalone monthly photos.

**Layout:**
- Top: toggle between "Grid" view (3-column photo grid, like Instagram) and "Timeline" view (vertical scroll with larger photos and dates/captions)
- Photos are sorted newest-first by default
- Each photo shows a small date badge overlay in the corner
- Tapping a photo opens a full-screen viewer with caption, date, and the milestone it's linked to (if any)

**Growth Comparison Feature:**
- A "Compare" button in the nav bar
- Tapping it enters comparison mode: user taps two photos to select them
- The app shows them side-by-side with age labels below each ("8 weeks" vs. "6 months")
- A "Create Comparison Card" button generates a shareable side-by-side image using the same template system (this is also a premium feature)

**Monthly Photo Prompt:**
On the monthly anniversary of the gotcha day (or DOB), the app creates an auto-milestone titled "Month X Photo" and sends a push notification. When the user opens the app, the timeline shows this milestone as "awaiting photo." This creates a recurring engagement loop and builds a beautiful month-by-month growth series over time.

### 3.7 Settings / Profile (Tab 4)

- **Pet Management:** List of all pets. Tap to edit profile, change photo, update dates. "Add Another Pet" button (triggers paywall if free user already has 1 pet).
- **Notifications:** Toggle milestone reminders, monthly photo reminders, birthday countdown. Individual on/off controls.
- **Subscription:** Current plan display. "Upgrade to Premium" button (or "Manage Subscription" if already premium).
- **About:** App version, privacy policy link, terms link, "Rate on App Store" link, "Contact Support" email link.
- **Data:** "Export All Data" (future v2 feature placeholder). "Delete Pet" with confirmation.

---

## 4. Milestone Engine — Detailed Logic

### Preset Milestone Sets

The app ships with 5 hardcoded milestone sets stored as arrays of structs in Swift. Each preset milestone has: title, description, emoji, anchor type (DOB or gotcha day), offset (time interval), and a shareable flag.

**Puppy milestones (17):** Gotcha Day, First Car Ride, First Vet Visit, First Bath, First Toy Destroyed, First Walk Outside, 2nd Vaccinations, First Puppy Class, 4 Months Old, Lost First Baby Tooth, First Dog Park, Half Birthday, All Adult Teeth, Reached Full Height, First Birthday, Switched to Adult Food, Fully Mature.

**Adult Dog milestones (12):** Gotcha Day, First Car Ride Home, First Nap in New Bed, One Week Home, First Vet Check, First Tail Wag at You, 3-3-3 Rule: 3 Weeks, One Month Home, 3-3-3 Rule: 3 Months, Half-Year Adoptiversary, One Year Adoptiversary, Another Year Together.

**Senior Dog milestones (10):** Gotcha Day, One Week Home, One Month Home, 3-3-3 Rule: 3 Months, Half-Year Adoptiversary, Gray Muzzle Photoshoot, Still Got It!, Best Nap Ever, One Year Adoptiversary, Birthday Celebration.

**Kitten milestones (8):** Gotcha Day, First Purr, First Vet Visit, First Zoomies, Litter Box Pro, First Lost Baby Tooth, Half Birthday, First Birthday.

**Adult Cat milestones (9):** Gotcha Day, Came Out of Hiding, One Week Home, First Head Bump, 3-3-3 Rule: 3 Weeks, One Month Home, 3-3-3 Rule: 3 Months, Half-Year Adoptiversary, One Year Adoptiversary.

### Milestone Date Calculation

When a pet is created, the milestone engine iterates through the appropriate preset list and creates Milestone objects with calculated target dates.

For **DOB-anchored milestones** (puppy/kitten developmental milestones): targetDate = pet.dateOfBirth + milestone.offset. The offset is adjusted by breed size for certain milestones. For example, "Reached Full Height" is 8 months for small breeds, 12 months for medium, 16 months for large, and 20 months for giant breeds. "Fully Mature" is 12 months for small, 15 months for medium, 18 months for large, 24 months for giant.

For **Gotcha Day-anchored milestones** (adoption/rescue milestones): targetDate = pet.gotchaDay + milestone.offset. These offsets are fixed regardless of breed size (3 days, 3 weeks, 3 months, etc.).

For **recurring milestones** (adoptiversaries, birthdays): The engine creates the first occurrence and the app dynamically shows the next upcoming anniversary. After the first year, the "Another Year Together" milestone repeats annually. This is handled by checking the current date against the anniversary date, not by creating infinite future milestones.

For **"anytime" milestones** (Gray Muzzle Photoshoot, Still Got It, Best Nap Ever): These have no target date and sit in a separate "Anytime" section at the bottom of the timeline, always available for the user to complete whenever they want.

### Custom Milestones

Custom milestones are stored identically to preset milestones but with isCustom = true. They can have a target date (user-set) or be "anytime" milestones. Custom milestones always have isShareable = true so the user can create cards from them.

---

## 5. Notification Strategy

### Notification Types & Timing

All notifications are scheduled locally using UNUserNotificationRequest. No push notification server is needed.

**Milestone Reminders:**
- 1 day before the target date, at 9:00 AM local time: "Luna's first birthday is tomorrow! 🎂 Get the camera ready!"
- On the target date, at 9:00 AM: "Today's the day! Luna turns 1 year old! 🎉 Open PetVault to capture this milestone."
- Notifications are only scheduled for upcoming milestones within the next 60 days (to stay within iOS's 64 pending notification limit).

**Monthly Photo Reminders:**
- On the monthly anniversary of DOB or gotcha day, at 10:00 AM: "Luna is 5 months old today! 📸 Time for her monthly photo."
- These are rescheduled each time the app opens (rolling 3-month window).

**Birthday / Adoptiversary Countdown:**
- 7 days before: "Luna's birthday is one week away! 🎈"
- 1 day before: "Tomorrow is Luna's birthday! 🎂"
- Day of: "Happy Birthday, Luna! 🎉🐾 She's 2 years old today!"
- Same pattern for adoptiversary with adjusted copy.

**3-3-3 Rule Reminders (rescue/adult path only):**
- Day 3: "Luna's been home for 3 days! She's starting to decompress. 💕"
- Week 3: "3 weeks home! Luna is starting to show her real personality. ✨"
- Month 3: "3 months! Luna is fully settled in. This is home now. 🧡"

### Notification Copy Principles

Every notification is warm and encouraging. Never generic ("You have a milestone"). Always personalized with the pet's name. Always includes an emoji. The tone varies subtly by path — puppy notifications are excited and playful, rescue/adult notifications are gentler and more sentimental.

### Re-scheduling Logic

Notifications are cleared and rescheduled every time the app launches and every time a milestone is completed (since completing a milestone removes its notification and the "next milestone" changes). The scheduling service calculates all notifications for all pets and batches them within the 64-notification iOS limit, prioritizing the nearest upcoming milestones.

---

## 6. Widget Specification

### Small Widget (WidgetFamily.systemSmall)

Displays the pet's profile photo as a circular image centered in the widget, with the pet's name below it and the age underneath. Clean, minimal — functions as a beautiful pet portrait with live age.

Tapping the widget opens the app to the home screen.

### Medium Widget (WidgetFamily.systemMedium)

Left side: pet's profile photo (circular) with name and age below. Right side: next upcoming milestone title, emoji, and "in X days" countdown. If the milestone is today, the right side shows "TODAY! 🎉" with celebratory styling.

Tapping the widget opens the app to the milestone timeline.

### Lock Screen Widget (WidgetFamily.accessoryCircular)

Pet's profile photo cropped to a circle. Displayed as a circular lock screen widget. Tapping opens the app.

### Lock Screen Widget (WidgetFamily.accessoryRectangular)

Pet's name, age, and next milestone in a compact rectangular format for the lock screen. Example: "Luna · 6mo · First birthday in 183d"

### Widget Data Flow

Widgets use a WidgetKit TimelineProvider that reads from a shared App Group container. The main app writes the current pet's data (name, photo, age, next milestone) to a shared UserDefaults suite whenever data changes. The widget reads from this shared container. Widget timelines are set to refresh at midnight (when the age counter ticks over) and at the next milestone's target date.

If the user has multiple pets, the widget configuration allows selecting which pet to display via an IntentConfiguration / AppIntentConfiguration.

---

## 7. Subscription & Paywall (StoreKit 2)

### Product IDs

Two subscription products registered in App Store Connect:

- **petvault.premium.monthly** — $2.99/month, auto-renewable
- **petvault.premium.annual** — $24.99/year, auto-renewable (save 30%, displayed prominently)

### Free Tier Limits

- 1 pet profile
- 3 card templates (Clean, Playful, Bold)
- 50 photos in the photo timeline
- Shareable cards include a small "Made with PetVault" watermark
- All milestones (preset + custom) available
- All notifications available
- Widgets available

### Premium Unlocks

- Unlimited pet profiles
- All card templates (including Vintage, Pastel, and future seasonal packs)
- Unlimited photos
- Watermark removal toggle
- Growth comparison cards
- Priority access to new templates
- Early access to v2 health features

### Paywall Design

The paywall is a modal sheet triggered when the user interacts with a premium-locked feature (tapping a locked template, trying to add a second pet, reaching 50 photos). It should not interrupt the core flow — the user has already experienced the value before seeing the paywall.

Layout of the paywall sheet:
- Top: "Unlock PetVault Premium" heading
- Feature comparison list showing what's included
- Two pricing cards side by side: Monthly ($2.99/mo) and Annual ($24.99/yr with "Save 30%" badge). Annual is visually emphasized as the recommended option.
- "Start Free Trial" or "Subscribe" button (if Apple approves a 7-day trial)
- "Restore Purchases" link at the bottom
- Small legal text: subscription terms, auto-renewal info, manage in Settings

### Subscription State Management

Use StoreKit 2's Transaction.currentEntitlements to check subscription status on app launch. Store the entitlement state in an EnvironmentObject accessible throughout the app. When subscription status changes (new purchase, expiry, renewal), update the state and adjust UI accordingly (unlock/lock templates, show/hide watermark toggle, enable/disable multi-pet).

---

## 8. CloudKit Sync Architecture

### Container Setup

Create a CloudKit container in Xcode (iCloud capability with CloudKit checked). Use the automatic NSPersistentCloudKitContainer integration that SwiftData provides. This requires zero manual CloudKit code — SwiftData handles record creation, sync, conflict resolution, and merge automatically.

### What Syncs

All SwiftData models (Pet, Milestone, Photo) sync automatically to the user's private CloudKit database. This means:

- A user who sets up PetVault on their iPhone will see all their data appear on their iPad (if they install the app later)
- Data survives app deletion and reinstallation (as long as iCloud data isn't explicitly cleared)
- Photos sync as CloudKit assets, which count against the user's iCloud storage quota

### Offline Behavior

The app is fully functional offline. All data is stored locally first via SwiftData. CloudKit sync happens opportunistically when a network connection is available. There's no loading spinner, no "connecting" state, no error when offline. The user may never know sync exists — it just works.

### Conflict Resolution

SwiftData's CloudKit integration uses last-writer-wins for conflict resolution. For this app, conflicts are extremely unlikely (single user, single device in most cases). If a user edits the same pet on two devices simultaneously (rare), the most recent edit wins. This is acceptable for MVP.

---

## 9. App Store Optimization (ASO)

### App Name & Subtitle

**Name:** PetVault — Pet Milestone Tracker
**Subtitle:** Age Counter, Photo Journal & Cards

### Keywords

Primary keywords (highest priority): puppy milestone, pet age tracker, dog birthday, pet photo journal, gotcha day, rescue dog tracker, adoptiversary, pet milestone cards

Secondary keywords: puppy tracker, kitten milestones, dog age, pet journal, pet memory book, 3-3-3 rule, pet birthday countdown, dog photo timeline

### Screenshots (6 required for 6.7" and 6.1")

1. Home screen with age counter — headline: "Track Every Precious Moment"
2. Milestone timeline — headline: "Milestones That Matter"
3. Shareable card example — headline: "Share Beautiful Milestone Cards"
4. Photo timeline with growth comparison — headline: "Watch Them Grow"
5. Widget on home screen — headline: "Your Pet, Always With You"
6. Multiple card templates — headline: "Gorgeous Templates for Every Style"

### Description

First sentence (most important — shown in search): "Track your pet's age, milestones, and growth with beautiful shareable milestone cards — perfect for puppies, rescues, and every pet in between."

Follow with feature bullets, social proof angle ("Join thousands of pet parents celebrating their pet's journey"), and a clear call-to-action.

### App Preview Video (optional but high-impact)

15-30 second screen recording: open app → see age counter → scroll milestones → complete a milestone → create a shareable card → share to Instagram. Fast, smooth, set to upbeat music. This single asset can dramatically improve conversion rate.

---

## 10. Day-by-Day Build Schedule

### Day 1: Project Setup + Data Model + Add Pet Flow (7 hours)

**Morning (3.5h):**
Set up the Xcode project with SwiftUI App lifecycle. Configure the iCloud capability with CloudKit container. Set up the App Group for widget data sharing. Create the SwiftData model container.

Define all three data models (Pet, Milestone, Photo) with their properties and relationships as specified in Section 2. Create the breed database — a static Swift file containing an array of breed structs (name, species, size category) for the top 50 dog breeds and top 25 cat breeds. Include "Mixed / Unknown" options for both species with manual size selection.

Build the age calculation utility: a function that takes an optional DOB and an optional gotcha day and returns formatted age strings for display. Handle edge cases: pet created today (show "Day 1"), very old pets (show years and months, not days), unknown DOB (show time since gotcha day only).

**Afternoon (3.5h):**
Build the Add Pet flow as a multi-step sheet: Step 1 (name + photo), Step 2 (species + lifestage), Step 3 (breed + dates), Step 4 (confirmation). Implement the photo picker using PhotosUI (PhotosPicker for library, camera access for direct capture). Connect the form to SwiftData — saving a Pet creates the object and persists it.

Build the milestone seeding function: when a Pet is saved, iterate through the correct preset milestone list for the pet's species + lifestage, calculate target dates using the pet's DOB/gotcha day + breed size offsets, and create Milestone objects linked to the Pet.

Test: create a puppy, verify milestones appear. Create an adult rescue dog, verify different milestones appear anchored to gotcha day. Create a kitten, verify cat milestones appear.

### Day 2: Home Screen + Milestone Timeline (8 hours)

**Morning (4h):**
Build the home screen as specified in Section 3.3. Start with the pet photo, name, and age counter. The age counter should update live — use a Timer that fires every 60 seconds to refresh the displayed age (or use TimelineView for smooth, system-efficient updates). Build the "Next Milestone" card component with countdown calculation.

Build the tab bar navigation: Home, Milestones, Photos, Settings. Use a TabView with SF Symbols for icons.

**Afternoon (4h):**
Build the milestone timeline view as specified in Section 3.4. Implement the vertical timeline layout — each milestone is a card along a continuous vertical line. Use a LazyVStack inside a ScrollView for performance.

Build milestone states: upcoming (grayed, with countdown), today (highlighted, with completion button), completed (full color, with photo thumbnail). Build the milestone detail sheet with photo attachment, notes, and completion flow.

Build the "Add Custom Milestone" sheet with emoji picker, title, description, and date fields.

Test: scroll through the full timeline for a puppy. Complete a milestone (mark it done, add photo). Add a custom milestone. Switch to an adult dog and verify different timeline content.

### Day 3: Shareable Milestone Cards — THE Critical Day (8 hours)

**This day makes or breaks the product. Every hour counts. Do not rush.**

**Morning (4h):**
Build the card rendering system. Each template is a SwiftUI view that accepts: pet photo (UIImage), milestone title (String), pet age (String), date (String), and app branding (Bool for watermark). The view is designed at a fixed size (1080×1920 for Stories, 1080×1080 for Post) and rendered to UIImage using ImageRenderer.

Build Template 1 (Clean) and Template 2 (Playful). For each template: design the layout precisely, choose fonts from the system font library (San Francisco Display, New York, or other built-in options — do NOT use custom fonts in MVP, they add complexity), set colors, position elements, handle the photo cropping/masking. Render to image and verify the output looks professional at full resolution.

**Afternoon (4h):**
Build Template 3 (Bold), Template 4 (Vintage), and Template 5 (Pastel). The Vintage template uses a CIFilter for the film grain effect (or a pre-made grain overlay image composited on top). The Pastel template uses a LinearGradient background.

Build the card creator screen: photo selection, horizontal template picker with live previews, aspect ratio toggle, and share button. Wire up UIActivityViewController for sharing.

Implement the watermark: a small "PetVault" text in the bottom-right corner, semi-transparent, using the app's brand font. Positioned to be visible but not intrusive.

Test extensively: create cards with different photos (portrait, landscape, square), different milestone titles (short and long), different templates, both aspect ratios. The cards must look polished at every combination. If any template looks off, fix it now. Do not move on until all 5 templates produce professional-quality output.

### Day 4: Photo Timeline + Comparison + CloudKit (7 hours)

**Morning (3.5h):**
Build the photo timeline view (Tab 3) as specified in Section 3.6. Implement the grid view (3 columns) and timeline view (single column with dates). Photos are pulled from a SwiftData @Query filtered by the current pet and sorted by date.

Build the monthly photo auto-milestone: when the app detects it's the monthly anniversary of the pet's gotcha day or DOB, and no photo exists for that month, create an "incomplete" milestone prompting the user to take a photo.

**Afternoon (3.5h):**
Build the growth comparison feature. In comparison mode, the user selects two photos. The app renders them side-by-side with age labels calculated from the photo's date relative to the pet's DOB/gotcha day. The comparison view uses the same ImageRenderer approach to export a shareable comparison image.

Verify CloudKit sync is working. Create a pet on one device (or simulator), wait for sync, verify it appears on a second device/simulator logged into the same iCloud account. Test: add a milestone photo on device A, verify it syncs to device B. CloudKit sync should work automatically through SwiftData's integration, but verify edge cases (large photos, slow connections, airplane mode → reconnect).

### Day 5: Notifications + Widgets (7 hours)

**Morning (3.5h):**
Build the notification scheduling service as specified in Section 5. Implement the scheduling logic: on app launch and after any data change, clear all pending notifications and reschedule based on current milestones across all pets. Respect the 64-notification limit by prioritizing nearest milestones.

Write all notification copy strings — every notification for every milestone type, personalized with the pet's name. Puppy path gets excited/playful copy. Rescue/adult path gets warm/sentimental copy. Test each notification type in the simulator.

**Afternoon (3.5h):**
Build the widget extension. Start with the small widget (simplest), then medium, then lock screen variants. Set up the shared App Group container for data sharing between the main app and widget. Write the TimelineProvider that refreshes at midnight and at the next milestone date.

Build widget configuration for multi-pet selection using AppIntentConfiguration (allows user to choose which pet displays in the widget).

Test: add the widget to home screen in simulator. Verify it shows correct pet data. Change the pet's data in the app, verify the widget updates (may require reloading the widget timeline).

### Day 6: Premium + Multi-Pet + Polish (8 hours)

**Morning (4h):**
Implement StoreKit 2 subscriptions. Register product IDs in App Store Connect (or use StoreKit Testing in Xcode for development). Build the subscription state manager that checks entitlements on launch. Build the paywall sheet as specified in Section 7.

Wire up premium gates throughout the app: lock card templates 4 and 5 with a subtle lock overlay, show paywall when tapping a locked template, gate the "Add Another Pet" button for free users, enforce the 50-photo limit with a gentle prompt to upgrade, add the watermark toggle in settings (premium only).

Build multi-pet support: pet switcher on the home screen (horizontal avatar row), ability to add additional pets (premium only), each pet maintains its own independent milestone timeline and photo gallery.

**Afternoon (4h):**
Polish pass across the entire app:
- Onboarding flow: build the 3 onboarding screens with illustrations/animations
- Empty states: when there are no milestones completed yet, no photos yet — show encouraging illustrations and text, not blank screens
- Haptic feedback: light haptic on milestone completion, medium haptic on card creation, success haptic on share
- Dark mode: verify every screen looks correct in dark mode; adjust colors where needed
- Dynamic Type: verify text scales correctly with accessibility text size settings
- Loading states: add skeleton views or subtle animations for any moment where data loads
- Error handling: graceful fallbacks for photo picker failures, CloudKit errors, StoreKit failures
- Animations: subtle transitions between screens, milestone completion celebration (confetti or particle effect using Canvas or a lightweight animation library)

### Day 7: Ship It (7 hours)

**Morning (3.5h):**
Create the App Store listing. Take 6 screenshots on the 6.7" simulator (iPhone 15 Pro Max) and 6.1" simulator (iPhone 15 Pro) using realistic test data — a pet with a cute name, completed milestones with real-looking photos, a beautiful card template on screen. Write the App Store description, keyword field, and promotional text.

Design the app icon: clean, recognizable paw print on a teal/emerald gradient background. Export at 1024×1024 for App Store Connect. Verify it reads well at small sizes (home screen, search results).

Create a simple privacy policy and terms of service. Host them on a free static site (GitHub Pages). The privacy policy should clearly state: data stored on-device and in iCloud, no third-party analytics in MVP, no data sharing, no account required.

**Afternoon (3.5h):**
Final testing pass: run through every flow on a real device (not just simulator). Test: create puppy, create adult rescue dog, create kitten. Complete milestones, create cards, share cards. Test notifications by advancing the simulator clock. Test widgets. Test the paywall and subscription flow using StoreKit Testing. Test offline behavior. Test deleting and reinstalling the app (verify iCloud restore).

Archive the build and upload to App Store Connect via Xcode. Fill in all App Store Connect metadata. Submit for review.

While waiting for review, prepare launch content:
- Create 5 sample milestone cards using the app with different templates — these are the marketing assets
- Draft Reddit posts for r/puppy101, r/dogs, r/cats, r/BeforeNAfterAdoption, r/rescuedogs
- Prepare a Product Hunt listing (ship page)
- Screen-record a 30-second demo video for TikTok and Instagram Reels
- Draft a launch tweet/thread

---

## 11. Post-Launch Roadmap

### V1.1 (Week 2-3): Quick Wins Based on Feedback

- Full AKC/TICA breed list (replace top-50 with complete list)
- Additional card templates based on user requests
- Bug fixes from initial user reports
- App Store review responses (critical for early ASO)

### V1.2 (Month 2): Health Layer — The Retention Play

- Vaccination log with next-due date reminders
- Medication tracker with push reminders
- Weight tracking chart over time
- One-tap PDF export of health summary for vet visits
- This is the feature set that keeps users opening the app after the exciting milestone phase slows down

### V1.3 (Month 3): Revenue Expansion

- Printed milestone book: partner with a print-on-demand service (Lulu, Blurb, or Prodigi API) to let users order a hardcover photo book of their pet's milestone journey for $39.99
- "Before & After" transformation card template (premium) — side-by-side rescue transformation, the most viral content format in pet social
- Seasonal card packs: Halloween, Christmas, Valentine's Day, National Dog Day templates
- Shelter/rescue partnership program: QR codes for shelters to give adopters that auto-create a pet profile

### V2.0 (Month 4-6): Growth Features

- Family sharing: invite family members to contribute photos and view the pet's timeline
- iPad app with larger layouts
- Apple Watch complications showing pet age
- Android version (if metrics justify)

---

## 12. Key Risks & Mitigations

**Risk: Card templates don't look professional enough.**
Mitigation: This is the single biggest risk. Allocate extra time on Day 3. If needed, borrow time from Day 4. Consider hiring a designer for the card templates specifically (even a quick Fiverr gig for 5 template layouts). The cards ARE the product.

**Risk: App Store review rejection.**
Mitigation: Common rejection reasons for this app type: subscription paywall not showing a "restore purchases" button (always include it), privacy policy not accessible (host it before submission), app functionality too thin for review (make sure the free tier is fully functional, not a stub). Submit Sunday night to hit the Monday review queue.

**Risk: CloudKit sync issues.**
Mitigation: Test on two real devices with the same iCloud account. If CloudKit sync proves unreliable during testing, fall back to local-only for MVP and add sync in v1.1. The app should work perfectly without sync — it's a nice-to-have, not a requirement.

**Risk: Low conversion rate on premium.**
Mitigation: The paywall trigger matters more than the paywall design. Ensure the trigger happens at the emotional peak (user just created their first card, wants the Vintage template). If conversion is below 3% after the first month, experiment with: a 7-day free trial, moving the paywall trigger earlier, or adding more differentiation between free and premium templates.

**Risk: Retention drops after the puppy phase.**
Mitigation: This is why the V1.2 health layer is critical. Monthly photo reminders, birthday countdowns, and adoptiversaries provide ongoing engagement hooks. The printed milestone book (V1.3) gives users a reason to keep the app installed even after active use declines — they'll want to order the book eventually.
