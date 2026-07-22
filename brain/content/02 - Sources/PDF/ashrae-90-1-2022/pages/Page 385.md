---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 385
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 385

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=385]]

## Extracted Content

e. By block, the _U-factor_, _C-factor_, or _F-factor_ for each simulated _opaque_ _building envelope_ component

and the _U-factor_ and _SHGC_ for each _fenestration_ component
f. By block or by surface for each block, the _fenestration_ area and total area of each _opaque_ _building enve-_
_lope_ component
g. By block, a list of the HVAC _equipment_ simulated in the _proposed design,_ including the _equipment_ type,

_fuel_ type, rated _equipment_ _efficiencies_, rated capacities, and _system_ control parameters
h. Annual _site_ HVAC _energy_ use by end use and _energy_ type for the _proposed design_ and _TSPR reference_

_building design_
i. Annual sum of hourly heating and cooling loads for the _TSPR reference building design_
j. The HVAC _total system performance ratio_ for both the _TSPR reference building design_ and the _proposed_
_design_ and compliance result in accordance with Section 6.6.2.2


_**Informative Note:**_ The _simulation program_, at a minimum, will report compliance with the _TSPR_ based
on the compliance criteria in Section 6.6.2.2. Should a jurisdiction adopt other compliance criteria, then a
separate calculation of _TSPR_ using the _reference building design_ and _proposed design_ HVAC _energy_ type
input may be necessary.


**L4. CALCULATION PROCEDURE**

Except as specified by this appendix, the _TSPR reference building design_ and _proposed design_ shall be configured and analyzed using identical methods and techniques.

**L4.1 Simulation of the Proposed Design (Non-HVAC).** The _proposed design_ non- _HVAC systems_ shall be
configured and analyzed as specified in this section. At a minimum, the _simulation program_ shall support
the _building_ use types included in the analysis. The allowed _building_ use types are listed in Section L1.1.1.1.

**L4.1.1 Simplified Block Approach.** The _simulation program_ shall model the _building_ using one or more
simplified geometric simulation _building_ blocks, described in Section L2.1. Each block contains one or multiple _thermal blocks_ . The _simulation program_ shall provide for simplified input described in Section L2.2
and allow for multiple block simulation.

**L4.1.2 Thermal Zoning.** Each _story_ in a block shall be modeled as a single _thermal block_ or as five _ther-_
_mal blocks_ consisting of four perimeter zones and a core zone. Below- _grade_ _stories_ shall always be modeled
as a single block. If any facade in the block is less than 45 ft in length, there shall only be a single _thermal_
_block_ per _story_ . Otherwise, each _story_ shall be modeled with five _thermal blocks_ . A perimeter zone shall be
created extending from each facade to a default depth of 15 ft with a user input range of 8 to 20 ft. Where
facades intersect, the zone boundary shall be formed by a 45 degree angle with the two facades. The remaining area or each _story_ shall be modeled as a core zone with no exterior _walls_ .

**L4.1.3 Building Use Type.** The _building_ use type for each block shall be consistent with the _proposed_
_design_ and allowed _building_ use types in Section L1.1.1.1. The occupant density, heat gain, and schedule
shall be as specified by Normative Appendix C.

**L4.1.4 Building Envelope Components.** _Building envelope_ thermal properties used in the _proposed_
_design_ shall be modeled based on the actual _proposed design_ using inputs described in Section L2.2.2 and
shall comply with all of the following:


a. _Roofs_ shall be modeled with insulation above a steel _roof_ deck. _Roof_ solar absorptance shall be modeled

at 0.70 and thermal _emittance_ at 0.90.
b. _Above-grade walls_ shall be modeled as steel-frame construction.
c. Above- _grade_ exterior _floors_ shall be modeled as steel-frame construction.
d. The area, _U-factor_, and _SHGC_ of vertical _fenestration_ shall be modeled for each facade based on the

actual _proposed design_ . The _simulation program_ shall model a combined single window centered on
each facade based on the area and sill height input by the user.
e. The _skylight_ area shall be modeled for each _roof_ based on the actual _proposed design_ . _Skylights_ shall be

combined into a single _skylight_ centered on the _roof_ of each zone based on the area input by the user.


**L4.1.5 Lighting.** For each block, the interior _lighting power density_ shall be equal to the applicable allowance in Table 9.5.1 based on the assigned _building_ use type. The lighting profile schedule shall be for the
applicable _building_ use type as specified by Normative Appendix C. The impact of lighting controls is
assumed to be captured by the lighting schedule, and no explicit controls (including daylight responsive controls) shall be modeled. Exterior lighting shall not be modeled.

**L4.1.6 Miscellaneous Equipment.** The miscellaneous _equipment_ schedule and power shall be based on
the assigned _building_ use type as specified by Normative Appendix C. The impact of miscellaneous _equip-_
_ment_ controls is assumed to be captured by the _equipment_ schedule, and no explicit controls shall be modeled.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 383
