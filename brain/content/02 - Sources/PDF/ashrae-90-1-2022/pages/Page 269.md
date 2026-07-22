---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 269
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 269

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=269]]

## Extracted Content

_C_
_k_ = _A_ + _B_  +

[--]  **[-]**


where
_k_ = thermal conductivity, Btu/h·ft·°F
 = density, lb/ft [3]

_A_ = 0.014917
_B_ = 0.0004377
_C_ = 0.0056897
**Step 2:** Assume the fiberglass batt forms a parabolic profile defined by Equation A9.4-3:


  _X_ 

_Y_ = _Yo_ +  _Ym_             - _Yo_  _[X]_ [---] _L_  2             - [---] _L_ 


Determine the cavity _U-factor_ ( _Uc_ ) using Equation A9.4-4:



(A9.4-2)


(A9.4-3)


(A9.4-4)



_B_  _oto_





_Uc_



 _oto_ 2 _YoYm_







 _Ym_ - _Yo_ 
 1 + ---------------- **-** 
 --------------------------- _Ym_ 
 1 - _Y_ ---------------- _m_ - _Y_ **-** _o_ 
 _Y_ 



1 + _Y_ ---------------- _m_ - _Y_ **-** _o_

--------------------------- _Ym_

1 - _Y_ ---------------- _m_ - _Y_ **-** _o_



+ ---------------- **-**

--------------------------- _Ym_

- _Y_ ---------------- _m_ - _Y_ **-** _o_
_Ym_



where
 _o_ = reference density of the fiberglass, lb/ft [3]

_to_ = reference thickness of the fiberglass, ft
The properties of fiberglass insulation are presented in Table A9.4.6.1.
Include the _thermal resistance_ s of the interior ( _Ri_ ) and exterior ( _Re_ ) air films to calculate the overall cavity _U-factor_ ( _Uco_ ) using Equation A9.4-5:



_Uco_



1
= -----------------------------1
---- _U_ **-** _c_ + _Ri_ + _Re_



(A9.4-5)



**Step 3:** Determine the _U-factor_ ( _Ufo_ ) over the structural framing member. The variable _Yo_ represents the
total combined thickness of the thermal spacer block and the compressed insulation. The density of the compressed insulation is determined by Equation A9.4-6:



 _c_



=  --------- _oto_
_tc_



where

 _c_ = density of the compressed insulation over the framing member, lb/ft [3 ]
_tc_ = thickness of the compressed insulation over the framing member, ft
Determine the _thermal resistance_ of the compressed insulation ( _Rc_ ) using Equation A9.4-7:



(A9.4-6)


(A9.4-7)



_Rc_



= ------------------------------------- _tc_ **-**
_A_ + _B_  _c_ + _C_   _c_



Determine the overall framing _U-factor_ ( _Ufo_ ) at the structural framing member, including the air film
resistances, using Equation A9.4-8:



_Ufo_



1
= -------------------------------------------_RTB_ + _Rc_ + _Ri_ + _Re_



(A9.4-8)



where
_Ufo_ = _U-factor_ over the structural framing member, Btu/h·ft [2] ·°F
_RTB_ = _R-value_ of the thermal spacer block, h·ft [2] ·°F/Btu
_Rc_ = _R-value_ of the compressed insulation, h·ft [2] ·°F/Btu


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 267
