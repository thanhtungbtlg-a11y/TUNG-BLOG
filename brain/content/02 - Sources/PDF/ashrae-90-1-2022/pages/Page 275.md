---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 275
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 275

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=275]]

## Extracted Content

**Step 4:** Calculate the _R-values_ inside the girt and adjacent to the web.
The _R-values_ inside the girt are the air space (RAUP) added in series with the insulation (R2UP); their
combined value is then added in parallel to RPUP. Depending on the thickness of the air space, it can be
modeled as conduction as shown in Equation A9.4-31:



_H_ 3
RAUP = ------
_ka_



(A9.4-31)



where
_H_ 3 = thickness of the air space, ft
_ka_ = thermal conductivity of air, Btu·ft/h·ft [2] ·°F
When appropriate, the air space can be modeled as convection, which is a constant R-0.92 h·ft [2] ·°F/Btu
for _walls_ .

The _R-value_ for R2UP is expressed in Equation A9.4-32. The insulation thickness is also not limited by
the girt height and can extend beyond it.



_H_ 4
R2UP =



= ----------------------------------------------


(A9.4-32)



+ _B_ --------- **-** + _C_ --------- **-**

_H_ 4  _o_  _o_



_A_ + _B_



 _o_  _o_



--------- _o_ **-** _o_ + _C_ --------- _[H]_ [4]
_H_ 4  



where _H_ 4 is the thickness of the mineral fiber at _x_ = 0 in feet.

The _R-value_ of the web (RPUP) is calculated using 26.2 h·ft [2] ·°F/Btu as the thermal conductivity of the
girt in Equation A9.4-33:



Web Height
RPUP = --------------------------- **-**

_kp_



(A9.4-33)



where
_kp_ = thermal conductivity of the girt, Btu·ft/h·ft [2] ·°F
Web Height = height of the girt, ft
The addition of the air space and insulation in series are combined to be in parallel with the girt, which is
expressed as Equation A9.4-34:



----------- _Lf_ = ----------------------------------- _Lf_                                 - _tp_ **-** + ------------- _tp_ **-**
RUP RAUP + R2UP RPUP

Equation A9.4-34 can be rearranged and solved for RUP as presented in Equation A9.4-35:


 RAUP + R2UP  RPUP
RUP = ---------------------------------------------------------------------------------------  _Lf_        - _tp_  RPUP + _tp_  RAUP + R2UP  _Lf_



(A9.4-34)


(A9.4-35)



Because the thickness of the girt is significantly less than the flange width ( _Lf_ ), Equation A9.4-35 can be
simplified as Equation A9.4-36. However it is important to note that RUP will be close to 2 or lower
(depending on how the air is modeled) because of the significant effects of the steel girt:



 RAUP + R2UP  RPUP
RUP = ------------------------------------------------------------------------ _Lf_ RPUP + _tp_  RAUP + R2UP  _Lf_



(A9.4-36)



**Step 5:** Calculate the _R-value_ outside the girt.
Typical _construction_ above the girt consists of a thermal spacer block and compressed mineral fiber insulation. These two insulations are in series, and the total _R-value_ ( _ROPI_ ) is expressed as Equation A9.4-37. If
there is thermal break tape present it is included as the third insulation in this series.



(A9.4-37)



_ROPI_



= ------- + ------
_kf_ _kI_



_H_ 1



_H_ 1 _H_ 2

------- + ------_kf_ _kI_



where
_H_ 1 = thickness of thermal spacer block, ft
_H_ 2 = thickness of compressed mineral fiber insulation, ft
_kf_ = thermal conductivity of the thermal spacer block, Btu·ft/h·ft [2] ·°F
_kI_ = thermal conductivity of the compressed mineral fiber insulation, Btu·ft/h·ft [2] ·°F


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 273
