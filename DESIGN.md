# The RIVA Company — Design System

> Single source of truth for visual identity, typography, color, layout and voice.
> Paste or upload this file into any AI tool (web builder, CRM, email designer, deck creator) and ask it to "follow the rules in DESIGN.md".

---

## 1. Brand essence

**Name:** The RIVA Company
**Sub-brands:** RIVA Spain (100% European White Oak) · TIERRA (nature-inspired engineered hardwood)
**Mission:** *"We exist to elevate lifestyle, wellbeing and relationships by providing people a luxurious connection to nature."*
**Values:** Boldness (unwavering confidence) · Quality (mastering excellence)
**Positioning:** Premium / luxury engineered hardwood flooring. 80+ years of craftsmanship. Residential and commercial.
**Brand personality:** Elegant, restrained, confident, natural, timeless, architectural, never loud.

---

## 2. Color palette

The palette is intentionally narrow. Black and off-white carry the brand; warm wood and natural tones appear through photography and accents — not as UI fills.

### Primary

| Token | Hex | Use |
|---|---|---|
| `--riva-black` | `#0A0A0A` | Hero backgrounds, logo lockup background, footer, primary text on light |
| `--riva-ivory` | `#F4F1EC` | Default page background (warm off-white, never pure white) |
| `--riva-white` | `#FFFFFF` | Cards, modals, contrast surfaces |

### Neutrals (text, borders, dividers)

| Token | Hex | Use |
|---|---|---|
| `--neutral-900` | `#1A1A1A` | Primary body text on light backgrounds |
| `--neutral-700` | `#4A4A4A` | Secondary text, captions |
| `--neutral-500` | `#8C8780` | Muted text, placeholder, metadata |
| `--neutral-300` | `#D8D4CD` | Borders, dividers, disabled |
| `--neutral-100` | `#EDEAE4` | Hover backgrounds, subtle fills |

### Wood / nature accents (use sparingly — mainly through imagery)

| Token | Hex | Use |
|---|---|---|
| `--oak-light` | `#D9C4A3` | Light oak — RIVA Spain accents |
| `--oak-mid` | `#B08A5C` | Mid oak — section dividers, icon fills |
| `--cove-dark` | `#5C3A20` | TIERRA "Cove" — deep brown, hover states on dark CTAs |
| `--sage` | `#9AA08A` | Subtle nature accent for tags/badges |
| `--stone` | `#C9C2B8` | Background variation, image overlays |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `--success` | `#5A7A4F` | Confirmation (kept earthy, not bright green) |
| `--warning` | `#B07A2C` | Caution (aligns with oak palette) |
| `--error` | `#8C3A2E` | Errors (terracotta, not red) |

### Rules

- Never use pure `#FFFFFF` as page background — always `--riva-ivory`.
- Never use saturated/neon colors. If a color doesn't appear in nature or in wood grain, it doesn't belong.
- Black + ivory should cover ~85% of any surface. Wood tones come from photography.
- Gradients are avoided. If unavoidable, use a 2-stop neutral fade only (e.g. `--riva-black` → 80% black overlay on images).

---

## 3. Typography

### Font stack

**Display / Logo / Headlines** — geometric thin sans-serif with wide tracking
```
font-family: "Avenir Next", "Futura", "Century Gothic", "Quicksand", system-ui, sans-serif;
```
Free alternative: **Jost** or **Quicksand** (Google Fonts).

**Body** — clean humanist sans-serif
```
font-family: "Inter", "Söhne", "Helvetica Neue", system-ui, -apple-system, sans-serif;
```

