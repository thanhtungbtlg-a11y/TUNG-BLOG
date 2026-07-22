---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 29
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 029

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=29]]

## Extracted Content

hcn = 2.38 * pow(abs(100.0 * xf – taa), 0.25);
if (hcf > hcn) hc = hcf;
else hc = hcn;
xn = (p5 + p4 * hc – p2 * pow(xf, 4)) / (100 + p3 * hc);

++n;
if (n > 150) {
alert('Max iterations exceeded');
return 1;
}
}
tcl = 100 * xn – 273;


//Heat loss diff. through skin
hl1 = 3.05 * 0.001 * (5733 – (6.99 * mw) – pa);


//Heat loss by sweating
if (mw > 58.15) hl2 = 0.42 * (mw – 58.15);
else hl2 = 0;


//Latent respiration heat loss
hl3 = 1.7 * 0.00001 * m * (5867 – pa);


//Dry respiration heat loss
hl4 = 0.0014 * m * (34 – ta);


//Heat loss by radiation
hl5 = 3.96 * fcl * (pow(xn, 4) – pow(tra / 100, 4));


//Heat loss by convection
hl6 = fcl * hc * (tcl – ta);
ts = 0.303 * exp(–0.036 * m) + 0.028;
pmv = ts * (mw – hl1 – hl2 – hl3 – hl4 – hl5 – hl6);
ppd = 100.0 – 95.0 * exp(–0.03353 * pow(pmv, 4.0) – 0.2179 * pow(pmv,

2.0));


var r = {}
r.pmv = pmv;
r.ppd = ppd;
return r
}


**Validation Table**

|Run|Air Temp.|Col3|RH|Radiant Temp.|Col6|Air Speed|Col8|met|clo|PMV|
|---|---|---|---|---|---|---|---|---|---|---|
|**#**|** °F**|**C**|**%**|**°F**|**C**|**fpm**|**m/s**|**m/s**|**m/s**|**m/s**|
|1|67.3|19.6|86|67.3|19.6|20|0.10|1.1|1|–0.47|
|2|75.0|23.9|66|75.0|23.9|20|0.10|1.1|1|0.48|
|3|78.2|25.7|15|78.2|25.7|20|0.10|1.1|1|0.53|
|4|70.2|21.2|20|70.2|21.2|20|0.10|1.1|1|–0.48|
|5|74.5|23.6|67|74.5|23.6|20|0.10|1.1|0.5|–0.47|
|6|80.2|26.8|56|80.2|26.8|20|0.10|1.1|0.5|0.52|
|7|82.2|27.9|13|82.2|27.9|20|0.10|1.1|0.5|0.50|
|8|76.5|24.7|16|76.5|24.7|20|0.10|1.1|0.5|–0.49|



_**Note:**_ In every case listed above, the PMV result corresponds to a calculated PPD of 10%.


ANSI/ASHRAE Standard 55-2023 27
