---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 381
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 381

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=381]]

## Extracted Content

**Table L2.2.3 Proposed Building HVAC System Parameters** _**(Continued)**_




























|Category|Parameter|Fixed or User<br>Defined|Required|Applicable<br>Systems a|
|---|---|---|---|---|
|_System_ Fan<br>Power<br>and Controls|Design fan power, W/cfm|User defined|Input electric power for all fans required to operate at_fan system design conditions_<br>divided by the supply airflow rate. Include any VSD losses at design condition. This<br>is a wire-to-air value, including all drive, motor_efficiency_, and other losses.|All|
|_System_ Fan<br>Power<br>and Controls|Part-load fan controls:<br>• Constant volume<br>• Two-speed or three-speed, then input:<br>• W/cfm at each speed<br>• % cfm at leach speed<br>_• VAV_|User defined|Static pressure_reset_ included for_VAV_|All (constant<br>volume, two speed)<br>9, 10, 11 (_VAV_)|
|_Variable-Air-_<br>_Volume Systems_|SAT controls (select):<br>• None<br>• OAT SAT_reset_<br>• Warmest zone SAT_reset_|User defined|If not SAT_reset_, then constant at 55°F. Options for_reset_ based on OAT or warmest<br>zone. If OAT_reset_, SAT is_reset_ higher to 60°F at outdoor low of 50°F. SAT is 55°F<br>at outdoor high of 70°F. If warmest zone, then the user can specify the minimum and<br>maximum temperatures.|9, 10, 11|
|_Variable-Air-_<br>_Volume Systems_|• Zone minimum damper and_Evs_<br>• Standard 62.1 simple method except for schools|Fixed|• Schools: 1.2 ×_Voz_ zone minimum design_ventilation_ rate, cfm;_Evs_ = 0.65<br>• Other_buildings_: Simple Standard 62.1 method is 1.5 ×_Voz_ zone minimum design<br>_ventilation_ rate, cfm;_Evs_ = 0.75.|9, 10, 11|
|_Variable-Air-_<br>_Volume Systems_|Dual_set point_ minimum_VAV_ damper position|User defined|Heating minimum and maximum airflow fraction|9, 10, 11|
|_Variable-Air-_<br>_Volume Systems_|Terminal-unit heating source|User defined|Electric or hydronic||
|_Variable-Air-_<br>_Volume Systems_|FPTU type|User defined|Series or parallel FPTU|11|
|_Variable-Air-_<br>_Volume Systems_|Parallel FPTU fan||Sized for 50% peak primary air at 0.35 W/cfm|11|
|_Variable-Air-_<br>_Volume Systems_|Series FPTU fan|Fixed|Sized for 50% peak primary air at 0.35 W/cfm|11|
|Economizer|OSA economizer presence|User defined|Yes or no|3, 4, 5, 6, 9, 10, 11|
|Economizer|Economizer high limit|Fixed|• Lockout on differential dry-bulb temperature (OAT > RAT) in Climate Zones 6A,<br>5A, All B, and C<br>• Fixed enthalpy > 28 Btu/lb or fixed dry-bulb OAT > 75°F in Climate Zones 0A to<br>4A||
|_Energy_ <br>Recovery|Sensible effectiveness|User defined|Heat exchanger sensible effectiveness at design heating and cooling conditions|3, 4, 9, 10, 11, 12|
|_Energy_ <br>Recovery|Latent effectiveness|User defined|Heat exchanger latent effectiveness at design heating and cooling conditions|3, 4, 9, 10, 11, 12|
|_Energy_ <br>Recovery|Bypass SAT_set point_|User defined|If bypass, target supply air temperature|3, 4, 9, 10, 11, 12|
|_Energy_ <br>Recovery|Fan power reduction when in bypass|User defined|If bypass, specify fan power reduction, W/cfm.|3, 4, 9, 10, 11, 12|



a. Applicable _systems_ from Table L.1.1.1
_**Informative Note:**_ See Section 3.3 for a full list of terms used in this table.
