---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 37
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 037

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=37]]

## Extracted Content

var E_diff = 0.5 * feff * fsvv * tsol * Idiff;

var E_direct = fp * feff * fbes * tsol * Idir;

var E_refl = 0.5 * feff * fsvv * tsol * (Idir * Math.sin(alt *

DEG_TO_RAD) + Idiff) * 0.6;

var E_solar = E_diff + E_direct + E_refl;

var ERF = E_solar * (sw_abs / lw_abs);

var trsw = ERF / (hr * feff);


return {"ERF": ERF, "trsw": trsw};

}


**C4. COMPUTER CODE VALIDATION TABLE**


**Table C4-1 Computer Code Validation Table**

|alt|sharp|posture|Idir|tsol|fsvv|fbes|asa|ERF|trsw|
|---|---|---|---|---|---|---|---|---|---|
|0|120|Seated|800|0.5|0.5|0.5|0.7|43.3|10.4|
|60|120|Seated|800|0.5|0.5|0.5|0.7|63.2|15.1|
|90|120|Seated|800|0.5|0.5|0.5|0.7|65.3|15.6|
|30|0|Seated|800|0.5|0.5|0.5|0.7|63.1|15.1|
|30|30|Seated|800|0.5|0.5|0.5|0.7|62.4|14.9|
|30|60|Seated|800|0.5|0.5|0.5|0.7|60.5|14.5|
|30|90|Seated|800|0.5|0.5|0.5|0.7|57.2|13.7|
|30|150|Seated|800|0.5|0.5|0.5|0.7|51.7|12.4|
|30|180|Seated|800|0.5|0.5|0.5|0.7|49.0|11.7|
|30|120|Standing|800|0.5|0.5|0.5|0.7|59.3|13.6|
|30|120|Seated|400|0.5|0.5|0.5|0.7|27.4|6.6|
|30|120|Seated|600|0.5|0.5|0.5|0.7|41.1|9.8|
|30|120|Seated|1000|0.5|0.5|0.5|0.7|68.5|16.4|
|30|120|Seated|800|0.1|0.5|0.5|0.7|11.0|2.6|
|30|120|Seated|800|0.3|0.5|0.5|0.7|32.9|7.9|
|30|120|Seated|800|0.7|0.5|0.5|0.7|76.7|18.4|
|30|120|Seated|800|0.5|0.1|0.5|0.7|29.3|7.0|
|30|120|Seated|800|0.5|0.3|0.5|0.7|42.1|10.1|
|30|120|Seated|800|0.5|0.7|0.5|0.7|67.5|16.2|
|30|120|Seated|800|0.5|0.5|0.1|0.7|36.4|8.7|
|30|120|Seated|800|0.5|0.5|0.3|0.7|45.6|10.9|
|30|120|Seated|800|0.5|0.5|0.7|0.7|64.0|15.3|
|30|120|Seated|800|0.5|0.5|0.5|0.3|23.5|5.6|
|30|120|Seated|800|0.5|0.5|0.5|0.5|39.1|9.4|
|30|120|Seated|800|0.5|0.5|0.5|0.9|70.4|16.9|
|30|120|Seated|800|0.5|0.5|0.5|0.7|54.8|13.1|
|45|0|Horizontal|700|0.8|0.2|0.5|0.7|60.9|14.0|
|45|45|Horizontal|700|0.8|0.2|0.5|0.7|65.8|15.1|
|45|45|Horizontal|800|0.5|0.5|0.5|0.7|70.9|16.3|



ANSI/ASHRAE Standard 55-2023 35
