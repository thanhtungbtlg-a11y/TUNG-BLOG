---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 215
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 215

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=215]]

## Extracted Content

_load hours_ for the _budget building design_ . Alternatively, _unmet load hours_ exceeding these limits may be
approved by the _building official_, provided that sufficient justification is given indicating that the accuracy of the simulation is not significantly compromised by these unmet loads.
j. **Determining the HVAC System.** Each _HVAC system_ in a _proposed design_ is mapped on a one-to-one
correspondence with one of eleven _HVAC systems_ in the _budget building design_ . To determine the budget _building_ _system_, do the following:
1. Enter Figure 12.5.2 at “Water/Ground” if the _proposed design_ _system_ condenser is water or evaporatively cooled; enter Figure 12.5.2 at “Air/None” if the condenser is air cooled. Closed-circuit dry
coolers shall be considered air cooled. _Systems_ utilizing district cooling shall be treated as if the condenser water type were “Water.” If no _mechanical cooling_ is specified or the _mechanical cooling_ _sys-_
_tem_ in the _proposed design_ does not require heat rejection, the _system_ shall be treated as if the
condenser water type were “Air.” For _proposed designs_ with ground-source or groundwater-source
heat pumps, the budget _system_ shall be water-source heat pump ( _System_ 6).
2. Select the path that corresponds to the _proposed design_ heat source: _electric resistance_, heat pump
(including air source and water source), or _fuel_ -fired. _Systems_ utilizing district heating (steam or hot
water) shall be treated as if the heating _system_ type were “Fossil Fuel.” _Systems_ with no heating capability shall be treated as if the heating _system_ type were “Fossil Fuel.” For _systems_ with mixed _fuel_
heating sources, the _system_ or _systems_ that use the secondary heating source type (the one with the
smallest total installed output capacity for the _spaces_ served by the _system_ ) shall be modeled identically in the _budget building design_, and the primary heating source type shall be used in Figure
12.5.2 to determine budget _system_ type.
3. Select the _budget building design_ _system_ category. The _system_ under “Single-Zone Residential System” shall be selected if the _HVAC system_ in the _proposed design_ is a _single-zone system_ and serves a
_residential_ _space_ . The _system_ under “Single-Zone Nonresidential System” shall be selected if the
_HVAC system_ in the _proposed design_ is a _single-zone system_ and serves other than _residential_ _spaces_ .
The _system_ under “All Other” shall be selected for all other cases.
k. **Kitchen Exhaust.** For kitchens with a total exhaust hood airflow rate greater than 5000 cfm, use a

_demand_ _ventilation_ _system_ on 75% of the exhaust air. The _system_ shall reduce exhaust and _replacement_
_air_ _system_ airflow rates by 50% for one half of the kitchen occupied hours in the _baseline building_
_design_ . If the _proposed design_ uses _demand_ _ventilation_, the same airflow rate schedule shall be used. The
maximum exhaust flow rate allowed for the hood or hood section shall meet the requirements of Section
6.5.7.2.2 for the numbers and types of hoods and appliances provided in the _proposed design_ .


**12.5.3 Modeling Building Envelope Air Leakage.** The _air leakage_ rate of the _building envelope_ ( _I75Pa_ )
at a pressure differential of 75 Pa (0.30 in. of water) shall be converted to appropriate units for the _simulation_
_program_ using one of the following formulas:


a. For methods describing _air leakage_ as a function of _floor_ area,

_IFLR_ = 0.112 × _I75Pa_ × _S/AFLR_
b. For methods describing _air leakage_ as a function of the area of _above-grade walls_ that separate _condi-_

_tioned spaces_ and _semiheated spaces_ from the exterior,

_IAGW_ = 0.112 × _I75Pa_ × _S/AAGW_
c. When using the measured _air leakage_ rate of the _building envelope_ at a pressure differential of 75 Pa

(0.30 in. of water) for the _proposed design_, the _air leakage_ rate shall be calculated as follows:

_I75Pa_ = _Q/S_

where
_I75Pa_ = _air leakage_ rate of the _building envelope_ in cfm/ft [2] at a fixed _building_ pressure differential of 75
Pa (0.30 in. of water)
_Q_ = volume of air in cfm flowing through the _building envelope_ when subjected to a pressure
differential of 75 Pa (0.30 in. of water), in accordance with ASTM E779, ASTM E1827, or
ASTM E3158
_S_ = total area of the _building envelope_ in ft [2], including the lowest _floor_, any _below-grade walls_ or
_above-grade walls_, and _roof_ (including _vertical fenestration_ and _skylights_ )
_IFLR_ = adjusted _air leakage_ rate of the _building envelope_ cfm/ft [2] at a reference wind speed of 10 mph
and relative to the _gross floor area_
_AFLR_ = _gross floor area_, ft [2]


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 213
