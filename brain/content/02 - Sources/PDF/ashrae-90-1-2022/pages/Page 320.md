---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 320
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 320

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=320]]

## Extracted Content

5. Cooling _systems_ in Climate Zones 3C, 4C, 5B, 5C, 6B, 7, and 8.
6. Where the largest exhaust source is less than 75% of the design _outdoor airflow_ . This exception
shall only be used if exhaust air _energy_ recovery is not used in the _proposed design_ .
7. _Systems_ requiring dehumidification that employ _energy_ recovery in series with the cooling coil.
This exception shall only be used if exhaust air _energy_ recovery and series-style _energy_ recovery
coils are not used in the _proposed design_ .
8. _Systems_ serving laboratory _HVAC zones_ with a total laboratory exhaust volume greater than
15,000 cfm.


**G3.2.3 System-Specific Baseline HVAC System Requirements.** Baseline _HVAC systems_ shall conform
with provisions in this section, where applicable, to the specified baseline _system_ types, as indicated in section headings.

**G3.2.3.1 Heat Pumps (Systems 2 and 4).** Electric air source heat pumps shall be modeled with electric
auxiliary heat and an _outdoor air_ _thermostat_ . The _systems_ shall be controlled to energize auxiliary heat only
when the _outdoor air_ temperature is less than 40°F. The air source heat pump shall be modeled to continue
to operate while auxiliary heat is energized.

**G3.2.3.2 Type and Number of Boilers (Systems 1, 5, 7, 11, and 12).** The _boiler_ plant shall be natural
draft, except as noted in Section G3.2.1.4. The _baseline building design_ _boiler_ plant shall be modeled as having a single _boiler_ if the _baseline building design_ plant serves a _gross conditioned floor area_ of 15,000 ft [2] or
less, and as having two equally sized _boilers_ for plants serving more than 15,000 ft [2] . _Boilers_ shall be staged as
required by the load.

**G3.2.3.3 Hot-Water Supply Temperature (Systems 1, 5, 7, 11, and 12).** Hot-water design supply temperature shall be modeled as 180°F and design return temperature as 130°F.

**G3.2.3.4 Hot-Water Supply Temperature Reset (Systems 1, 5, 7, 11, and 12).** Hot-water supply temperature shall be _reset_ based on outdoor dry-bulb temperature using the following schedule: 180°F at 20°F
and below, 150°F at 50°F and above, and ramped linearly between 180°F and 150°F at temperatures
between 20°F and 50°F.

**Exception to G3.2.3.4:** _Systems_ served by purchased heat.


**G3.2.3.5 Hot-Water Pumps (Systems 1, 5, 7, 11, and 12).** The _baseline building design_ hot-water _pump_
power shall be 19 W/gpm. The pumping _system_ shall be modeled as primary-only with continuous variable
flow and a minimum of 25% of the design flow rate. Hot-water _pumps_ shall only be enabled when a load
exists on the associated hot-water loop . Hot-water _systems_ serving 120,000 ft [2] or more shall be modeled with
variable-speed drives, and _systems_ serving less than 120,000 ft [2] shall be modeled as riding the _pump_ curve.

**Exception to G3.2.3.5:** The _pump_ power for _systems_ using purchased heat shall be 14 W/gpm.


**G3.2.3.6 Piping Losses (Systems 1, 5, 7, 8, 11, 12, and 13).** _Piping_ losses shall not be modeled in either
the _proposed design_ or _baseline building design_ for hot-water, chilled-water, or steam _piping_ .

**G3.2.3.7 Type and Number of Chillers (Systems 7, 8, 11, 12, and 13).** Electric chillers shall be used in
the _baseline building design_ regardless of the cooling _energy_ source, e.g. direct-fired absorption or absorption from purchased steam. The _baseline building design_ ’s chiller plant shall be modeled with chillers having the number and type as indicated in Table G3.2.3.7 based on the peak coincident cooling load of baseline
_HVAC systems_ using chilled water.

**Exception to G3.2.3.7:** _Systems_ using purchased chilled water shall be modeled in accordance with

Section G3.2.1.6.


**G3.2.3.8 Chilled-Water Design Supply Temperature (Systems 7, 8, 11, 12, and 13).** Chilled-water
design supply temperature shall be modeled at 44°F and return water temperature at 56°F.

**G3.2.3.9 Chilled-Water Supply Temperature Reset (Systems 7, 8, 11, 12, and 13).** Chilled-water supply temperature shall be _reset_ based on outdoor dry-bulb temperature using the following schedule: 44°F at
80°F and above, 54°F at 60°F and below, and ramped linearly between 44°F and 54°F at temperatures
between 80°F and 60°F.

**Exception to G3.2.3.9:**

1. If the baseline chilled-water _system_ serves a _computer room_ _HVAC system_, the supply chilledwater temperature shall be _reset_ higher based on the _HVAC system_ requiring the most cooling;
i.e., the chilled-water _set point_ is _reset_ higher until one cooling-coil valve is nearly wide open.
The maximum _reset_ chilled-water supply temperature shall be 54°F.
2. _Systems_ served by purchased chilled water.


318 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