**Section labels / eyebrows** — bold condensed sans-serif (used in benchmark PDF for section titles like "MAIN MENU", "PRODUCTS")
```
font-family: "Bebas Neue", "Oswald", "Impact", sans-serif;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### Hierarchy

| Role | Size (desktop) | Weight | Tracking | Case |
|---|---|---|---|---|
| Logo wordmark | — | 300 (Light) | `0.25em` | UPPERCASE |
| H1 / Hero | 56–72px | 300 (Light) | `0.08em` | UPPERCASE or Title Case |
| H2 / Section title | 36–44px | 300–400 | `0.06em` | Title Case |
| H3 / Subsection | 24–28px | 400 | `0.04em` | Title Case |
| Eyebrow / Label | 12–14px | 700 | `0.15em` | UPPERCASE |
| Body large | 18px | 400 | normal | Sentence case |
| Body | 16px | 400 | normal | Sentence case |
| Caption | 13px | 400 | `0.02em` | Sentence case |
| Button | 13–14px | 500 | `0.15em` | UPPERCASE |

### Rules

- Headlines are **thin and airy**, never bold. The weight comes from spacing, not strokes.
- Always use generous **letter-spacing** on uppercase elements (`0.05em` minimum).
- Line-height: `1.2` for headlines, `1.6` for body.
- Maximum body line length: **70 characters** (`max-width: 65ch`).
- Never use italics for emphasis — use spacing, color, or weight instead.

---

## 4. Logo

- **Primary:** White wordmark on `--riva-black` background. The logo is "THE / RIVA / COMPANY" stacked, with "THE" and "COMPANY" small and wide-tracked, "RIVA" large and tracked.
- **Reverse:** Black wordmark on `--riva-ivory`.
- **Clear space:** Minimum padding around the logo equals the height of the "R" in RIVA.
- **Minimum size:** 80px wide on screen, 25mm on print.
- **Never:** rotate, recolor (other than B/W), add effects, place on busy imagery without a black overlay, stretch.

---

## 5. Layout & spacing

### Grid
- 12-column grid, 1440px max content width, 96–120px outer padding on desktop.
- Mobile: single column, 24px outer padding.

### Spacing scale (8pt base)
`4, 8, 16, 24, 32, 48, 64, 96, 128, 192` — use these only, no arbitrary values.

### Whitespace
- The brand breathes. Section vertical padding: minimum `96px` desktop, `64px` mobile.
- Components have more padding than feels necessary — favor air over density.

### Imagery placement
- Full-bleed hero images with **dark gradient overlay** at the bottom for legibility of overlaid text.
- Image captions sit below the image, left-aligned, in caption type.
- Image grids: 2 or 3 columns max. Never more than 3 across.

### Corner radii
- `0px` (sharp) — default for cards, buttons, inputs. The brand is architectural.
- `2px` — acceptable for very small chips/badges.
- **No rounded corners** above 4px. No pill buttons.

### Shadows
- Avoid drop shadows. If absolutely necessary: `0 1px 2px rgba(0,0,0,0.04)` — barely visible.
- Depth is communicated through whitespace and contrast, not shadow.

---

## 6. Components

### Buttons

**Primary (dark)**
```css
background: var(--riva-black);
color: var(--riva-ivory);
padding: 16px 32px;
font-size: 13px;
font-weight: 500;
letter-spacing: 0.15em;
text-transform: uppercase;
border: none;
border-radius: 0;
transition: background 0.3s ease;
/* hover */
background: var(--cove-dark);
```

**Secondary (outline)**
```css
background: transparent;
color: var(--riva-black);
border: 1px solid var(--riva-black);
/* same padding & type as primary */
/* hover */
background: var(--riva-black);
color: var(--riva-ivory);
```

**Tertiary / Text link**
```css
color: var(--riva-black);
border-bottom: 1px solid var(--riva-black);
padding-bottom: 2px;
text-transform: uppercase;
letter-spacing: 0.15em;
font-size: 12px;
```

CTAs always uppercase. Common labels: `EXPLORE COLLECTIONS`, `GET IN TOUCH`, `BOOK APPOINTMENT`, `DOWNLOAD CATALOG`, `LEARN MORE`.

### Navigation

- Horizontal top nav, transparent over hero, solid `--riva-ivory` on scroll.
- Logo left, links center or right, contact + search + language switch far right.
- Links: 13px uppercase, `0.1em` letter-spacing, neutral-900.
- Active state: thin 1px underline directly under text.
- Submenus reveal as a second horizontal bar below the main nav (Hakwood pattern from benchmark).

### Cards (product / project)

- Image fills the top of the card edge-to-edge, no border-radius.
- Title below image, centered or left-aligned, in H3 type.
- Optional caption underneath in caption type, neutral-500.
- No card border, no shadow. The image itself is the card.

### Forms

- Underline-only inputs (no boxed inputs). 1px bottom border in `--neutral-300`, becomes `--riva-black` on focus.
- Labels above inputs, 12px uppercase, `0.1em` letter-spacing, neutral-700.
- Submit buttons follow primary button styling.

### Tags / Badges

- 11–12px uppercase, `0.12em` letter-spacing.
- Transparent background, 1px border in `--neutral-500`, or filled `--neutral-100`.
- Used for: collection name, finish type, room type, location.

---

## 7. Imagery direction

**Do:**
- Natural light, soft shadows, warm tones.
- Wood-floor close-ups showing grain and finish.
- Architectural interiors — high ceilings, neutral furniture, lots of natural light.
- Landscapes that connect to the TIERRA element themes: water, mountain, earth, desert.
- Hands working wood (craftsmanship moments).
- People are present but rarely the focus — they're in motion or partially out of frame.

**Don't:**
- Bright/saturated photography, hard flash, posed marketing stock.
- Mixed warm/cool color temperatures in the same composition.
- Logos or text overlaid on busy parts of an image.

**Treatment:** Slight desaturation, warm white balance, contrast on the lower end (no crushed blacks).

---

## 8. Voice & messaging

**Tone:** Quiet confidence. Architectural. Closer to a fine watchmaker than a retail brand.

**Sentence length:** Short. Two short sentences beat one long one.

**Vocabulary signals:**
- Yes: craftsmanship, heirloom, character, presence, refined, grounded, considered, timeless, layered, serene.
- No: amazing, super, premium-quality (it's implied), best-in-class, cutting-edge, game-changing, exclusive offer.

**Headline pattern (from benchmark):**
- Two-word concept + descriptor: *"Boldness — Unwavering Confidence"*, *"Quality — Mastering Excellence"*.
- Triplets of single-word descriptors: *"Luminous | Serene | Refined"*.
- Direct product callouts: *"Cove — Calm presence and understated strength."*

**Calls to action:** Always uppercase, 1–3 words. `EXPLORE COLLECTIONS`, `VIEW PROJECT`, `GET IN TOUCH`, `FIND A SHOWROOM`.

---

## 9. Application examples

### Web hero
Full-bleed nature/interior photo · dark gradient overlay bottom-third · thin uppercase wordmark or H1 in white · single primary CTA · pagination dots bottom-right.

### Email
`--riva-ivory` background · centered 600px container · logo top center on black band · single hero image · short H2 + 2-line body · single CTA button · footer with address in caption type, neutral-500.

### Product card (CRM / catalog)
Square wood-finish photo · finish name in H3 (e.g. "Cove") · one-line descriptor in body small · 3 micro-tags below (e.g. `EUROPEAN OAK` · `WIDE PLANK` · `MATTE`).

### One-pager / PDF
`--riva-ivory` page · bold condensed section labels in top-left (like the benchmark PDF: "MAIN MENU", "PRODUCTS") · generous margins (min 30mm) · imagery dominates, text supports.

---

## 10. How to use this file

### A. With an AI website / landing-page builder
Paste this entire file into the project's system prompt or "brand guidelines" field, then prompt:
> "Build a [landing page / product page / contact page] for The RIVA Company. Strictly follow DESIGN.md for color, typography, spacing, and voice. Use placeholder imagery that matches the imagery direction in §7."

### B. With a CRM (HubSpot, Salesforce, Pipedrive)
Use the values in §2 and §3 to configure the email template theme:
- Background color → `--riva-ivory` (`#F4F1EC`)
- Primary brand color → `--riva-black` (`#0A0A0A`)
- Body font → Inter
- Heading font → Jost / Avenir Next
- Button styling → use the Primary button spec in §6
Then paste §8 (voice) into the "tone of voice" or AI-assistant configuration field.

