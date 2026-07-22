---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 363
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 363

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=363]]

## Extracted Content

**Table J-3 Chiller Performance Curves References**













|Chiller<br>Condenser<br>Type|Output<br>Variable a|Curve<br>Type b|X c|Y c|Minimum/<br>Maximum<br>Value for<br>X (I-P °F)|Minimum/<br>Maximum<br>Value for<br>Y (I-P °F)|Rated Values<br>for X/Y<br>(I-P °F)|
|---|---|---|---|---|---|---|---|
|Air|EIR-f-T|T1|CHWT|OAT|39/60|55/126|44/95|
|Air|CAP-f-T|T1|CHWT|OAT|39/60|55/126|44/95|
|Air|EIR-f-PLR|T3|PLR||0/1||1|
|Water<br>Water|EIR-f-T<br>CAP-f-T|T1<br>T1|CHWT<br>CHWT|ECT<br>ECT|39/60<br>39/60|55/104<br>55/104|44/85<br>44/85|
|Water|EIR-f-PLR|T2|PLR||0/1||1|


a. EIR-f-T is the energy input ratio modifier as a function of temperatures; CAP-f-T is the capacity modifier as a function of temperatures; and EIR-f-PLR



is the energy input ratio modifier as a function of the chiller’s part load ratio.
b. T1: Output = Coeff1 + Coeff2 × _X_ + Coeff3 × _X_ [2] + Coeff4 × _Y_ + Coeff5 × _Y_ [2] + Coeff6 × _X_ × _Y_



T2 _:_ Output = Coeff1 + Coeff2 × _X_ + Coeff3 × _X_ [2]



T3: Output = Coeff1 + Coeff2 × _X_ + Coeff3 × _X_ [2] + Coeff4 × _X_ [3]



c. CHWT : chilled-water temperature

OAT: outdoor-air dry-bulb temperature
ECT: entering condenser temperature
PLR: part-load ratio = load at a given simulation time step/available capacity at given simulation time step


**Table J-4 Chiller Performance Curves for Section 12 (Simulation Input Required in I-P units)**






|Set|Description|Output<br>Variable|Coeff 1|Coeff 2|Coeff 3|Coeff 4|Coeff 5|Coeff 6|
|---|---|---|---|---|---|---|---|---|
|A|Air-cooled <150 tons,<br>10.100 FL, 13.700<br>_IPLV_.IP Path A|EIR-f-T|1.777758|–0.038258|0.000431|–0.005368|0.000118|–0.000115|
|A|Air-cooled <150 tons,<br>10.100 FL, 13.700<br>_IPLV_.IP Path A|CAP-f-T|–1.347697|0.070674|–0.000566|0.016793|–0.000104|–0.000076|
|A|Air-cooled <150 tons,<br>10.100 FL, 13.700<br>_IPLV_.IP Path A|EIR-f-PLR|0.087789|0.185696|1.561411|–0.832304|||
|B|Air-cooled ≥150 tons,<br>10.100 FL, 14.00<br>_IPLV_.IP Path A|EIR-f-T|1.872341|–0.041886|0.000442|–0.006710|0.000123|–0.000086|
|B|Air-cooled ≥150 tons,<br>10.100 FL, 14.00<br>_IPLV_.IP Path A|CAP-f-T|–1.153535|0.075066|–0.000622|0.009777|–0.000071|–0.000057|
|B|Air-cooled ≥150 tons,<br>10.100 FL, 14.00<br>_IPLV_.IP Path A|EIR-f-PLR|0.118081|0.107477|1.570838|–0.794051|||
|C|Liquid-cooled positive<br>displacement <75 tons<br>0.750 FL, 0.600<br>_IPLV_.IP Path A|EIR-f-T|2.001725|–0.044957|0.000484|–0.008296|0.000168|–0.000125|
|C|Liquid-cooled positive<br>displacement <75 tons<br>0.750 FL, 0.600<br>_IPLV_.IP Path A|CAP-f-T|–0.907598|0.073300|–0.000653|0.003700|–0.000054|0.000006|
|C|Liquid-cooled positive<br>displacement <75 tons<br>0.750 FL, 0.600<br>_IPLV_.IP Path A|EIR-f-PLR|0.243730|0.165972|0.586099||||
|D|Liquid-cooled positive<br>displacement ≥75 and<br><150 tons 0.720 FL,<br>0.560_IPLV_.IP Path A|EIR-f-T|1.679306|–0.041960|0.000456|–0.002081|0.000128|–0.000125|
|D|Liquid-cooled positive<br>displacement ≥75 and<br><150 tons 0.720 FL,<br>0.560_IPLV_.IP Path A|CAP-f-T|–0.857791|0.074596|–0.000670|0.001523|–0.000042|0.000012|
|D|Liquid-cooled positive<br>displacement ≥75 and<br><150 tons 0.720 FL,<br>0.560_IPLV_.IP Path A|EIR-f-PLR|0.208982|0.224001|0.561479||||
|E|Liquid-cooled positive<br>displacement ≥150 and<br><300 tons 0.660 FL,<br>0.540_IPLV_.IP Path A|EIR-f-T|1.136125|–0.034608|0.000401|0.008006|0.000058|–0.000131|
|E|Liquid-cooled positive<br>displacement ≥150 and<br><300 tons 0.660 FL,<br>0.540_IPLV_.IP Path A|CAP-f-T|–0.424942|0.047087|–0.000458|0.006232|–0.000070|0.000058|
|E|Liquid-cooled positive<br>displacement ≥150 and<br><300 tons 0.660 FL,<br>0.540_IPLV_.IP Path A|EIR-f-PLR|0.246644|0.184576|0.566463||||
|F|Liquid-cooled positive<br>displacement ≥300 and<br><600 tons 0.610 FL,<br>0.520_IPLV_.IP Path A|EIR-f-T|1.161349|–0.040557|0.000431|0.013567|0.000003|–0.000103|
|F|Liquid-cooled positive<br>displacement ≥300 and<br><600 tons 0.610 FL,<br>0.520_IPLV_.IP Path A|CAP-f-T|0.012766|0.033086|–0.000350|0.004004|–0.000061|0.000083|
|F|Liquid-cooled positive<br>displacement ≥300 and<br><600 tons 0.610 FL,<br>0.520_IPLV_.IP Path A|EIR-f-PLR|0.244926|0.218890|0.532972||||
|G|Liquid-cooled positive<br>displacement ≥600<br>tons 0.560 FL, 0.500<br>_IPLV_.IP Path A|EIR-f-T|0.874461|–0.041390|0.000430|0.022262|–0.000058|–0.000097|
|G|Liquid-cooled positive<br>displacement ≥600<br>tons 0.560 FL, 0.500<br>_IPLV_.IP Path A|CAP-f-T|0.122304|0.024081|–0.000293|0.006302|–0.000081|0.000116|
|G|Liquid-cooled positive<br>displacement ≥600<br>tons 0.560 FL, 0.500<br>_IPLV_.IP Path A|EIR-f-PLR|0.264371|0.263302|0.471690||||



ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 361
