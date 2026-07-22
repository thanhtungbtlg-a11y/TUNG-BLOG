---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 35
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-Standard-55 - Page 035

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=35]]

## Extracted Content

function radians_to_degrees(radians) {

const pi = Math.PI;
return radians * (180 / pi);
}


function degrees_to_radians(degrees) {
const pi = Math.PI;
return degrees * (pi / 180);
}


function get_fp(alt, sharp, posture){
/* This function calculates the projected sunlit fraction (fp) given

a seated or standing posture, a solar altitude, and a solar horizontal angle relative to the person (SHARP). fp values are taken
from Thermal Comfort, Fanger 1970, Danish Technical Press.


alt : altitude of sun in degrees [0, 90] (beta) Integer
sharp : sun’s horizontal angle relative to person in degrees [0,
180] Integer */



if (posture == "horizontal") {
//transpose alt and sharp for a horizontal person



const altitude_new = radians_to_degrees(



Math.asin(



Math.sin(degrees_to_radians(Math.abs(sharp - 90))) *
Math.cos(degrees_to_radians(alt))
)
);
sharp = radians_to_degrees(



Math.atan(



Math.sin(degrees_to_radians(sharp)) *
Math.tan(degrees_to_radians(90 - alt))
)
);



alt = altitude_new;
}


var fp;
var alt_range = [0, 15, 30, 45, 60, 75, 90];
var sharp_range = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,

180];
var alt_i = find_span(alt_range, alt);
var sharp_i = find_span(sharp_range, sharp);



if (posture == 'standing'|| posture == 'horizontal'){



var fp_table = [[0.35,0.35,0.314,0.258,0.206,0.144,0.082],




[0.342,0.342,0.31,0.252,0.2,0.14,0.082],

[0.33,0.33,0.3,0.244,0.19,0.132,0.082],

[0.31,0.31,0.275,0.228,0.175,0.124,0.082],

[0.283,0.283,0.251,0.208,0.16,0.114,0.082],

[0.252,0.252,0.228,0.188,0.15,0.108,0.082],

[0.23,0.23,0.214,0.18,0.148,0.108,0.082],

[0.242,0.242,0.222,0.18,0.153,0.112,0.082],

[0.274,0.274,0.245,0.203,0.165,0.116,0.082],

[0.304,0.304,0.27,0.22,0.174,0.121,0.082],

[0.328,0.328,0.29,0.234,0.183,0.125,0.082],

[0.344,0.344,0.304,0.244,0.19,0.128,0.082],

[0.347,0.347,0.308,0.246,0.191,0.128,0.082]];
} else if (posture == 'seated'){



var fp_table = [[0.29,0.324,0.305,0.303,0.262,0.224,0.177],




[0.292,0.328,0.294,0.288,0.268,0.227,0.177],



ANSI/ASHRAE Standard 55-2023 33
