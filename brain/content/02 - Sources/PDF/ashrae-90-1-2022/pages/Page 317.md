---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 317
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 317

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=317]]

## Extracted Content

For methods describing _air leakage_ as a function of the area of _above-grade walls_ that separate _condi-_
_tioned spaces_ and _semiheated spaces_ from the exterior,

_IAGW_ = 0.112 × _I75Pa_ × _S/AAGW_
When using the measured _air leakage_ rate of the _building envelope_ at a pressure differential of 0.3 in. of
water for the _proposed design_, the _air leakage_ rate shall be calculated as follows:

_I75Pa_ = _Q/S_

where
_I75Pa_ = _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a fixed _building_ pressure differential of 75
Pa (0.30 in. of water)
_Q_ = volume of air in cfm flowing through the _building envelope_ when subjected to a pressure
differential of 75 Pa (0.30 in. of water), in accordance with ASTM E 779, ASTM E1827, or
ASTM E3158
_S_ = total area of the _building envelope_ (ft [2] ), including the lowest floor, any _below-grade walls_ or
_above-grade walls_, and _roof_ (including _vertical fenestration_ and _skylights_ )
_IFLR_ = adjusted _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a reference wind speed of 10 mph
and relative to the _gross floor area_
_AFLR_ = _gross floor area_, ft [2]

_IAGW_ = adjusted _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a reference wind speed of 10 mph
and relative to the area of the _above-grade walls_ of the _building envelope_
_AAGW_ = total area of _above-grade walls_ of the _building envelope_, ft [2]

**Exceptions to G3.2.1.7:** A multizone airflow model alternative method to modeling _building envelope_

_air leakage_ may be used, provided the following criteria are met:
1. Where the calculations are made independently of the _energy_ _simulation program_, the proposed
method must comply with Section G2.5.
2. The method for converting the _air leakage_ rate of the _building envelope_ at 0.3 in. of water, or 1.57
psf, to the appropriate units for the _simulation program_ is fully documented and submitted to the
_rating authority_ for approval.

**G3.2.2 General Baseline HVAC System Requirements.** _HVAC systems_ in the _baseline building design_
shall conform with the general provisions in this section.

**G3.2.2.1 Equipment Efficiencies.** All HVAC _equipment_ in the _baseline building design_ shall be modeled at the minimum _efficiency_ levels, both part load and full load, in accordance with Tables G3.5.1 through
G3.5.6. Where multiple _HVAC zones_ are combined into a single _thermal block_ in accordance with Table
G3.1, the efficiencies (for baseline HVAC System Types 3, 4, 9, and 10) taken from Tables G3.5.1, G3.5.2,
and G3.5.5 shall be based on the _equipment_ capacity of the _thermal block_ divided by the number of _HVAC_
_zones_ . HVAC System Types 5 or 6 efficiencies taken from Table G3.5.1 shall be based on the cooling _equip-_
_ment_ capacity of a single _story_ when grouping identical _stories_ in accordance with Section G3.2.1.1(a)(4).
Fan _energy_ shall be modeled separately according to Section G3.2.1.7.

_COPnfcooling_ and _COPnfheating_ are the packaged HVAC _equipment_ cooling and heating _energy_ _efficiency_,
respectively, to be used in the _baseline building design_, which excludes supply fan power.

The sets of performance curves specified in Table J-2 should be used to represent part-load performance
of chillers in the _baseline building design._ When using performance curves from Normative Appendix J,
chiller minimum part-load ratio (ratio of load to available capacity at a given simulation time step) and minimum compressor unloading ratio (part-load ratio below which the chiller capacity cannot be reduced by
unloading and chiller is false loaded) shall be equal to 0.25. _Simulation programs_ that do not use performance curves are permitted to use an alternative simulation method that results in the same performance as
the curves described in Normative Appendix J.

**G3.2.2.2 Equipment Capacities.** _System_ coil capacities for the _baseline building design_ shall be based
on sizing runs for each _orientation_ in accordance with Table G3.1, No. 5[a] and Section G3.2.2.2.1, and shall
be oversized by 15% for cooling and 25% for heating. The ratio between the capacities used in the annual
simulations and the capacities determined by the sizing runs shall be 1.15 for cooling and 1.25 for heating.
Plant capacities shall be based on coincident loads.

**G3.2.2.2.1 Sizing Runs.** Weather conditions used in sizing runs to determine baseline _equipment_
capacities shall be based on design days developed using _heating design temperatures_, _cooling design tem-_
_perature_, and _cooling design wet-bulb temperature_ . For cooling sizing runs, schedules for internal loads,


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 315
