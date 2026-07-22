---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 31
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 031

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=31]]

## Extracted Content

To obtain ERF _solar_ with Equation C-6 and the fixed default values given above, the required inputs are
_fsvv_, _Idir_, _fbes_, _Tsol_,  _SW_, , posture, and the sun’s horizontal angle relative to person (SHARP). These are
described further in Section C2.

ERF _solar_ is converted to short-wave mean radiant temperature _trsw_ using Equation C-1.

**C2. INPUTS TO CALCULATION PROCEDURE**

The calculation requires eight input values as listed in Table C-2 and explained below.



a. Short-wave absorptivity  _SW_ : The short-wave absorptivity of the occupant will range widely, depending

on the color of the occupant’s skin as well as the color and amount of clothing covering the body. A
value of 0.7 shall be used unless more specific information about the clothing or skin color of the occupants is available. ( _**Informative Note:**_ Short-wave absorptivity typically ranges from 0.57 to 0.84,
depending on skin and clothing color. More information is available in Blum [ 4] .
b. Sky-vault view fraction _fsvv_ : The sky-vault view fraction ranges between 0 and 1 as shown in Table C-3. It

is calculated with Equation C-7 for windows to one side. This value depends on the dimensions of the
window (width _w_, height _h_ ) and the distance _d_ between the occupant and the window.



_fsvv_



tan– [1]  ---- _h_ **-**  tan– [1]  ---- _w_ **-** 
 2 _d_   2 _d_ 

= ------------------------------------------------90  180



(C-7)



where the arctan function returns values in degrees. When calculating _fsvv_ for multiple windows, the _fsvv_
for each may be calculated and summed to obtain a total _fsvv_ . Exterior objects obstructing the sky vault
shall not be considered because they have a similar diffuse reflectivity as the sky vault.
c. Total solar transmittance _Tsol_ : The total solar transmittance of window systems, including glazing unit,

blinds, and other façade treatments, shall be determined using one of the following methods:
1. Glazing unit _Tsol_ shall be provided by manufacturer or from the National Fenestration Rating Council
approved Lawrence Berkeley National Lab International Glazing Database.
2. Glazing unit plus interior fabric shade shall be calculated as the product of glazing unit _Tsol_ (in item
C2[a]) multiplied by the shade openness factor.
3. Glazing unit plus venetian blinds or other complex or unique shades shall be calculated using
National Fenestration Rating Council approved software or Lawrence Berkeley National Lab Complex Glazing Database.

When direct solar radiation that falls on a representative occupant is transmitted through more than one
window system with differing solar transmittances, the solar transmittance _Tsol_ impinging on the occupant
shall be calculated as the area-weighted average of the solar transmittance of each window system.
d. Direct-beam solar radiation _Idir_ : Direct-beam solar radiation data for a standard cloudless atmosphere are

presented in Table C-4. ( _**Informative Note:**_ _Idir_ is based on elevation above sea level up to 900 m [3000 ft].
Above 900 m [3000 ft], increase these values 12%; above 1200 m (4000 ft) increase values 15%; above
1500 m [5000 ft], increase values 18%; and above 1800 m [6000 ft], increase values 21%.
e. Fraction of the body exposed to solar beam radiation _fbes_ : The fraction of the body’s projected area factor _fp_

that is not shaded by the window frame, interior or exterior shading, or interior furniture. See Figure C-2.
f. Solar altitude  : Solar altitude ranges from 0 degrees (horizon) to 90 degrees (zenith). Also called “solar
elevation.” See Figure C-3.
g. Solar horizontal angle relative to the front of the person (SHARP): Solar horizontal angle relative to the

front of the person ranges from 0 to 180 degrees and is symmetrical on either side. Zero (0) degrees represents direct-beam radiation from the front, 90 degrees represents direct-beam radiation from the side,
and 180 degrees represent direct-beam radiation from the back. SHARP is the angle between the sun and
the person only. Orientation relative to compass or to room is not included in SHARP. See Figure C-3.
h. Posture: Inputs are “seated,” “standing,” or “horizontal.”


ANSI/ASHRAE Standard 55-2023 29
