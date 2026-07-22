---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 289
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 289

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=289]]

## Extracted Content

**C3.5.5 Building Envelope.** The _building envelope_ shall reflect the information specified in Section C1.
**Exception to C3.5.5:** Where three-year-aged test data for the solar reflectance and three-year-aged ther
mal _emittance_ of the exterior _roof_ surface are unavailable, the exterior _roof_ surface shall be modeled
with a solar reflectance of 0.30 and a thermal _emittance_ of 0.90.

**C3.5.5.1 Shading.** Manually operated interior shades shall be modeled on all _vertical fenestration_ .
Shades shall be modeled to be in the lowered position when either the transmitted luminance is greater than
200 cd/ft [2] or the direct solar transmitted _energy_ exceeds 30 Btu/h·ft [2] and then remain lowered for rest of the
day. Shades shall be modeled with visible light transmittance of 0.10, visible light reflectance of 0.40, solar
transmittance of 0.21, and solar reflectance of 0.23. Permanent shading devices such as fins and overhangs
shall be modeled.

**C3.5.5.2 Dynamic Glazing.** _Automatically_ controlled _dynamic glazing_ is allowed to be modeled. Manually controlled _dynamic glazing_ shall use the average of the minimum and maximum values for both _SHGC_
and _VT_ .

**C3.5.5.3 Air Leakage.** The _air leakage_ rate of the _building envelope_ ( _I75Pa_ ) at a pressure differential of
75 Pa (0.30 in. of water) shall be 0.35 cfm/ft [2] of _building envelope_ area when _air leakage_ compliance is
based on whole- _building_ pressurization testing and shall be 0.45 cfm/ft [2] of _building envelope_ area when _air_
_leakage_ compliance is based on verification. The _air leakage_ of the _building envelope_ shall be converted to
the appropriate units to describe the _air leakage_ as a function of the area of _walls_ that separate _conditioned_
_spaces_ and _semiheated spaces_ from the exterior as follows:

_IAGW_ = 0.112 × _I75Pa_ × _S_ / _AAGW_
where

_I75Pa_ = _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a fixed _building_ pressure differential of
75 Pa (0.30 in. of water)

_S_ = total area of the _building envelope_ (ft [2] ) including the lowest _floor_, any _below-grade walls_ or
_above-grade walls_, and _roof_ (including _vertical fenestration_ and _skylights_ )

_IAGW_ = adjusted _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a reference wind speed of 10 mph
and relative to the area of the _above-grade walls_

_AAGW_ = the total area of _above-grade walls_ that comprise the _building envelope_, ft [2]

**Exception to C3.5.5.3:** If the _simulation program_ cannot simulate _air leakage_ as a function of the area

of _walls_ that separate _conditioned spaces_ and _semiheated spaces_ from the exterior, the _air leakage_ of
the _building envelope_ shall be converted to the appropriate units to describe the _air leakage_ as a
function of _gross floor area_ as follows:

_IFLR_ = 0.112 × _I75Pa_ × _S_ / _AFLR_
where

_IFLR_ = adjusted _air leakage_ rate of the _building envelope_ (cfm/ft [2] ) at a reference wind speed of 10 mph

and relative to the _gross floor area_

_AFLR_ = _gross floor area_, ft [2]

**C3.5.5.3.1 Air Leakage Schedule.** To simulate _air leakage_ as described in Section 5.4.3, infiltration
shall be adjusted in accordance with the infiltration schedule in the _building envelope trade-off schedules_
_and loads_ for the applicable _building_ area type.

**C3.5.5.4 Thermal Bridges.** _Linear_ and _point thermal bridges_ in the _proposed design_ shall be either of
the following:


a. Not modeled where option (a) or (c) is selected in Section C1.2.7.
b. Entered as individual _thermal bridge_ inputs of length or count where option (b) is selected in Section

C1.2.7 and addressed as follows:
1. Individual _thermal bridges_ in the _proposed design_ that are indicated to comply with the requirements
of Sections 5.5.5.1 through 5.5.5.5 need not be modeled.
2. Individual _thermal bridges_ in the _proposed design_ that are indicated to not comply with the requirements of Sections 5.5.5.1 through 5.5.5.5 shall be modeled.
3. Individual _thermal bridges_ in the _proposed design_ that are indicated to be not applicable with the
requirements of Sections 5.5.5.1 through 5.5.5.5 need not be modeled.
**C3.5.6 Interior Surfaces.** Interior surfaces shall be modeled with visible light reflectances of 0.80 for ceilings, 0.50 for walls, and 0.20 for floors. Interior surfaces shall be modeled with a thermal _emittance_ of 0.90.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 287
