---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 43
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 043

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=43]]

## Extracted Content

var ICLS = IMS * CHCS/CTCS * (1 - FCLS)/(CHCS/CTCS - FCLS * IMS);
var RAS = 1.0/(FACLS * CTCS);
var REAS = 1.0/(LR * FACLS * CHCS);
var RECLS = RCLS/(LR * ICLS);
var HD_S = 1.0/(RAS + RCLS);
var HE_S = 1.0/(REAS + RECLS);


//SET determined using Newton’s iterative solution

var DELTA = .0001;
var dx = 100.0;
var SET, ERR1, ERR2;
var SET_OLD = TempSkin - HSK/HD_S; //Lower bound for SET
while (Math.abs(dx) > .01) {
ERR1 = (HSK - HD_S * (TempSkin - SET_OLD) - W * HE_S *

(PSSK - 0.5 * FindSaturatedVaporPressureTorr(SET_OLD)));
ERR2 = (HSK - HD_S * (TempSkin - (SET_OLD + DELTA)) - W * HE_S *

PSSK - 0.5 * FindSaturatedVaporPressureTorr((SET_OLD +
DELTA)));
SET = SET_OLD - DELTA * ERR1/(ERR2 - ERR1);
dx = SET - SET_OLD;
SET_OLD = SET;
}
return SET;
}


ANSI/ASHRAE Standard 55-2023 41
