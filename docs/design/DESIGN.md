# Homepage Design: Engineering Field Notes

## Subject

Nguyen Thanh Tung is presented as an MEP and piping engineer who also builds knowledge systems and keeps a personal record through writing and photography.

## Audience

The homepage serves two audiences in balance:

- recruiters and technical collaborators receive the first, strongest signal;
- readers discover the Journal, Second Brain, and Gallery immediately afterward.

## Page Job

Within ten seconds, a visitor should understand who Thanh Tung is, what engineering work he does, and where to continue into Portfolio, Journal, Second Brain, or Gallery. The page must also surface the most recently updated real content.

## Visual Thesis

**A quiet engineering desk where work, knowledge, and personal records accumulate over time.**

The supplied window-and-workspace photograph provides the atmosphere. The interface adds an editorial reading rhythm and one restrained engineering-document convention. It should feel precise and personal, not like a simulated blueprint or a generic portfolio template.

## Color

| Token | Hex | Role |
| --- | --- | --- |
| Engineering Ink | `#0B1B1A` | Dark surfaces and strong text |
| Draft Paper | `#F3F6F2` | Light background and quiet surfaces |
| Signal Cyan | `#55D1D8` | Links, focus, and active state |
| Safety Coral | `#FF9485` | Secondary emphasis |
| Warm Brass | `#B9824B` | Connects UI details to the hero light |
| Muted Steel | `#6F8581` | Metadata and supporting text |

These roles map onto the existing semantic theme variables and all Ocean, Sakura, Forest, and Mono presets. Homepage components do not hardcode a separate theme.

## Type

- Editorial display: a restrained system serif stack for the homepage name and major section headings.
- Body and navigation: the existing Roboto Variable family.
- Document metadata: the existing JetBrains Mono family with tabular figures.
- Display text remains responsive through bounded `clamp()` values and never scales directly with viewport width.

## Layout

```text
+--------------------------------------------------------------+
| NAVIGATION                                                   |
+--------------------------------------------------------------+
| HERO IMAGE                                                   |
|                                                              |
| Nguyen Thanh Tung                  HOME / REV. 08.26          |
| MEP, Piping & Knowledge Systems    STATUS / ACTIVE            |
| Short introduction                [View engineering work]    |
+--------------------------------------------------------------+
| DOCUMENT REGISTER                                            |
| journal entries | photographs | live knowledge bases        |
+--------------------------------------------------------------+
| 01 / PRACTICE        Selected Engineering Work               |
| lead project                           two compact projects   |
+--------------------------------------------------------------+
| 02 / LATEST          Latest writing and recent updates       |
+--------------------------------+-----------------------------+
| 03 / KNOWLEDGE                 | 04 / GALLERY                |
| LEED Second Brain              | recent photographs         |
+--------------------------------+-----------------------------+
| ABOUT EXCERPT                            CONTACT / FOOTER      |
+--------------------------------------------------------------+
```

Desktop uses editorial asymmetry and clear horizontal rules. Mobile becomes one column, preserves the useful part of the photograph, and moves document metadata below the main introduction. No content depends on hover or horizontal scrolling.

## Signature Element

The single signature convention is a factual **Document Register** using live data, for example:

`HOME / REV. 08.26 / STATUS ACTIVE / 74 ENTRIES / 83 IMAGES / 1 LIVE VAULT`

Sections may inherit small numeric labels such as `01 / PRACTICE`, but no additional stamps, blueprint grids, or fake drawing annotations are introduced.

## Content And Data

- Journal cards use the existing Astro content collection and preserve original post text.
- Engineering work uses selected entries from `src/data/portfolio.ts`; Portfolio access control remains unchanged.
- Gallery previews use `src/data/gallery.json` and the existing optimized assets.
- Second Brain status uses `src/data/brain-topics.ts` and `src/data/brain-vault-status.json`.
- Counts and update dates are generated from real repository data, never manually duplicated.

## Interaction And Motion

- Use semantic links and buttons with visible focus and minimum 44px touch targets.
- Limit motion to opacity and short vertical translation for meaningful entrance/state changes.
- Hover changes border, color, or media scale without moving layout bounds.
- Respect `prefers-reduced-motion` and keep all content available without JavaScript.

## Anti-Patterns

- No bento dashboard, glassmorphism, decorative blobs, large gradients, or fake blueprint effects.
- No four floating CTA cards over the hero.
- No skill-tag cloud on the homepage.
- No cards nested inside cards and no card treatment for every section.
- No oversized name that obscures the supplied image.
- No decorative animation or new client-side library.
- No route, comment, Gallery, Portfolio, Admin, player, theme, or Second Brain behavior changes.

## Design Critique

### Does this look generic?

It could become a generic editorial portfolio if the technical metadata were merely decorative. The design avoids that by deriving its register, statuses, counts, work entries, and update dates from real project data and by limiting the engineering convention to one recognizable system.

### Which choices specifically come from Nguyen Thanh Tung's context?

The document register and revision language come from MEP, piping, BIM, and technical documentation work. The information hierarchy reflects the actual Portfolio, 74-entry Journal, 83-image Gallery, and live LEED knowledge vault. The warm supplied workspace photograph represents the quieter personal side of the same practice.
