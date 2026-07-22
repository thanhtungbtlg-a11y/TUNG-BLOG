---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 273
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 273

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=273]]

## Extracted Content

a thermal spacer block or _continuous insulation_ present. Air spaces may also exist depending on the specific
drape profiles.

There are nine steps in the calculation process:


- Step 1—Characterize the thermal conductivity of the mineral fiber insulation.

- Step 2—Define the parabolic profiles for each insulation layer.

- Step 3—Calculate the _R-values_ for insulation and air spaces in cavity both outside and inside insulation
layers, including air films.

- Step 4—Calculate the _R-value_ inside the girt and adjacent to the web.

- Step 5—Calculate the _R-value_ outside the girt.

- Step 6—Add the _R-values_ inside and outside the girt, including air films.

- Step 7—Calculate the overall insulation assembly using the _R-values_ in Steps 3 and 6.

- Step 8—Calculate the _U-factor_ from the finite element analysis results.

- Step 9—Calculate the _U-factor_ for any _continuous insulation_ if present.


**Step 1:** The thermal conductivity of the mineral fiber insulation is represented by a thermal curve of the
form in Equation A9.4-22:



(A9.4-22)



= _A_ + _B_ --------- _o_ **-** _o_ + _C_ --------- _y_ **-**
_y_  _o_  _o_



_k_ = _A_ + _B_



 _o_  _o_



where
_k_ = thermal conductivity, Btu·ft/h·ft [2] ·°F
 - = nominal density, lb/ft [3]

 - = nominal thickness, ft
_y_ = thickness of insulation, ft
_A_ = 0.014917
_B_ = 0.0004377
_C_ = 0.0056897
**Step 2:** Assume that each layer of mineral fiber has a parabolic profile defined by Equation A9.4-23:



---------------- _y_ - _Yo_ **-** = ----- _x_  2 - ----- _x_ 
_Ym_ - _Yo_ _xm_  _xm_ 



(A9.4-23)



where
_x_ = distance from edge of girt, ft
_y_ = distance from edge of _wall_ panel, ft
_Yo_ = insulation thickness at _x_ = 0, ft
_Ym_ = insulation thickness at _x_ = _Xm_, ft
**Step 3:** Calculate _R-values_ for the insulation and air spaces in the cavity both inside and outside insulation layers, including air films.

Because the configuration can possibly consist of both mineral fiber insulation and an air space, the composite is given by Equation A9.4-24:


#### R = ---- x 1 a  x 0 a  k ---- ya + Y ------------- mk – y


_xa_  ---- _y_ + _Y_ ------------- _m_ - _y_ **-**  dx + ------------ _Ym_ **-**

0  _ka_ _k_  _k_  _Ym_ 



1 _xa_
#### = ---- 



 ---- _y_ + ------------- _m_ **-**  dx
 _k_ _k_ 



(A9.4-24)



where _ka_ is the thermal conductivity of air in Btu·ft/h·ft [2] ·°F.

The trapezoidal integration method is used to evaluate the integral and calculate _R_ and is given by Equation A9.4-25:



_b_
####  f  x dx

_a_


####  12 [-] [-]  Nk = 1  xk + 1 – xk  yk + yk + 1 



(A9.4-25)



where
_xk_ = point to analyze along the _x_ -axis, ft
_xk_ +1 = point ahead of the point being analyzed, ft
_yk_ = thickness at point being analyzed, ft
_yk_ +1 = thickness at point ahead of the point being analyzed, ft


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 271
