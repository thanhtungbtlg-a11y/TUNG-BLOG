---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 305
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 305

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=305]]

## Extracted Content

_simulation program_ shall include calculation methodologies for the _building_ components being modeled. For
components that cannot be modeled by the _simulation program_, the exceptional calculation methods requirements in Section G2.5 shall be used.

_**Informative Note:**_ For the ease of use and consistent application, the _simulation program_ should automatically implement the requirements of this appendix to generate the baseline design and _proposed design_
models based on the user model of the _proposed design_ .

**G2.2.1** The _simulation program_ shall be approved by the _rating authority_ and shall, at a minimum, have
the ability to explicitly model all of the following:


a. 8760 hours per year
b. Hourly variations in occupancy, lighting power, miscellaneous _equipment_ power, _thermostat_ _set points_,

humidity _set points_, and _HVAC system_ operation, defined separately for each day of the week and holidays
c. Thermal mass effects
d. Ten or more thermal zones
e. Part-load performance curves for mechanical _equipment_
f. Capacity and _efficiency_ correction curves for _mechanical heating_ and _mechanical cooling_ _equipment_
g. _Air economizers_ with integrated control
h. _Baseline building design_ characteristics specified in Section G3


**G2.2.2** The _simulation program_ shall have the ability to either directly determine the _proposed building_
_performance_ and _baseline building performance_ or produce hourly reports of _energy_ use by an _energy_
source suitable for determining the _proposed building performance_ and _baseline building performance_ using
a separate calculation.

**G2.2.3** The _simulation program_ shall be capable of performing design load calculations to determine
required HVAC _equipment_ capacities and air and water flow rates in accordance with Section 6.4.2.1 for
both the _proposed design_ and _baseline building design_ .

**G2.2.4 Simulation Program Testing Requirements**

**G2.2.4.1** The _simulation program_ shall be tested according to ASHRAE Standard 140, except for Sections 7 and 8 of Standard 140. The required tests shall include _building_ thermal envelope and fabric load tests
(Sections 5.2.1, 5.2.2, and 5.2.3), ground coupled slab-on- _grade_ analytical verification tests (Section 5.2.4),
_space_ -cooling _equipment_ performance tests (Section 5.3), _space_ -heating _equipment_ performance tests (Section 5.4), and air-side HVAC _equipment_ analytical verification tests (Section 5.5), along with the associated
reporting (Section 6).

**G2.2.4.2** The test results and modeler reports shall be posted on a publicly available website and shall
include the test results of the _simulation program_ and input files used for generating the results along with
the results of the other _simulation programs_ included in ASHRAE Standard 140, Annexes B8 and B16. The
modeler report in Standard 140, Annex A2, Attachment A2.7 shall be completed for results exceeding the
maximum or falling below the minimum of the reference values and for omitted results.

**G2.2.4.3** The testing shall be performed for the version of the _simulation program_ used to calculate the
_proposed building performance_ and _baseline building performance_ .

_**Informative Notes:**_

1. There are no pass/fail criteria established by this requirement.
2. Based on the Section 3 definition, _simulation program_ includes the simulation engine and the corresponding user interface. The testing of a _simulation program_ only meets the requirements of
Section G2.2.4 for that _simulation program_ and cannot be used as proxy for documenting compliance of another _simulation program_ that uses the same simulation engine _._

**G2.3 Climatic Data.** The _simulation program_ shall perform the simulation using hourly values of climatic
data, including temperature, humidity, solar radiation, and wind speed and direction from representative climatic data, for the _site_ in which the _proposed design_ is to be located. For locations for which several climatic
data sources are available or weather data are not available, the designer shall select available weather data
that best represent the climate at the _construction_ _site_ . The selected weather data shall be approved by the
_rating authority_ .

**G2.4 Renewable, Recovered, and Purchased Energy**

**G2.4.1 On-Site Renewable Energy and Site-Recovered Energy.** _Site-recovered energy_ shall not be considered _purchased energy_ and shall be subtracted from the _proposed design_ _energy_ consumption prior to calculating the _proposed building performance_ . _On-site renewable energy_ shall be subtracted from the _proposed_


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 303
