---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 316
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 316

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=316]]

## Extracted Content

d. The baseline _HVAC system_ serving _HVAC zones_ that include _computer rooms_ shall be modeled in accor
dance with one of the following:
1. Baseline _System_ 11 shall be used for such _HVAC zones_ in _buildings_ with a total _computer room_ peak
cooling load greater than 3,000,000 Btu/h.
2. Baseline S _ystem_ 11 shall be used for such _HVAC zones_ in _buildings_ where the baseline _HVAC system_
type is 7 or 8 and the total _computer room_ peak cooling load is greater than 600,000 Btu/h.
3. Baseline _System_ 3 or 4 shall be used for all other _HVAC zones_ that include _computer rooms_ based on
climate zone.
e. _Residential associated HVAC zones_ shall use _system_ type 3 or 4 based on climate zone.


**G3.2.1.3** For baseline _HVAC_ _systems_ 1, 2, 3, 4, 9, 10, 11, 12, and 13, each _HVAC zone_ or _thermal block_
shall be modeled with its own _HVAC_ _system_ . For Systems 5, 6, 7, and 8, each _floor_ shall be modeled with a
separate _HVAC_ _system_ . _Floors_ with identical _HVAC zones_ or _thermal blocks_ can be grouped for modeling
purposes.

**Exception to G3.2.1.3:** Baseline _system_ 5 or 7 serving laboratory _spaces_ in accordance with Section

G3.2.1.2(b).

**G3.2.1.4 Purchased Heat.** For _systems_ using purchased hot water or steam, the heating source shall be
modeled as purchased hot water or steam in both the _proposed design_ and _baseline building design_ . Hotwater or steam costs shall be based on actual utility rates, and on- _site_ _boilers_, electric heat, and furnaces
shall not be modeled in the _baseline building design_ .

**G3.2.1.5 Purchased Chilled Water.** For _systems_ using purchased chilled water, the cooling source shall
be modeled as purchased chilled water in both the _proposed design_ and _baseline building design_ . Purchased
chilled-water costs shall be based on actual utility rates, and on- _site_ chillers and direct expansion _equipment_
shall not be modeled in the _baseline building design_ .

**G3.2.1.6 Baseline HVAC System Requirements for Systems Utilizing Purchased Chilled Water**
**and/or Purchased Heat.** If the _proposed design_ uses purchased chilled water and/or purchased heat, the following modifications to the baseline _HVAC system_ types in Table G3.1.1-4 shall be used.

**G3.2.1.6.1 Purchased Heat Only.** If the _proposed design_ uses purchased heat, but does not use purchased chilled water, then Tables G3.1.1-3 and G3.1.1-4 shall be used to select the baseline _HVAC system_
type, and purchased heat shall be substituted for the heating type in Table G3.1.1-4. The same heating source
shall be used in the _proposed design_ and _baseline building design_ .

**G3.2.1.6.2 Purchased Chilled Water Only.** If the _proposed design_ uses purchased chilled water but
does not use purchased heat, then Tables G3.1.1-3 and G3.1.1-4 shall be used to select the baseline _HVAC_
_system_ type, with the modifications listed below:


a. Purchased chilled water shall be substituted for the cooling types in Table G3.1.1-4.
b. _System_ 1 and 2 shall be constant-volume fan-coil units with _fossil fuel_ _boilers_ .
c. _System_ 3 and 4 shall be constant-volume single-zone air handlers with _fossil fuel_ furnaces.
d. _System_ 7 shall be used in place of _System_ 5.
e. _System_ 8 shall be used in place of _System_ 6.


**G3.2.1.6.3 Purchased Chilled Water and Purchased Heat.** If the _proposed design_ uses purchased
chilled water and purchased heat, then Tables G3.1.1-3 and G3.1.1-4 shall be used to select the baseline
_HVAC system_ type, with the following modifications:


a. Purchased heat and purchased chilled water shall be substituted for the heating types and cooling types in

Table G3.1.1-4.
b. _System_ 1 shall be constant-volume fan-coil units.
c. _System_ 3 shall be constant-volume single-zone air handlers.
d. _System_ 7 shall be used in place of _System_ 5.


**G3.2.1.6.4 On-Site Distribution Pumps.** All on- _site_ distribution _pumps_ shall be modeled in both the
_proposed design_ and _base building design_ .

**G3.2.1.7 Modeling Building Envelope Air Leakage.** The _air leakage_ rate of the _building envelope_
( _I75Pa_ ) at a pressure differential of 75 Pa (0.30 in. of water) shall be converted to appropriate units for the
_simulation program_ using one of the following formulas:

For methods describing _air leakage_ as a function of floor area,

_IFLR_ = 0.112 × _I75Pa_ × _S_ / _AFLR_


314 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