### C. With a design tool that has AI (Figma AI, Framer AI, Canva Magic, Webflow AI)
Upload this file as a knowledge source. Prompt:
> "Apply the RIVA design system from DESIGN.md to this [page / template / asset]. Replace any existing color, type, and spacing with the tokens defined in the file."

### D. With Claude / GPT for marketing copy or pages
Open a new chat, attach this file, and start with:
> "You are writing for The RIVA Company. Follow DESIGN.md §8 for voice and §6 for any UI copy. Output: [what you need]."

### E. As a developer reference
The CSS variables in §2 and the type scale in §3 can be dropped straight into a `:root {}` block. The component patterns in §6 are written in copy-paste-ready CSS.

### F. Keeping it current
Treat DESIGN.md as the source of truth. If a decision is made (new accent color, a new sub-brand, a tagline change), update this file first — then push the change to web, CRM, and templates. Avoid "design drift" by making this the only place those values live.

---

## 11. Quick checklist before shipping any asset

- [ ] Background is `--riva-ivory` or `--riva-black`, never pure white.
- [ ] Headlines are thin (300 weight) with wide letter-spacing.
- [ ] No rounded corners above 4px. No drop shadows.
- [ ] All CTAs are uppercase with `0.15em` letter-spacing.
- [ ] Imagery is warm, natural-light, no flash, no neon.
- [ ] Copy reads like a fine-watch ad, not a retail flyer.
- [ ] Logo has clear space ≥ the height of its "R".
- [ ] Section vertical padding ≥ 96px desktop.
- [ ] Color palette stays inside the tokens above — no off-token hex codes.
