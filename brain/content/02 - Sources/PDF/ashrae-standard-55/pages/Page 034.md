---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 34
extraction_method: text
page_classification: mixed
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 034

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=34]]

## Extracted Content

![[02 - Sources/PDF/ashrae-standard-55/assets/page-034-33-0.png]]

**Figure C-3 Solar horizontal angle relative to the front of the person (SHARP) and solar altitude**  **.**


**Table C-3 Sky Vault View Fraction** _**fsvv**_ **for Single-Sided Window Geometry and Occupant Location**















|Window<br>Width, ft (m)|30 (9.1)|150<br>(45.5)|30 (9.1)|150 (45.5)|30 (9.1)|150<br>(45.5)|30 (9.1)|150<br>(45.5)|6 (1.8)|6 (1.8)|6 (1.8)|4 (1.2)|4 (1.2)|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|Window<br>Height, ft (m)|10 (3)|10 (3)|6 (1.8)|6 (1.8)|10 (3)|10 (3)|6 (1.8)|6 (1.8)|9 (2.7)|6 (1.8)|6 (1.8)|4 (1.2)|4 (1.2)|
|Distance from<br>Window to<br>Occupant, ft (m)|3.3 (1)|3.3 (1)|3.3 (1)|3.3 (1)|6 (1.8)|6 (1.8)|6 (1.8)|6 (1.8)|3.3 (1)|3.3 (1)|6 (1.8)|3.3 (1)|6 (1.8)|
|_Fsvv_|27%|31%|20%|23%|17%|21%|11%|14%|14%|11%|4%|6%|2%|


**Table C-4 Direct-Beam Solar Radiation Values for a Standard Cloudless Atmosphere, by Solar Altitude**

|5|10|20|30|40|50|60|70|80|
|---|---|---|---|---|---|---|---|---|
|210|390|620|740|810|860|890|910|920|



**C3. COMPUTER PROGRAM FOR CALCULATING COMFORT IMPACT** 
**OF SOLAR GAIN ON OCCUPANTS**

The following code is one implementation of the solar calculation using JavaScript in SI units.



function find_span(arr, x){



/* For ordered array arr and value x, find the left index of the



closed interval that the value falls in. */



for (var i = 0; i < arr.length - 1; i++){

if (x <= arr[i+1] && x >= arr[i]){
return i;
}
}
return -1;
}



32 ANSI/ASHRAE Standard 55-2023
