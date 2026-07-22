---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 270
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 270

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=270]]

## Extracted Content

![[02 - Sources/PDF/ashrae-90-1-2022/assets/page-270-269-0.png]]

**Figure A9.4.6.2-1 Geometry of double layers of fiberglass batts.**

where
X = distance from edge of purlin or girt, ft
Y = distance from edge of _roof_ panel or _wall_ panel, ft
L = length from edge of purlin or girt to centerline of cavity, ft
wf = width of purlin or girt flange, ft
Yo = distance between purlin or girt and the _roof_ panel or _wall_ panel, ft
Ym = distance from edge of _roof_ panel or _wall_ panel at the cavity centerline, ft


**Step 4:** Determine the overall area-weighted _U-factor_ for the entire system using Equation A9.4-9:



_Ues_



= _L_ ------------------------------------------------------  _Uco_ +  _wf_  2   _Ufo_ **-**
_L_ +  _wf_  2 



where

_Ues_ = area-weighted _U-factor_ for the entire system, Btu/h·ft [2] ·°F

_wf_ = width of purlin or girt flange, ft

**Step 5:** Calculate the adjusted overall _U-factor_ ( _Uadj_ ) using Equation A9.4-10:



(A9.4-9)


(A9.4-10)



_Uadj_



1
= --------------------------------------------------0.8676  _Ues_ + 1.1423



where

_Uadj_ = adjusted overall _U-factor_ represented by correlation with the finite element modeling, Btu/h·ft [2] ·°F

**Step 6:** If there is any _continuous insulation_ present, calculate the overall _U-factor_ using Equation A9.4-11:



1
_U_ = ---------------------- **-**
1
-------- _Uadj_ **-** + _Rci_



(A9.4-11)



**A9.4.6.2 Double-Layer Roof.** The _U-factor_ of _metal building roofs_ that are insulated with double layers
of fiberglass insulation (see Figure A9.4.6.2-1) shall be calculated using the procedure outlined in this section. The procedure assumes the insulation is compressed over the purlin and there may be a thermal spacer
block present.

There are six steps in the calculation process:


     - Step 1—Characterize the thermal conductivity of the fiberglass.

     - Step 2—Determine the _U-factor_ for the insulation in the cavity.

     - Step 3—Determine the _U-factor_ over the structural framing member.

     - Step 4—Area weight the _U-factors_ calculated in Steps 2 and 3.

     - Step 5—Determine the _U-factor_ from the finite element analysis results.

     - Step 6—Determine the _U-factor_ for any _continuous insulation_ if present.


**Step 1:** The thermal conductivity of the fiberglass batt insulation is represented by a thermal curve of the
form in Equation A9.4-12:


268 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
