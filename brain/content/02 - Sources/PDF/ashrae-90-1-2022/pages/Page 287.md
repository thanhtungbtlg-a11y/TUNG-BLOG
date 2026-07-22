---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 287
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 287

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=287]]

## Extracted Content

operation and maintenance, weather, _energy_ use not covered by this procedure, changes in _energy_ rates
between design of the _building_ and occupancy, and the precision of the calculation tool.

**C3.1.3** The _simulation program_ shall be capable of performing design load calculations to determine
required HVAC _equipment_ capacities and airflow rates in accordance with Section 6.4.2 for both the _pro-_
_posed design building envelope_ and the _base design building envelope_ .

**C3.1.4 Simulation Program Testing Requirements**

**C3.1.4.1** The _simulation program_ shall be tested according to ASHRAE Standard 140, except for Sections 7 and 8, of Standard 140. The required tests shall include _building_ thermal envelope and fabric load
tests (Sections 5.2.1, 5.2.2, and 5.2.3), ground coupled slab-on- _grade_ analytical verification tests (Section
5.2.4), _space_ -cooling _equipment_ performance tests (Section 5.3), _space_ -heating _equipment_ performance tests
(Section 5.4), and air-side HVAC _equipment_ analytical verification tests (Section 5.5), along with the associated reporting (Section 6).

**C3.1.4.2** The test results and modeler reports shall be posted on a publicly available website and shall
include the test results of the _simulation program_ and input files used for generating the results along with
the results of the other _simulation programs_ included in ASHRAE Standard 140, Annexes B8 and B16. The
modeler report in Standard 140, Annex A2, Attachment A2.7 shall be completed for results exceeding the
maximum or falling below the minimum of the reference values and for omitted results.

**C3.1.4.3** The testing shall be performed for the version of the _simulation program_ used to calculate the
_proposed envelope performance factor_ and _base envelope performance factor_ .

_**Informative Notes:**_

1. There are no pass/fail criteria established by this requirement.
2. Based on the Section 3 definition, _simulation program_ includes the simulation engine and the corresponding user interface. The testing of a _simulation program_ only meets the requirements of
Section C3.1.4 for that _simulation program_ and cannot be used as proxy for documenting compliance of another _simulation program_ that uses the same simulation engine _._

**C3.2 Climatic Data.** The _simulation program_ shall perform the simulation using hourly values of climatic
data, including temperature, humidity, solar radiation, and wind speed and direction from representative climatic data, for the _proposed design building envelope_ location. For cities or urban regions for which several
climatic data sources are available and for locations for which weather data are not available, the designer
shall select available weather data that represent the climate at the _construction_ _site_ . Selected weather data
shall be approved by the _authority having jurisdiction_ .

**C3.2.1 Surface Exposure.** Semiexterior surfaces separating _conditioned spaces_ from _unconditioned_
_spaces_ shall be simulated as exterior surfaces with no exposure to wind or solar radiation.

**C3.3 Purchased Energy Rates.** The following rates for _purchased energy_ shall be used to determine the
_proposed envelope performance factor_ and the _base envelope performance factor_ :


a. Electricity: $0.1063/kWh
b. Heating: $0.98/therm


**Exception to C3.3:** Where approved by the _authority having jurisdiction_, actual annual rates for _purchased_

_energy_ or state average _energy_ prices published by the Department of Energy’s Energy Information
Administration shall be permitted. The same rates shall be used for both the _proposed envelope perfor-_
_mance factor_ and the _base envelope performance factor_ .

**C3.4 Compliance Calculations.** The _proposed envelope performance factor_ and _base envelope perfor-_
_mance factor_ shall be calculated using the same


a. _simulation program_,
b. climatic data, and
c. _purchased energy rates_ .


**C3.5 Calculation of Proposed Envelope Performance Factor.** The simulation model for calculating the
_proposed envelope performance factor_ shall be developed in accordance with Sections C3.5.1 through
C3.5.11.

**C3.5.1 Space Conditioning.** All _conditioned spaces_ in the _proposed design_ shall be simulated as being
both heated and cooled, even if no cooling or heating _system_ is being installed. Temperature control _set_
_points_ and schedules shall be consistent with those in the _building envelope trade-off schedules and loads_ for
the applicable _building_ area type. All _semiheated spaces_ shall be simulated as being heated and not cooled.
The heating temperature control _set point_ shall be 50°F for all hours.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 285
