---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 384
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 384

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=384]]

## Extracted Content

**L3.1 Calculation of the TSPR.** The _simulation program_ shall calculate both the _TSPRp_ and _TSPRr_ based
only on the input for the _proposed design_ and the requirements of this appendix. The calculation procedure
shall not allow the user to directly modify either the _building_ component characteristics of the _TSPR refer-_
_ence building design_ or the HVAC parameters identified as fixed input in Table L2.2.3.

**L3.2 TSPR Simulation Program.** All components of the _proposed design_ for blocks served by _HVAC_ _sys-_
_tems_ using this method shall be explicitly modeled by the _simulation program_ . The _code official_ shall be permitted to approve a _simulation program_ for a specified application or limited scope.

**L3.2.1 Minimum Capability.** The _simulation program_ shall be approved by the _code official_ and shall, at
a minimum, have the ability to explicitly model all of the following:


a. 8760 hours per year
b. Hourly variations in occupancy, lighting power, miscellaneous _equipment_ power, _thermostat_ _set points_,

and _HVAC system_ operation, defined separately for each day of the week and holidays
c. Thermal mass effects
d. Ten or more _thermal blocks_
e. Part-load performance curves or other part-load adjustment methods for mechanical _equipment_
f. Capacity and _efficiency_ correction curves or other part-load adjustment methods for _mechanical heating_
and _mechanical cooling_ _equipment_
g. _Air economizers_ with integrated controls
h. The _energy_ use of all _HVAC_ _system_ types included in the analysis and _energy_ impact from all related

fixed and user inputs in Table L2.2.3
i. Ability to automatically generate the _TSPR reference building design_ as specified in Section L4.3


_**Informative Note:**_ The _simulation program_ shall include clear prompts or accessible help-topic references defining specific parameters and units for all required _building_ and _system_ characteristic inputs.

**L3.2.2 TSPR Determination.** The _simulation program_ shall have the ability to either directly determine
the _TSPRp_ and _TSPRr_ or produce hourly and annual reports of _energy_ use by each _energy_ source suitable for
determining the _TSPRp_ and _TSPRr_ using a separate calculation.

**L3.2.3 Load Calculations.** The _simulation program_ shall be capable of performing design load calculations to determine required HVAC _equipment_ capacities and air and water flow rates in accordance with Section 6.4.2.1 for both the _proposed design_ and _TSPR reference building design_ .

**L3.2.4 Testing**

**L3.2.4.1** The _simulation program_ shall be tested according to ASHRAE Standard 140, except for Sections 7 and 8 of Standard 140. The required tests shall include _building_ thermal envelope and fabric load tests
(Sections 5.2.1, 5.2.2, and 5.2.3), ground coupled slab-on- _grade_ analytical verification tests (Section
5.2.4), _space_ -cooling _equipment_ performance tests (Section 5.3), _space_ -heating _equipment_ performance
tests (Section 5.4), and air-side HVAC _equipment_ analytical verification tests (Section 5.5) along with the
associated reporting (Section 6).

**L3.2.4.2** The test results and modeler reports shall be posted on a publicly available website and shall
include the test results of the _simulation program_ and input files used for generating the results along with
the results of the other _simulation programs_ included in ASHRAE Standard 140, Annexes B8 and B16. The
modeler report in Standard 140, Annex A2, Attachment A2.7 shall be completed for results exceeding the
maximum or falling below the minimum of the reference values and for omitted results.

_**Informative Notes:**_

1. There are no pass/fail criteria established by this testing requirement.
2. Based on the Section 3.2 definition, _simulation program_ includes the simulation engine and the
corresponding user interface. The testing of a _simulation program_ only meets the requirements of
Section L1 for that _simulation program_ and cannot be used as proxy for documenting compliance
of another _simulation program_ that uses the same simulation engine.

**L3.3 Climatic Data.** Climatic data shall meet the requirements of Section G2.3.

**L3.4 Compliance Report.** The _simulation program_ shall generate a report that includes the following:


a. Address of the _building_
b. Name of individual completing the compliance report
c. Name and version of the compliance _simulation program,_ the edition of Standard 90.1 the _simulation_

_program_ method complies with, and the link to the website that contains the ASHRAE Standard 140
testing results for the version used in accordance with Section L3.2.4
d. The dimensions, _story_ heights, and number of _stories_ for each block


382 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
