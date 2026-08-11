# Homepage Design: Maintained Personal Engineering Index

## Subject

Nguyen Thanh Tung is presented as an MEP and piping engineer who also maintains a public knowledge system and a personal record through writing and photography.

## Audience

The homepage serves two audiences in balance:

- recruiters and technical collaborators receive the first, strongest signal;
- readers discover the Journal, Second Brain, and Gallery immediately afterward.

## Page Job

Within ten seconds, a visitor should understand who Thanh Tung is, what engineering work he does, and where to continue into Portfolio, Journal, Second Brain, or Gallery. The page also surfaces current, repository-derived information without pretending to be a technical drawing.

## Visual Thesis

**A maintained personal engineering index.**

The warm workspace photograph supplies the human setting. The interface supplies precise structure, real project information, and a calm editorial reading rhythm. Engineering identity comes from how information is organized, not from blueprint decoration.

## Color

Homepage components use the existing semantic theme variables and support Ocean, Sakura, Forest, and Mono presets. No homepage-only accent was introduced.

- `--primary` carries links, focus, and the few active signals.
- `--content-color` carries primary text.
- `--meta-color` carries supporting information with accessible contrast.
- `--page-bg`, `--card-bg-solid`, and `--line-color` provide quiet structure.

The warm browns in the hero image remain photographic rather than being copied into decorative UI colors.

## Type

- Roboto Variable is the primary reading and interface face.
- The system serif is selective: the name, the lead journal title, the lead project title, the live knowledge title, and the About statement.
- JetBrains Mono is reserved for real categories, dates, counts, update information, and project metadata.
- Section headings use Roboto so the serif retains editorial weight.
- Monospace is never used to simulate technical complexity.

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

The single signature element is the **Work & Knowledge Register** attached to the hero.

It uses only repository-derived information:

- current non-archived project records;
- Journal entries;
- live Second Brain topics;
- Gallery photographs;
- the newest update date derived from those sources.

It is an editorial index, not a dashboard. It is not repeated elsewhere on the page.

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
- Use one button-style primary CTA. Secondary navigation is a text link.
- Body copy remains lighter than the name and short enough to scan.
- Desktop preserves the broad photographic composition.
- At 390px the media height is reduced so the register and the beginning of Practice are visible in the initial viewport.

## Project Presentation

The lead project is a project record rather than a generic card. Image, metadata, title, summary, and link are aligned by separators. Background fills, shadows, rounded containers, and decorative project numbers are omitted unless they communicate a real state.

## Background And Containers

- The homepage uses a solid semantic page background.
- The global grid/noise treatment is disabled on the homepage.
- Engineering character comes from alignment, typography, metadata, and separators.
- Cards are reserved for genuinely framed tools or repeated items.
- Radius and shadows are not added to every content block.

## Mobile Player

Below 768px the collapsed music player becomes a small cover control at the lower edge. Tapping it opens the complete player. Playback, playlist, volume, repeat, shuffle, and cross-tab behavior remain unchanged. The collapsed control must not cover headings, CTAs, or meaningful reading content.

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
