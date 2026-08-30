# Homepage Design: Architectural Logic

## Subject

Nguyen Thanh Tung is presented as an MEP and piping engineer who also maintains a public knowledge system and a personal record through writing and photography.

## Audience

The homepage serves two audiences in balance:

- recruiters and technical collaborators receive the first, strongest signal;
- readers discover the Journal, Second Brain, and Gallery immediately afterward.

## Page Job

Within ten seconds, a visitor should understand who Thanh Tung is, what engineering work he does, and where to continue into Portfolio, Journal, Second Brain, or Gallery. The page also surfaces current, repository-derived information without pretending to be a technical drawing.

## Visual Thesis

**Architectural Logic: engineering precision with an editorial, human surface.**

The warm workspace photograph supplies the human setting. A paper-like surface, navy structure, copper signals, restrained cards, and an academic type hierarchy make the interface feel professional without becoming corporate. Engineering identity comes from real records and their organization, not decorative diagrams.

## Color

The homepage has a deliberately stable light-mode identity while continuing to support the site's existing dark mode and visitor controls.

- Surface: `#faf9f7`, a warm paper-like background.
- Primary text and heavy elements: `#162839` navy.
- Accent: `#8c4f10` copper, used for category signals, active states, and meaningful links.
- Outline: `#dadad8` for borders and dividers.
- Card surface: `#ffffff`; muted section surface: `#f1f0ed`.

Copper is a signal rather than a default text color. Dark mode keeps the existing deep surface and uses a lighter copper signal without flattening its contrast.

## Type

- Hanken Grotesk Variable is the primary reading and interface face.
- Source Serif 4 Variable carries identity, section structure, and selected editorial content titles.
- JetBrains Mono is reserved for real categories, dates, counts, update information, and project metadata.
- Monospace is never used to simulate technical complexity.

### Homepage Type Roles And Scale

The homepage uses a deliberately small set of role-based tokens rather than arbitrary rem values. Metadata and interface copy use pixel-based tokens so the site's 14px mobile base does not shrink readable information into micro-text. These roles are reusable in the Journal, Article, Portfolio, Gallery, and Second Brain interfaces.

| Role | Family | Size | Weight | Line height | Letter spacing | Homepage examples |
| --- | --- | --- | --- | --- | --- | --- |
| Display | Source Serif 4 Variable | `64-70px` desktop, `44-48px` mobile | 620 | 0.98 | 0 | Nguyen Thanh Tung only |
| Primary section heading | Source Serif 4 Variable | `36px` desktop, `30px` mobile | 620 | 1.15 | 0 | Selected engineering work |
| Secondary section heading | Source Serif 4 Variable | `32px` desktop, `27px` mobile | 620 | 1.15 | 0 | Latest from the journal, Work & Knowledge Register |
| Compact section heading | Source Serif 4 Variable | `26px` desktop, `24px` mobile | 620 | 1.15 | 0 | Knowledge system, Recent photographs, About this space |
| Featured content title | Source Serif 4 Variable | `28-32px` | 620 | 1.25 | 0 | Lead journal and live knowledge titles |
| Content title | Source Serif 4 Variable | `21-24px` | 620 | 1.25-1.3 | 0 | Project and compact record titles |
| Body | Hanken Grotesk Variable | `15-16px` | 400 | 1.55-1.7 | 0 | Descriptions, summaries, and prose |
| Small body | Hanken Grotesk Variable | `14px` | 500-700 | 1.45 | 0 | Register scope and compact values |
| Metadata | JetBrains Mono Variable | `12px` | 650-700 | 1.35-1.5 | 0 | Dates, disciplines, categories, counts, periods, and status |
| Eyebrow | JetBrains Mono Variable | `12px` | 700 | 1.35 | 0 | Practice, Journal, Second Brain, Gallery, About |
| Navigation | Hanken Grotesk Variable | `14px` | 650 | 1.4 | 0 | Navbar destinations |
| Action | Hanken Grotesk Variable | `14px` | 700-750 | 1.4 | CTAs and text links |

#### Hierarchy Rules

The visual order is `Display > Primary section heading > Secondary/compact section heading or featured content title > Content title > Body > Metadata/eyebrow`. Semantic heading levels remain independent from their visual token: an `h2` may use the compact section role when its section is intentionally quieter.

- Information a visitor is expected to read does not fall below 12px.
- Body copy targets a 1.55-1.7 line height and a practical 55-75 character measure.
- Dense mobile project descriptions keep the 15px body token and use 1.72 line height instead of becoming visibly larger.
- Section levels remain distinct on mobile; they are not collapsed into one scaled-down heading size.
- The About statement uses an 18px desktop / 17px mobile serif close, below the hero and project hierarchy.
- JetBrains Mono is used only when the text is genuine technical or record metadata. It is not a decorative engineering signal.
- Eyebrows identify a content category; they do not compete with the heading immediately below them.

Do not introduce one-off near-duplicate sizes, use display serif beyond identity, shrink readable metadata below 12px, choose heading levels for appearance, or promote ordinary content titles above their parent section heading.

### Public Page Type Roles And Surfaces

