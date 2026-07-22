---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 30
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 030

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=30]]

## Extracted Content

**(This is a normative appendix and is part of this standard.)**


**NORMATIVE APPENDIX C**
**PROCEDURE FOR CALCULATING COMFORT IMPACT OF** 
**SOLAR GAIN ON OCCUPANTS**


**C1. CALCULATION PROCEDURE**



Solar gain to the human body is calculated using the effective radiant field (ERF), a measure of the net radiant energy flux to or from the human body ( _ASHRAE Handbook—Fundamentals_ [ 1], Chapter 9). ERF is
expressed in W/m [2] (Btuh/ft [2] ), where “area” refers to body surface area. The surrounding surface temperatures of a space are expressed as mean radiant temperature _tr_, which equals long-wave mean radiant temperature _trlw_ when no solar radiation is present. The ERF on the human body from long-wave exchange
with surfaces is related to _t_ by



ace are expressed as mean radiant temperature _tr_

_trlw_ when no solar r



_trlw_



ERF = _feff hr_  _trlw_ - _ta_ 



(C-1)



where _feff_ is the fraction of the body surface exposed to radiation from the environment (= 0.696 for a seated
person and 0.725 for a standing or horizontal person), _hr_ is the radiation heat transfer coefficient (W/m [2] ·K

[Btuh/ft [2] ·°F]), and _ta_ is the air temperature (°C [°F]).

The energy flux actually absorbed by the body is ERF times the long-wave absorptivity  _LW_ of skin and
clothing (0.95 is the default value for skin and clothing).

Solar radiation absorbed on the body’s surface can be equated to an additional amount of long-wave flux,
ERF _solar_ :



 _LW_ ERF _solar_ =  _SWEsolar_



(C-2)



where _Esolar_ is the short-wave solar radiant flux on the body surface (W/m [2] [Btuh/ft [2] ]) and  _SW_ is shortwave absorptivity.

_Esolar_ is the sum of three fluxes that have been filtered by fenestration properties and geometry and are
distributed on the occupant body surface: diffuse solar energy coming from the sky vault ( _Ediff_ ), solar energy
reflected upward from the floor ( _Erefl_ ), and direct-beam solar energy coming directly from the sun ( _Edir_ ).
These fluxes are defined below.



_Ediff_ = 0.5 _feff_ _fsvvTsol Idiff_



(C-3)



where _fsvv_ is the fraction of sky vault in the occupant’s view (see Figure C-1); _Idiff_ is diffuse sky irradiance
received on an upward-facing horizontal surface (W/m [2] [Btuh/ft [2] ]); and _Tsol_ is the total solar transmittance,
the ratio of incident short-wave radiation to the total short-wave radiation passing through the glazing unit
and shades of a window system.

The reflected radiation from natural and built surfaces protruding above the horizon is assumed to equal
the _Idiff_ they have blocked.

The total outdoor solar radiation on the horizontal is filtered by both _Tsol_ and _fsvv_ and multiplied by the
reflectance of the floor and lower furnishings _Rfloor_ .



_Erefl_ = 0.5 _feff_ _fsvvTsol ITH_ _Rfloor_



(C-4)



where _ITH_ is the total horizontal direct and diffuse irradiance outdoors (W/m [2 ] [Btuh/ft [2] ]), and the floor
reflectance _Rfloor_ is 0.6.

Direct radiation is incident only on the projected fraction of the body _fp_, which depends on solar altitude
, the sun’s horizontal angle relative to the front of the person (SHARP), and posture (seated, standing, horizontal). The _fp_ values are tabulated in the computer program in Section C4.

The direct radiation is also reduced by any shading of the body provided by the indoor surroundings,
quantified by the body exposure fraction _fbes_ (see Figure C-2).



_Edir_ = _fp feff fbes Tsol Idir_



(C-5)



_Idir_ is the direct-beam (normal) solar radiation (W/m [2 ] [Btuh/ft [2] ]). The meteorological radiation parameters are related as follows:



_ITH_ = _Idir_ sin  + _Idiff_
_Idiff_ is approximated as (0.2 Idir).

ERF _solar_ is therefore calculated from the following equation:

ERF _solar_ =  0.5 _fsvv_  _Idiff_ + 0.6 _ITH_  + _fp fbes Idir_   _feff Tsol_  _SW_   _LW_ 



(C-6)



28 ANSI/ASHRAE Standard 55-2023
