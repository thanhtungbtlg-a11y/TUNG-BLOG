---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 40
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-Standard-55 - Page 040

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=40]]

## Extracted Content

var KCLO = 0.25;
var BODYWEIGHT = 69.9; //kg
var BODYSURFACEAREA = 1.8258; //m [2]
var METFACTOR = 58.2; //W/m [2]
var SBC = 0.000000056697; //Stefan-Boltzmann constant (W/m [2] K4)
var CSW = 170.0;
var CDIL = 200;
var CSTR = 0.5;
var LTIME = 60.0;
var VaporPressure = RH * FindSaturatedVaporPressureTorr(TA)/100.0;
var AirSpeed = Math.max(VEL, 0.1);
var TempSkinNeutral = 33.7;
var TempCoreNeutral = 36.8;
var TempBodyNeutral = 36.49;
var SkinBloodFlowNeutral = 6.3;
var TempSkin = TempSkinNeutral; //Initial values
var TempCore = TempCoreNeutral;
var SkinBloodFlow = SkinBloodFlowNeutral;
var MSHIV = 0.0;
var ALFA = 0.1;
var ESK = 0.1 * MET;
var PressureInAtmospheres = PATM * 0.009869;
var RCL = 0.155 * CLO;
var FACL = 1.0 + 0.15 * CLO;
var LR = 2.2/PressureInAtmospheres; /* Lewis Relation is 2.2 at sea

level */
var RM = MET * METFACTOR;
var M = MET * METFACTOR;


if (CLO <= 0) {

var WCRIT = 0.38 * Math.pow(AirSpeed, -0.29);
var ICL = 1.0;
}
else {

var WCRIT = 0.59 * Math.pow(AirSpeed, -0.08);
var ICL = 0.45;
}
let heatTransferConvMet;
if (MET < 0.85) {

heatTransferConvMet = 3.0;
}
else {

heatTransferConvMet = 5.66 * Math.pow(MET - 0.85, 0.39);
}
let CHC = 3.0 * Math.pow(PressureInAtmospheres, 0.53);
let CHCV = 8.600001 * Math.pow(AirSpeed * PressureInAtmospheres,

0.53);
CHC = Math.max(CHC, CHCV);
if (!CALCULATE_CE) {

CHC = Math.max(CHC, heatTransferConvMet);
}
var CHR = 4.7;
var CTC = CHR + CHC;
var RA = 1.0/(FACL * CTC); /* Resistance of air layer to dry heat

transfer */
var TOP = (CHR * TR + CHC * TA)/CTC;
var TCL = TOP + (TempSkin - TOP)/(CTC * (RA + RCL));
/* TCL and CHR are solved iteratively using: H(Tsk - TOP) = 

CTC(TCL - TOP), where H = 1/(RA + RCL) and RA = 1/FACL*CTC */


38 ANSI/ASHRAE Standard 55-2023