Archive, Article, Gallery, Second Brain, Portfolio, and About reuse a compact public-page scale without imitating the homepage composition. The reusable tokens are:

| Token | Role | Size |
| --- | --- | --- |
| `--public-font-meta` | Real dates, counts, categories, disciplines, and control labels | `12px` |
| `--public-font-small` | Secondary interface copy | `14px` |
| `--public-font-body` | Introductions, descriptions, and prose | `16px` |
| `--public-font-content-title` | Project, article, gallery, and vault titles | `19-24px` |
| `--public-font-section` | Public-page section headings | `26-32px` |
| `--public-font-title` | One page-level identity heading | `34-48px` |

Public pages use Hanken Grotesk for body and controls, Source Serif 4 for page and content hierarchy, and JetBrains Mono only for real metadata. Prose targets `68ch`; surfaces use 4px control radii or 8px content radii. The Admin interface remains an operational surface and is not forced into this editorial scale.

Controls must use a text color that reaches WCAG AA contrast against regular, hover, and active backgrounds. Accent color may identify focus, links, and state, but it is not a substitute for readable control text.

## Layout And Rhythm

```text
+--------------------------------------------------------------+
| NAVIGATION                                                   |
+--------------------------------------------------------------+
| WARM WORKSPACE HERO                                         |
| Nguyen Thanh Tung                                            |
| short introduction                                           |
| [View engineering work]  Read the journal ->                 |
+--------------------------------------------------------------+
| WORK & KNOWLEDGE REGISTER                                    |
| projects | journal | second brain | gallery | last updated   |
+--------------------------------------------------------------+
| PRACTICE                                                     |
| engineering project record       compact supporting records  |
+--------------------------------------------------------------+
| JOURNAL                                                      |
| editorial lead entry             real update register        |
+--------------------------------------------------------------+
| SECOND BRAIN                  | GALLERY                       |
| live knowledge record         | recent photographs            |
+--------------------------------------------------------------+
| ABOUT STATEMENT                                  CONTACT      |
+--------------------------------------------------------------+
```

The rhythm is intentionally uneven:

1. hero and compact register form one opening unit;
2. Practice receives the strongest content treatment;
3. Journal has more breathing room and an editorial lead;
4. Second Brain and Gallery share a quieter secondary band;
5. About closes the page without another card.

Section numbers are prohibited unless the content is a real ordered sequence.

## Signature Element

The single signature element is the **Work & Knowledge Register** immediately following the hero.

It uses only repository-derived information:

- current non-archived project records;
- Journal entries;
- live Second Brain topics;
- Gallery photographs;
- the newest update date derived from those sources.

It is an editorial index, not a dashboard. Four restrained cards provide category, real count, scope, and destination without inventing analytics. It is not repeated elsewhere on the page.

## Legitimate Engineering Metadata

Engineering metadata is legitimate only when it describes a real record, such as:

- project discipline, period, role, or status;
- an article category or publication date;
- a vault update date;
- repository-derived counts and timestamps.

Fake revision numbers, decorative statuses, drawing stamps, document codes, and labels such as `Document / Home / Status Active` are prohibited.

## Hero Treatment

- Preserve the selected warm workspace image and its useful crop.
- Keep one restrained dark shade for text readability; do not add decorative gradients or color effects.
- Use one solid primary CTA and one restrained outlined secondary CTA over the image.
- Body copy remains lighter than the name and short enough to scan.
- Desktop preserves the broad photographic composition.
- At 390px the crop, copy, and actions stay compact without shrinking the image into a decorative banner.

## Project Presentation

The lead project is the primary project record: image, metadata, title, summary, and link read as one composition. Supporting records are smaller repeated cards in the adjacent column. Radius stays at 4-8px and shadows remain low contrast.

## Background And Containers

- The homepage uses a solid semantic page background.
- The global grid/noise treatment is disabled on the homepage.
- Engineering character comes from alignment, typography, metadata, and separators.
- Cards are reserved for the register, repeated project records, Journal records, and the two secondary knowledge/gallery modules.
- Radius is limited to 4-8px. Shadows are subtle and never establish hierarchy by themselves.

## Mobile Player

Below 768px the collapsed music player becomes a small cover control. On the homepage it sits at the upper edge of the hero and scrolls away with the opening composition, so it cannot cover later headings, CTAs, or reading content. Tapping it opens the complete player. Playback, playlist, volume, repeat, shuffle, and cross-tab behavior remain unchanged.

## Interaction And Accessibility

- Use semantic links and buttons with visible focus and minimum 44px touch targets.
- Limit motion to meaningful state changes and respect `prefers-reduced-motion`.
- Preserve keyboard navigation, contrast, responsive behavior, and all content without client-side hydration where it is not required.

## Anti-Patterns

- No fake metadata, decorative section numbering, bento dashboard, glassmorphism, blobs, or simulated blueprint effects.
- No continuous decorative grid on the homepage.
- No four floating CTA cards, skill-tag cloud, or cards nested inside cards.
- No serif for every heading and no decorative monospace.
- No oversized mobile hero that hides the beginning of meaningful content.
- No new client-side library for homepage presentation.
- No unrelated route, comments, Gallery, Portfolio, Admin, theme, or Second Brain redesign.
