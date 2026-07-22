---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 290
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 290

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=290]]

## Extracted Content

**C3.5.7 Lighting.** The modeled lighting power shall be determined using the _lighting power density_ allowances in Table 9.5.1 for the applicable _building_ area type. The modeled lighting power shall be adjusted in
accordance with the lighting schedule in the _building envelope trade-off schedules and loads_ for the applicable _building_ area type. Fifty percent (50%) of lighting in _daylight areas_ shall be modeled with _continuous_
_daylight dimming_ controls such that when sufficient daylight is available at the corresponding _photosensor_,
lighting power is reduced to maintain a minimum 50 fc for _conditioned spaces_ and 30 fc for _semiheated_
_spaces_ . The minimum light output for the _continuous daylight dimming_ shall be 6% of peak light output.
Power input shall be modeled as 20% of lighting power at the minimum light output and scaled linearly to
100% of lighting power at peak light output.
**C3.5.8 HVAC Systems.** One _HVAC system_ shall be provided for each thermal zone and shall have the following characteristics:


a. Constant-volume fan control.
b. Electrically provided cooling with _EER_ from Table 6.8.1-1, based on requirements for split- _system_ air

conditioners with heating section type “all other” between 65,000 Btu/h and 135,000 Btu/h. The _EER_
shall be adjusted to remove the fan power in accordance with Section 12.5.2(c).
c. Gas furnace with constant thermal _efficiency_ equal to the minimum _AFUE_ allowed for gas-fired warm
air furnaces with maximum capacity <225,000 Btu/h, in accordance with Table 6.8.1-5.
d. The _ventilation_ rate for each _building_ area type shall be consistent with the _ventilation_ rate in the _build-_

_ing envelope trade-off schedules and loads_ for the applicable _building_ area type.
e. _Air economizers_, except in Climate Zones 0 and 1. The high-limit shutoff shall be “Fixed Dry Bulb” type

as described in Table 6.5.1.1.3.
f. _System_ design supply air rates shall be based on a supply-air-to-room-air temperature difference of 20°F
in cooling.
g. _System_ capacities used in the annual simulation shall be 1.5 times the capacities determined by the sizing

simulations.
h. Fans shall cycle ON whenever the _space_ calls for heating or cooling. The fan power shall be 0.3 W/cfm,

and the fan _energy_ shall be modeled explicitly.


**C3.5.9 Miscellaneous Loads.** Miscellaneous loads shall be modeled as included in the _building envelope_
_trade-off schedules and loads_ for the applicable _building_ area type.

**C3.5.10 Occupant Density.** The occupant density shall be modeled according to the peak occupant density and the occupancy rate schedule in the _building envelope trade-off schedules and loads_ for the applicable _building_ area type.

**C3.5.11 Heat Gain from Occupants.** The sensible and latent heat gain due to occupants shall be modeled
as included in the _building envelope trade-off schedules and loads_ for the applicable _building_ area type.

**C3.6 Calculation of Base Envelope Performance Factor.** The simulation model for calculating the _base_
_envelope performance factor_ shall modify the simulation model for calculating the _proposed envelope perfor-_
_mance factor_ as follows:


a. All _opaque_ assemblies shall be modeled with the _U-factor_ not greater than that required in Section 5.5.3

for the appropriate _class of construction_, _space conditioning category_, and climate zone. _Mass walls_ and
_mass floors_ shall be modeled with _HC_ equal to 7.2 Btu/ft [2] ·°F. All other _opaque_ assemblies shall be modeled with the same _HC_ as the _proposed design_ . _Mass walls_ shall be modeled with equal mass on each
side of the insulation. All other _opaque_ assemblies shall be modeled with insulation on the exterior.
b. _Thermal bridges_ :

1. Where option (a) is selected in Section C1.2.7, no modifications to the assembly _U-factors_ are
required.
2. Where option (b) is selected in Section C1.2.7, the _U-factor_ of the assembly interrupted shall be modified per Section A10.2 using the default values in Table A10.1 for the appropriate _class of construc-_
_tion_ . Each of the _linear thermal bridges_ or _point thermal bridges_ identified in Sections 5.5.5.1 through
5.5.5.5 shall be modeled in the simulation model for calculating the proposed envelope performance.
Where the balcony length in the _proposed design_ is greater than allowed by Section 5.5.5.2.2, the area
shall be reduced proportionally along each exposure until the limit set in Section 5.5.5.2.2 is met.
3. Where option (c) is selected in Section C1.2.7, no modifications to the assembly _U-factors_ are
required.
c. The exterior _roof_ surfaces shall be modeled with a solar reflectance and thermal _emittance_ as required in

Section 5.5.3.1.4(a). All other _roofs_, including _roofs_ exempted from the requirements in Section 5.5.3.1.4,
shall be modeled the same as in the _proposed design_ . The _above-grade wall_ surfaces of _buildings_ shall be


288 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
