---
type: moc
status: active
domains:
  - LEED
  - source-governance
leed_versions:
  - LEED v4
  - LEED v5
current_requirements_verified: false
created: 2026-07-21
updated: 2026-07-22
review_on:
publish: false
---

# LEED Version and Authority Map

## Purpose

This map governs how the vault distinguishes requirement text, implementation guidance, foundational principles, drafts, planning aids, and engineering interpretation. It is a decision rule for this vault, not a claim that every listed source is externally current.

## Practical Authority Hierarchy

1. **Published rating systems: requirement text.** Use the applicable edition as the primary local evidence for prerequisites, credits, and requirements. The validated BD+C and O+M rating systems explicitly organize their contents around intents and requirements: [[02 - Sources/PDF/leed-v5-bd-c-rating-system-november-2025-clean/pages/Page 002|BD+C PDF page 2]] through [[02 - Sources/PDF/leed-v5-bd-c-rating-system-november-2025-clean/pages/Page 006|BD+C PDF page 6]], and [[02 - Sources/PDF/leed-v5-o-m-rating-system-february-2026/pages/Page 002|O+M PDF page 2]] through [[02 - Sources/PDF/leed-v5-o-m-rating-system-february-2026/pages/Page 005|O+M PDF page 5]].
2. **Addenda and official interpretations: controlling comparison layer.** The vault now has validated dated BD+C, ID+C, and O+M addenda tables under [[02 - Sources/LEED/Register/LEED Addenda|LEED Addenda]]. Apply a row only after identifying its post date, target document, and whether that target edition already incorporates it. Do not label a correction as an interpretation unless the official source does so.
3. **Reference guides: edition-specific implementation guidance.** A validated reference guide can explain calculations, documentation, and technical application. The April 2025 BD+C guide states that it builds on rating-system requirements and provides detailed explanations: [[02 - Sources/PDF/855773644-leed-v5-bd-c-reference-guide-launch-edition/pages/Page 014|BD+C Reference Guide PDF page 14]]. A guide must not be treated as newer than its recorded edition.
4. **Referenced technical standards: conditional technical authority.** ASHRAE standards are authoritative within their recorded scope, but LEED applicability must be established by an explicit rating-system or reference-guide page. [[02 - Sources/LEED/Register/ASHRAE Guideline 0-2019]] is commissioning context only until such a link is found; [[02 - Sources/LEED/Register/ASHRAE Standard 90.1-2022]] also requires separation of local annotations from publisher text.
5. **Core-concept and governance foundations: foundational principles.** The Third Edition organizes sustainable thinking, integrative process, and broad LEED categories: [[02 - Sources/PDF/leed-coreconcepts-strategies-3rd-edition/pages/Page 006|Core Concepts PDF page 6]]. [[02 - Sources/LEED/Register/Foundations of LEED - January 2023]] governs LEED purpose and development. Neither source substitutes for current requirement text.
6. **Scorecards, summaries, and planning aids: navigation and comparison.** The local Impact Area View maps credits to impact areas on one page: [[02 - Sources/PDF/897003948-bd-c-impact-area-view/pages/Page 001|Impact Area View PDF page 1]]. [[02 - Sources/LEED/Register/LEED BD+C v4 to v5 Summary of Changes]] supports high-level comparison only. These sources cannot substitute for requirement text.
7. **Public-comment drafts: directional evidence only.** The Cities source is registered as Public Comment 2 and its cover identifies the LEED v5 for Cities rating system: [[02 - Sources/PDF/20260507-leed-v5-cities-pc2-final-rs-file/pages/Page 001|Cities PDF page 1]]. It must not be used as final project-compliance authority.
8. **Vault-authored engineering interpretation: explicitly labeled synthesis.** Engineering applications, MEP implications, and study explanations must be labeled as interpretation and linked back to the applicable evidence layer.

## Knowledge Labels

| Label | Meaning in this vault | Minimum evidence |
| --- | --- | --- |
| Requirement | Edition-specific prerequisite, credit, or requirement text | Published rating-system page plus applicable validated update review |
| Implementation guidance | Explanation of how to interpret, document, or apply a requirement | Exact reference-guide edition and page |
| Dated update | Official correction or amendment to a named source | Addenda date, affected document, page, and incorporation check |
| Referenced technical standard | Technical provision used by a LEED source | Exact standard edition plus the LEED page establishing the relationship |
| Foundational principle | Durable conceptual framing without a claim of current compliance | Core-concept guide page and version |
| Draft direction | Proposed material that may change | Draft stage, date or edition, and page |
| Planning aid | Summary or navigation artifact | Exact artifact and authority caveat |
| Engineering interpretation | Vault-authored application to design or operations | Explicit interpretation label plus supporting source pages |

## Conflict And Comparison Rules

- Keep both sources when editions differ; do not silently merge them.
- Use `needs-comparison` when the relationship is not established.
- A later publication date alone does not prove that one document supersedes another document of a different type.
- A dated addenda row must not be applied twice when a later guide or rating-system edition already incorporates it.
- Local annotations in a restricted standard are not publisher text and must not be cited as such.
- Do not set `current_requirements_verified: true` until the applicable requirement, guidance, and update sources have been compared and documented.
- Preserve the source version in every comparison result.

## Navigate

- [[02 - Sources/LEED/LEED Source Register]]
- [[03 - Concepts/LEED/LEED v4 to v5 High-Level Crosswalk]]
- [[03 - Concepts/LEED/LEED v5 for MEP Engineers MOC]]
- [[03 - Concepts/LEED/LEED v5 Concept Candidate Register]]
