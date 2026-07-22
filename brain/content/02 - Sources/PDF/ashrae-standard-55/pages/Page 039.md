---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 39
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 039

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=39]]

## Extracted Content

**Table D-1 Validation Table for SET Computer Model (for a standing person)**





|Temperature|MRT|Air Speed|RH|met|clo|SET|
|---|---|---|---|---|---|---|
|**°C**<br>**°F**|**°C**<br>**°F**|**m/s**<br>**fpm**|**%**|**%**|**%**|**°C**<br>**°F**|
|25<br>77<br>0<br>32<br>10<br>50<br>15<br>59<br>20<br>68<br>30<br>86<br>40<br>104<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77|25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>10<br>50<br>40<br>104<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77<br>25<br>77|0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.1<br>19.7<br>0.6<br>118.1<br>1.1<br>216.5<br>3<br>590.6<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5<br>0.15<br>29.5|50<br>50<br>50<br>50<br>50<br>50<br>50<br>10<br>90<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50<br>50|1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>1<br>0.8<br>2<br>4|0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.5<br>0.1<br>1<br>2<br>4<br>0.5<br>0.5<br>0.5|23.8<br>74.9<br>12.1<br>53.7<br>16.8<br>62.3<br>19.2<br>66.5<br>21.5<br>70.7<br>26.4<br>79.5<br>34.1<br>93.8<br>23.3<br>73.9<br>24.8<br>76.6<br>24.0<br>75.2<br>21.3<br>70.4<br>20.2<br>68.4<br>18.7<br>65.6<br>15.3<br>59.6<br>31.6<br>88.9<br>20.7<br>69.3<br>27.2<br>81.0<br>32.4<br>90.3<br>37.8<br>99.7<br>23.3<br>73.9<br>25.9<br>78.7<br>30.4<br>86.8|


**D4. COMPUTER PROGRAM FOR CALCULATION OF SET**

The following code is one implementation of the SET calculation using JavaScript in SI units. If the following code is used to calculate the cooling effect as described in Normative Appendix D, the input parameter
CALCULATE_CE should be set equal to “true.” Alternatively, if it is used to calculate the SET temperature,
CALCULATE_CE should be set to “false.”


FindSaturatedVaporPressureTorr = function(T) {

/* Helper function for pierceSET calculates Saturated Vapor Pres

sure(Torr)at Temperature T (°C) */


return Math.exp(18.6686 - 4030.183/(T + 235.0));
}
pierceSET = function(TA, TR, VEL, RH, MET, CLO, WME, PATM, 

CALCULATE_CE=false, BODY_POSITION) {


/* Input variables - TA (air temperature): °C,

TR (mean radiant temperature): °C,
VEL (air speed): m/s, RH (relative humidity): %,
MET: met unit
CLO: clo unit
WME (external work): W/m [2],
PATM (atmospheric pressure): kPa
BODY_POSITION (body position): “sitting or standing”*/


ANSI/ASHRAE Standard 55-2023 37
