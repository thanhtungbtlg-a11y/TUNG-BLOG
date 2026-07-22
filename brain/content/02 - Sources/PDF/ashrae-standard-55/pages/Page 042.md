---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 42
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-Standard-55 - Page 042

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=42]]

## Extracted Content

BDSIG = TB - TempBodyNeutral;
WARMB = (BDSIG > 0) * BDSIG;
SkinBloodFlow = (SkinBloodFlowNeutral + CDIL * WARMC)/(1 + CSTR

         - COLDS);
SkinBloodFlow = Math.max(0.5, Math.min(90.0, SkinBloodFlow));
REGSW = CSW * WARMB * Math.exp(WARMS/10.7);
REGSW = Math.min(REGSW, 500.0);
var ERSW = 0.68 * REGSW;
//Evaporative resistance of air layer
var REA = 1.0/(LR * FACL * CHC);


//Evaporative resistance of clothing (icl=.45)
var RECL = RCL/(LR * ICL);
var EMAX = (FindSaturatedVaporPressureTorr(TempSkin)
VaporPressure)/(REA + RECL);
var PRSW = ERSW/EMAX;
var PWET = 0.06 + 0.94 * PRSW;
var EDIF = PWET * EMAX - ERSW;
var ESK = ERSW + EDIF;
if (PWET > WCRIT) {

PWET = WCRIT;
PRSW = WCRIT/0.94;
ERSW = PRSW * EMAX;
EDIF = 0.06 * (1.0 - PRSW) * EMAX;
ESK = ERSW + EDIF;

}
if (EMAX < 0) {
EDIF = 0;
ERSW = 0;
PWET = WCRIT;
PRSW = WCRIT;
ESK = EMAX;

}
ESK = ERSW + EDIF;
MSHIV = 19.4 * COLDS * COLDC;
M = RM + MSHIV;
ALFA = 0.0417737 + 0.7451833/(SkinBloodFlow + 0.585417);
} //End iteration


var HSK = DRY + ESK; //Total heat loss from skin
var RN = M - WME; //Net metabolic heat production
var ECOMF = 0.42 * (RN - (1 * METFACTOR));
if (ECOMF < 0.0) ECOMF = 0.0; //From Fanger
EMAX = EMAX * WCRIT;
var W = PWET;
var PSSK = FindSaturatedVaporPressureTorr(TempSkin);
var CHRS = CHR; //Definition of ASHRAE std. environment, denoted “S”
CHCS = 3.0 * Math.pow(PressureInAtmospheres, 0.53);


if (!CALCULATE_CE && MET > 0.85) {

CHCS = Math.max(CHCS, heatTransferConvMet);
}


if (CHCS < 3.0) CHCS = 3.0;
var CTCS = CHCS + CHRS;
var RCLOS = 1.52/((MET - WME/METFACTOR) + 0.6944) - 0.1835;
var RCLS = 0.155 * RCLOS;
var FACLS = 1.0 + KCLO * RCLOS;
var FCLS = 1.0/(1.0 + 0.155 * FACLS * CTCS * RCLOS);
var IMS = 0.45;


40 ANSI/ASHRAE Standard 55-2023
