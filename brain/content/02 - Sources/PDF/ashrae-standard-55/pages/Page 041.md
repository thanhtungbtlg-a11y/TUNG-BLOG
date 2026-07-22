---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 41
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 041

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=41]]

## Extracted Content

var TCL_OLD = TCL;
var flag = true;
var DRY, HFCS, ERES, CRES, SCR, SSK, TCSK, TCCR, DTSK, DTCR, TB,
SKSIG, WARMS, COLDS, CRSIG, WARMC, COLDC, BDSIG, WARMB, COLDB,
REGSW, ERSW, REA, RECL, EMAX, PRSW, PWET, EDIF, ESK;

for (var TIM = 1; TIM <= LTIME; TIM++) { //Begin iteration

do {
if (flag) {

TCL_OLD = TCL;
if (BODY_POSITION === "sitting") {

// 0.7 ratio between radiation area of the body and
// the body area
CHR = 4.0 * 0.95 * SBC * Math.pow(((TCL + TR)/2.0 + 273.15),

3.0) *0.7;
}else {// if standing

// 0.73 ratio between radiation area of the body and
// the body area
CHR = 4.0 * 0.95 * SBC * Math.pow(((TCL + TR)/2.0 + 273.15),

3.0) *0.73;
CTC = CHR + CHC;

RA = 1.0/(FACL * CTC);*/Resistance of air layer to dry heat
transfer*/
TOP = (CHR * TR + CHC * TA)/CTC;
}
TCL = (RA * TempSkin + RCL * TOP)/(RA + RCL);
flag = true;
}
while (Math.abs(TCL - TCL_OLD) > 0.01);

flag = false;
DRY = (TempSkin - TOP)/(RA + RCL);
HFCS = (TempCore - TempSkin) * (5.28 + 1.163 * SkinBloodFlow);
ERES = 0.0023 * M * (44.0 - VaporPressure);
CRES = 0.0014 * M * (34.0 - TA);
SCR = M - HFCS - ERES - CRES - WME;
SSK = HFCS - DRY - ESK;
TCSK = 0.97 * ALFA * BODYWEIGHT;
TCCR = 0.97 * (1 - ALFA) * BODYWEIGHT;
DTSK = (SSK * BODYSURFACEAREA)/(TCSK * 60.0); //°C/min
DTCR = SCR * BODYSURFACEAREA/(TCCR * 60.0);  //°C/min
TempSkin = TempSkin + DTSK;
TempCore = TempCore + DTCR;
TB = ALFA * TempSkin + (1 - ALFA) * TempCore;
SKSIG = TempSkin - TempSkinNeutral;

if (SKSIG > 0) {

WARMS = SKSIG;
COLDS = 0.0;
}
else {

WARMS = 0.0;
COLDS = -1.0 * SKSIG;
}
CRSIG = (TempCore - TempCoreNeutral);

if (CRSIG > 0) {

WARMC = CRSIG;
COLDC = 0.0;
}

else {

WARMC = 0.0;
COLDC = -1.0 * CRSIG;
}


ANSI/ASHRAE Standard 55-2023 39
