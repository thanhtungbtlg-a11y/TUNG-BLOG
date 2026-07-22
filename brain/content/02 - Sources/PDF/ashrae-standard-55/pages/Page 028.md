---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 28
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 028

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=28]]

## Extracted Content

**(This is a normative appendix and is part of this standard.)**


**NORMATIVE APPENDIX B**
**COMPUTER PROGRAM FOR CALCULATION OF PREDICTED MEAN VOTE (PMV)**

The following code is one implementation of the PMV calculation using JavaScript in SI units. This calculation does not include discomfort risk due to local discomfort factors. The input variable “clo” in the PMV
function shall be calculated using the following equation:

clo = _Icl_ × (0.6 + 0.4/ _M_ ) for _M_  1.2

clo = _Icl_ for _M_ < 1.2

where _M_ is the metabolic rate in met units and _Icl_ is the clothing insulation.

The input variable _Vel_ in the PMV function is the sum of the average air speed ( _V_ ) plus the activitygenerated air speed ( _Vag_ ) caused by motion of individual body parts (m/s). It is a function of metabolic
rate and is added to the average air speed to determine convective cooling of the body. _Vag_ is assumed to
be 0 for metabolic rates equal and lower than 1 met and otherwise equal to


for _M_      - 1 met.


pmv = function(ta, tr, vel, rh, met, clo, wme) {
/*

returns [pmv, ppd]
ta, air temperature (°C)
tr, mean radiant temperature (°C)
vel, average air speed (Va)+ activity-generated air speed (Vag)(m/s)
rh, relative humidity (%) Used only this way to input humidity level
met, metabolic rate (met)
clo, clothing (clo)
wme, external work, normally around 0 (met)
*/
var pa, icl, m, w, mw, fcl, hcf, taa, tra, tcla, p1, p2, p3, p4, p5,
xn, xf, eps, hcn, hc, tcl, hl1, hl2, hl3, hl4, hl5, hl6, ts, pmv,
ppd, n;


pa = rh * 10 * exp(16.6536 – 4030.183 / (ta + 235));
icl = 0.155 * clo; //Thermal insulation of the clothing in M2K/W
m = met * 58.15; //Metabolic rate in W/M2
w = wme * 58.15; //External work in W/M2
mw = m – w; //Internal heat production in the human body


if (icl <= 0.078) fcl = 1 + (1.29 * icl);
else fcl = 1.05 + (0.645 * icl);


//Heat transf. coeff. by forced convection
hcf = 12.1 * sqrt(vel);
taa = ta + 273;
tra = tr + 273;
tcla = taa + (35.5 – ta) / (3.5 * icl + 0.1);
p1 = icl * fcl;
p2 = p1 * 3.96;
p3 = p1 * 100;
p4 = p1 * taa;
p5 = 308.7 – 0.028 * mw + p2 * pow(tra / 100, 4);
xn = tcla / 100;
xf = tcla / 50;
eps = 0.00015;
n = 0;


while (abs(xn – xf) > eps) {

xf = (xf + xn) / 2;


26 ANSI/ASHRAE Standard 55-2023
