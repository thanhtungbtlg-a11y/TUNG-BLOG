---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 380
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 380

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=380]]

## Extracted Content

**L3. SIMULATION PROGRAM**

The _simulation program_ shall have the following capabilities:


**Table L2.2.3 Proposed Building HVAC System Parameters**




































|Category|Parameter|Fixed or User<br>Defined|Required|Applicable<br>Systems a|
|---|---|---|---|---|
|_HVAC_ _System_ <br>Type|_System_ type|User defined|Selected from Table L.1.1.1|All|
|_System_ Sizing|Design-day information|Fixed|99.6% heating design and 1% dry-bulb and 1% wet-bulb cooling design|All|
|_System_ Sizing|Zone coil capacity|Fixed|Sizing factors used are 1.25 for heating_equipment_ and 1.15 for cooling_equipment._|All|
|_System_ Sizing|Supply airflow|Fixed|Based on the greater of a supply-air-to-room-air temperature_set point_difference of<br>20°F or required_OA_ _ventilation_||
|Outdoor<br>_Ventilation_ Air<br>and Filtration|Portion of supply air with proposed filter ≥MERV 13|User defined|Percentage of supply airflow subject to higher filtration (adjusts reference fan power<br>higher; prorated)|All|
|Outdoor<br>_Ventilation_ Air<br>and Filtration|Outdoor_ventilation_ supply airflow rate adjustments|Fixed|Basis is 1.0 zone air distribution effectiveness|All|
|Outdoor<br>_Ventilation_ Air<br>and Filtration|Outdoor_ventilation_ supply airflow rate|Fixed|As specified in ASHRAE/IES Standard 90.1 Normative Appendix C, adjusted for<br>proposed_DCV_ control (See “Demand Control Ventilation” category below.)|All|
|_System_ <br>Operation|_Space_ temperature_set points_|Fixed|As specified in ASHRAE/IES Standard 90.1 Normative Appendix C, except for<br>hotel/motel, which shall be 70°F heating 72°F cooling|All|
|_System_ <br>Operation|Fan operation—occupied (where DOAS meets<br>_ventilation_ requirements)|User defined|Fan either runs continuously during occupied hours or is cycled to meet thermal<br>load.|All (continuous)<br>1–11 (cycles)|
|_System_ <br>Operation|Fan operation—occupied (where heating and cooling<br>units provide_ventilation_—no DOAS)|Fixed|Fan runs continuously during occupied hours;_VAV_ or multispeed fans reduce airflow<br>related to thermal load.|1–11|
|_System_ <br>Operation|Fan operation—night cycle|Fixed|Fan cyclesON to meet_setback_ temperatures.|1–11|
|Packaged<br>_Equipment_ <br>_Efficiency_|DX cooling_efficiency_|User defined|Cooling_COP_ without fan_energy_ calculated in accordance with Section L4.2.3(d)|1, 2, 3, 4, 5, 7, 8,<br>9, 11, 12|
|Packaged<br>_Equipment_ <br>_Efficiency_|DX coil number of stages|User defined|Single stage or multistage|3, 4, 9, 10, 11, 12|
|Packaged<br>_Equipment_ <br>_Efficiency_|Heat-pump_efficiency_|User defined|Heating_COP_ without fan_energy_ calculated in accordance with Section L4.2.3(d)|2, 4, 5, 7, 8, 12|
|Packaged<br>_Equipment_ <br>_Efficiency_|Furnace_efficiency_|User defined|Furnace thermal_efficiency_|1, 3, 9, 12|
|Heat-Pump<br>Supplemental<br>Heat|Heat source|User defined|_Electric resistance_ or gas furnace|2, 4, 7, 8, 12|
|Heat-Pump<br>Supplemental<br>Heat|Control|Fixed|_Electric_ heat locked out above 40°F OAT. Runs as needed in conjunction with<br>compressor between 40°F and 0°F. Gas heat operates in place of the heat pump when<br>the heat pump cannot meet load.|2, 4, 7, 8, 12|



a. Applicable _systems_ from Table L.1.1.1
_**Informative Note:**_ See Section 3.3 for a full list of terms used in this table.
