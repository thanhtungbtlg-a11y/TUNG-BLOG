---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 272
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 272

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=272]]

## Extracted Content

_b_ =


_c_ =



---------------------------------------------------- **-** - 1
  _o_ 21 -  _o_ 22  _Yc_  12 



----------------------------------------------- **-**
  _o_ 21 -  _o_ 22  _Yc_  12



 _o_ 2 _W_ 2
 _o_ 2 -  _o_ 2
1 2



 _o_ 1 _W_ 1 +  _o_ 2 _W_ 2



2 -  _o_ 2

1 2



 _o_ 2
1



2 -  _o_ 2

1 2



Select the smaller value of _Y_ 2, _a_ and _Y_ 2, _b_ as _Y_ 2. _Y_ 1 shall be calculated as the difference between _Yc_ and _Y_ 2.
Next, the _R-values_ for the two compressed layers of insulation shall be calculated and converted to a _U-factor_ .
This process shall be repeated along the entire profile and the results numerically integrated using maximum
0.04167 ft increments.
It is important to note that Equation A9.4-14 does not apply when the two layers of insulation are the
same material. In this case, each compressed layer has the same thickness, which simplifies the _U-factor_ calculations. The numerical integration still needs to be completed to determine the _Uco_ .

**Step 3:** Determine the _U-factor_ over the structural framing member. The variable _Yo_ represents the thickness of the thermal spacer block and the thickness of the compressed insulation. The density of the compressed insulation is determined by Equation A9.4-16:



 _c_



=  --------- _oto_
_tc_



where

 _c_ = density of the compressed insulation over the framing member, lb/ft [3]

_tc_ = thickness of the compressed insulation over the framing member, ft
The _thermal resistance_ of the compressed insulation is determined by Equation A9.4-17:



(A9.4-16)


(A9.4-17)



_Rc_



= ------------------------------------- _tc_ **-**
_A_ + _B_  _c_ + _C_   _c_



Determine the overall framing _U-factor_ ( _Ufo_ ) at the structural framing member, including the air film
resistances, using Equation A9.4-18:



_Ufo_



1
= ------------------------------------------- **-**
_RTB_ + _Rc_ + _Ri_ + _Re_



(A9.4-18)



where
_Ufo_ = _U-factor_ over the structural framing member, Btu/h·ft [2] ·°F
_RTB_ = _R-value_ of the thermal spacer block, h·ft [2] ·°F/Btu
_Rc_ = _R-value_ of the compressed insulation, h·ft [2] ·°F/Btu
**Step 4:** Determine the overall area-weighted _U-factor_ for the entire system using Equation A9.4-19:



_Ues_



= _L_ --------------------------------------------------------  _Uco_ +  _wf_  2   _Ufo_
_L_ +  _wf_  2 



where
_Ues_ = area-weighted _U-factor_ for the entire system, Btu/h·ft [2] ·°F

**Step 5:** Calculate the adjusted overall _U-factor_ ( _Uadj_ ) using Equation A9.4-20:



(A9.4-19)


(A9.4-20)



_Uadj_



1
= --------------------------------------------------0.8676  _Ues_ + 1.1423



where
_Uadj_ = adjusted overall _U-factor_ represented by correlation with the finite element modeling, Btu/h·ft [2] ·°F
**Step 6:** If there is any _continuous insulation_ present, calculate the overall _U-factor_ using Equation A9.4-21:



_Uo_



1
= ---------------------- **-**
1
-------- _Uadj_ **-** + _Rci_



(A9.4-21)



**A9.4.6.3 Single-Layer in Cavity and Double-Layer Walls.** The _U-factor_ of _metal building walls_ that
are insulated with a single-layer in cavity or multiple layers of mineral fiber insulation (see Figure A9.4.6.3)
shall be calculated using the procedure outlined in this section. For double-layer _walls_, the procedure
assumes that the outer layer of insulation is compressed between the _wall_ panel and girt. There may also be


270 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
