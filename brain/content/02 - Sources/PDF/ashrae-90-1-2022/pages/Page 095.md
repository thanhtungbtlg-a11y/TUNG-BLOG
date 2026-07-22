---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 95
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 095

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=95]]

## Extracted Content

50% of full speed. At minimum speed, the fan _system_ shall draw no more than 30% of the power at full
fan speed. Low or minimum speed shall be used during periods of low cooling load and _ventilation_ -only
operation.
c. Units that include an _air economizer_ to meet the requirements of Section 6.5.1 shall have a minimum of

two speeds of fan control during economizer operation.


**Exceptions to 6.5.3.2.1:**

1. Modulating fan control is not required for chilled-water and evaporative cooling units with <1
hp fan motors if the units are not used to provide _ventilation_ air and if the indoor fan cycles with
the load.
2. If the volume of _outdoor air_ required to meet the _ventilation_ requirements of Standard 62.1 at
low speed exceeds the air that would be delivered at the speed defined in Section 6.5.3.2.1(a) or
6.5.3.2.1(b) then the minimum speed shall be selected to provide the required _ventilation_ air.

**6.5.3.2.2 VAV Static Pressure Sensor Location.** Static pressure sensors used to _control_ _VAV_ fans
shall be located such that the controller _set point_ is no greater than 1.2 in. of water. If this results in the sensor being located downstream of major duct splits, sensors shall be installed in each major branch to ensure
that static pressure can be maintained in each.

**Exception to 6.5.3.2.2:** _Systems_ complying with Section 6.5.3.2.3.

**6.5.3.2.3 VAV Set-Point Reset.** For multiple-zone _VAV_ _systems_ having a total _fan system motor name-_
_plate horsepower_ exceeding 5 hp with _DDC_ of individual zones reporting to the central control panel, static
pressure _set point_ shall be _reset_ based on the zone requiring the most pressure; i.e., the _set point_ is _reset_
lower until one zone damper is nearly wide open. Controls shall provide the following:


a. Monitor zone damper positions or other indicator of need for static pressure.
b. _Automatically_ detect those zones that may be excessively driving the _reset_ logic and generate an alarm to

the _system_ operator.
c. Readily allow operator removal of zones from the _reset_ algorithm.


_**Informative Note:**_ ASHRAE Guideline 36 includes detailed sequences of control for resetting static
pressure _set point_ based on _VAV system_ zone damper position and other indicators of zone _demand_, including
_automatically_ detecting and alarming zones that are excessively driving _reset_ logic and readily excluding
those zones from _reset_ logic.

**6.5.3.2.4 Return and Relief Fan Control.** Return and relief fans used to meet Section 6.5.1.1.5 shall
comply with all of the following:


a. Relief air rate shall be controlled to maintain _building_ pressure either directly, or indirectly through dif
ferential supply-return airflow tracking. _Systems_ with constant speed or multispeed supply fans shall also
be allowed to _control_ the relief _system_ based on _outdoor air_ damper position.
b. Fans shall have variable-speed control or other devices that will result in total return/relief fan _system_

_demand_ of no more than 30% of total design power at 50% of total design fan flow.


**Exceptions to 6.5.3.2.4:**

1. Return or relief fans with total motor size less than or equal to 0.5 hp.
2. Staged relief fans with a minimum of four stages.

_**Informative Note:**_ ASHRAE Guideline 36 includes detailed sequences of control for controlling _build-_
_ing_ pressure using economizer relief _systems_ such as relief dampers, relief fans, and return fans.

**6.5.3.3 Multiple-Zone VAV System Ventilation Optimization Control.** Multiple-zone _VAV_ _systems_
with _DDC_ of individual zone boxes reporting to a central control panel shall include means to _automatically_
reduce _outdoor air_ intake flow below design rates in response to changes in _system_ _ventilation_ _efficiency_ as
defined by ASHRAE Standard 62.1, Normative Appendix A.

**Exceptions to 6.5.3.3:**

1. _VAV_ _systems_ with zonal transfer fans that recirculate air from other zones without directly mixing
it with _outdoor air_, dual-duct dual-fan _VAV_ _systems_, and _VAV_ _systems_ with fan-powered _terminal_
units.
2. _Systems_ where total design exhaust airflow is more than 70% of total design _outdoor air_ intake
flow requirements.


_**Informative Note:**_ ASHRAE Guideline 36 includes detailed sequences of control for dynamically
adjusting minimum _ventilation_ rate _set points_ based on ASHRAE Standard 62.1, Normative Appendix A.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 93
