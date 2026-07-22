---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 276
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 276

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=276]]

## Extracted Content

The impact of the thermal bridging associated with the outside of the girt and the insulation is to reduce
the _thermal resistance_ of the insulation. The reduction is calculated using Equation A9.4-38:



(A9.4-38)



1 + ---------------------------- _Lf_



_ROP_ = _ROPI_



1



**Step 6** : Add the _R-values_ inside and outside the girt including air films.
The total _thermal resistance_ associated with the girt is the sum of the _R-values_ inside and outside the girt
as shown in Equation A9.4-39:



_RTP_ = _RUP_ + _ROP_



(A9.4-39)



The next calculation is to add the inside and _outdoor air_ film coefficients using Equation A9.4-40:



_RTP_ + _air_ = _RTP_ + _RAB_ + _RAT_

**Step 7:** Calculate the overall insulation assembly using the _R-values_ in Steps 3 and 6.
The overall insulation system _R-value_ is determined using Equation A9.4-41:



_Rinsul_ - _sys_



= --------------------------------------------------------------  2 _L_ 1 + _Lf_  _RBP_ + _airRTP_ + _air_ **-**
2 _L_ 1 _RTP_ + _air_ + _LfRBP_ + _air_



**Step 8:** Calculate the _U-factor_ from the finite element analysis results.
The overall _U-factor_ for the insulation assembly is determined using Equation A9.4-42:



(A9.4-40)


(A9.4-41)


(A9.4-42)



_Uadj_



1
= ---------------------------------------------------------- **-**
0.8627 _Rinsul_  - _sys_ + 1.132



where
_Uadj_ = adjusted overall _U-factor_ represented by the correlation with the finite element modeling in Btu/
h·ft [2] ·°F.
**Step 9:** Calculate the overall _U-factor_ for any _continuous insulation_ if present.
If there is any _continuous insulation_ present, first calculate the _R-value_ adjacent to the flange using
Equation A9.4-43:



= _R_ ----------------------------


_RBFci_ = _Rci_



1 + 2--------------  _hci_ 



1



(A9.4-43)



+ ------------- _Lf_



where
_RBFci_ = _thermal resistance_ of _continuous insulation_ adjacent to the flange, h·ft [2] ·°F/Btu
_Rci_ = _thermal resistance_ of the _continuous insulation_, h·ft [2] ·°F/Btu
_hci_ = thickness of the _continuous insulation_, ft
Next, calculate the area-weighted _R-value_ for the _continuous insulation_ using Equation A9.4-44:



_Roci_



=  ---------------------------------------------2 _L_ 1 + _Lf_  _RBPciRci_
2 _L_ 1 _RBPci_ + _LfRci_



where
_Roci_ = overall _thermal resistance_ of _continuous insulation_ in h·ft [2] ·°F/Btu
Finally, calculate the overall _U-factor_ using Equation A9.4-45:



(A9.4-44)


(A9.4-45)



_Uo_



1
= -------------------------1
-------- _Uadj_ **-** + _Roci_



**A9.4.7 Insulated Metal Panels.** _U-factors_ of _insulated metal panels_ shall be determined by two- or threedimensional finite difference or finite volume computer models or by testing in accordance with Section
A9.3.2 and shall include panel side joints.


**A10. THERMAL BRIDGING CHI FACTORS AND PSI FACTORS**

**A10.1 Determination of Psi-Factors and Chi-Factors.** _Psi-factor_ (ψ) and _chi-factor_ (χ) values representative of an as-designed _thermal bridging_ condition shall be determined in accordance with one of the following:


274 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
