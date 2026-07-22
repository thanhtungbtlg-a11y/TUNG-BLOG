---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 213
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 213

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=213]]

## Extracted Content

a. Theoretical and empirical information verifying the method’s accuracy, and step-by-step documentation

of the exceptional calculation method performed, detailed enough to reproduce the results.
b. Copies of all spreadsheets used to perform the calculations.
c. A sensitivity analysis of _energy_ consumption when each of the input parameters that are estimated is var
ied from half to double the value assumed.
d. The calculations shall be performed on a time-step basis consistent with the _simulation program_ used.
e. The _energy cost budget_ and _design energy cost_ calculated with and without the exceptional calculation

methods.


**12.5 Calculation of Design Energy Cost and Energy Cost Budget**
**12.5.1** The simulation model for calculating the _design energy cost_ and the _energy cost budget_ shall be
developed in accordance with the requirements in Table 12.5.1.

**Exception to 12.5.1:** Energy used to recharge or refuel vehicles that are used for off- _site_ transportation

purposes shall not be modeled for the _design energy cost_ or the _energy cost budget_ .


**12.5.2 HVAC Systems.** The _HVAC system_ type and related performance parameters for the _budget build-_
_ing design_ shall be determined from Figure 12.5.2, the _system_ descriptions in Table 12.5.2-1 and accompanying notes, and the following rules:


a. **Budget Building Systems Not Listed.** Components and parameters not listed in Figure 12.5.2 and Table

12.5.2-1 or otherwise specifically addressed in this subsection shall be identical to those in the _proposed_
_design_ .
**Exception to 12.5.2(a):** Where there are specific requirements in Sections 6.4 and 6.5, the component

_efficiency_ in the _budget building design_ shall be adjusted to the lowest _efficiency_ level allowed by the
requirement for that component type.
b. **Minimum Equipment Efficiency.** All HVAC and _service water-heating_ _equipment_ in the _budget build-_

_ing design_ shall be modeled at the minimum _efficiency_ levels, both part load and full load, in accordance
with Sections 6.4, 6.5.4.8, 7.4, and 7.5 based on the budget _system_ type determined following Section
12.5.2(j) and capacity determined following Section 12.5.2(i). Chillers shall use Path A efficiencies as
shown in Table 6.8.1-3 and be modeled using the performance curves specified in Table J-1 and included
in Normative Appendix J. When using performance curves from Normative Appendix J, chiller minimum part-load ratio (ratio of load to available capacity at a given simulation time step) and minimum
compressor unloading ratio (part-load ratio below which the chiller capacity cannot be reduced by
unloading and chiller is false loaded) shall be equal to 0.25. _Simulation programs_ that do not use performance curves are permitted to use an alternative simulation method that results in the same performance
as the curves described in Normative Appendix J.
c. **Supply Fan Energy in Certain Package Equipment.** Where _efficiency_ ratings include supply fan

_energy_, the _efficiency_ rating shall be adjusted to remove the supply fan _energy_ . For budget _system_ Types
3, 4, 6, 8, 9, 10, and 11, calculate the minimum _COPnfcooling_ and _COPnfheating_ using the equation for the
applicable performance rating as indicated in Tables 6.8.1-1, 6.8.1-2, 6.8.1-4, and 6.8.1-15. Where a fulland part-load _efficiency_ rating is provided in Tables 6.8.1-1, 6.8.1-2, 6.8.1-4, and 6.8.1-15, the full-load
equation below shall be used:

_COPnfcooling_ = 7.84E-8 × _EER_ × _Q_ + 0.338 × _EER_

_COPnfcooling_ = –0.0076 × _SEER_ [2] + 0.3796 × _SEER_

(applies to cooling _efficiency_ only)
_COPnfheating_ = 1.48E-7 × _COP47_ × _Q_ + 1.062 × _COP47_

(applies to Systems 6 and 9 heating _efficiency_ only)

_COPnfheating_ = –0.0296 × _HSPF_ [2] + 0.7134 × _HSPF_

_COPnfcooling_ = 0.3322 × _EER_                 - 0.2145
(applies to Systems 8 and 10 cooling _efficiency_ only)

_COPnfheating_ = 1.1329 × _COP_                  - 0.214
(applies to System 8 heating _efficiency_ only)

where _COPnfcooling_ and _COPnfheating_ are the packaged HVAC _equipment_ cooling and heating _energy_ _effi-_
_ciency_, respectively, to be used in the _budget building design_, which excludes supply fan power, and _Q_ is
the AHRI-rated cooling capacity in Btu/h. If _Q_ is greater than 760,000 Btu/h, use 760,000 Btu/h in the calculation.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 211
