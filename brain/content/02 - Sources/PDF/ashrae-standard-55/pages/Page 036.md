---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 36
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 036

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=36]]

## Extracted Content

[0.288,0.332,0.298,0.29,0.264,0.222,0.177],

[0.274,0.326,0.294,0.289,0.252,0.214,0.177],

[0.254,0.308,0.28,0.276,0.241,0.202,0.177],

[0.23,0.282,0.262,0.26,0.233,0.193,0.177],

[0.216,0.26,0.248,0.244,0.22,0.186,0.177],

[0.234,0.258,0.236,0.227,0.208,0.18,0.177],

[0.262,0.26,0.224,0.208,0.196,0.176,0.177],

[0.28,0.26,0.21,0.192,0.184,0.17,0.177],

[0.298,0.256,0.194,0.174,0.168,0.168,0.177],

[0.306,0.25,0.18,0.156,0.156,0.166,0.177],

[0.3,0.24,0.168,0.152,0.152,0.164,0.177]];
}
var fp11 = fp_table[sharp_i][alt_i];
var fp12 = fp_table[sharp_i][alt_i+1];
var fp21 = fp_table[sharp_i+1][alt_i];
var fp22 = fp_table[sharp_i+1][alt_i+1];
var sharp1 = sharp_range[sharp_i];
var sharp2 = sharp_range[sharp_i+1];
var alt1 = alt_range[alt_i];
var alt2 = alt_range[alt_i+1];


//Bilinear interpolation
fp = fp11 * (sharp2 - sharp) * (alt2 - alt);
fp += fp21 * (sharp - sharp1) * (alt2 - alt);
fp += fp12 * (sharp2 - sharp) * (alt - alt1);
fp += fp22 * (sharp - sharp1) * (alt - alt1);
fp /= (sharp2 - sharp1) * (alt2 - alt1);
return fp;
}



function ERF(alt, sharp, posture, Idir, tsol, fsvv, fbes, asa){



/* ERF function to estimate the impact of solar radiation on occupant



comfort



INPUTS:



alt: altitude of sun in degrees [0, 90]
sharp: sun’s horizontal angle relative to person in degrees [0,

180]
posture: posture of occupant ('seated', 'standing', or 'horizon


tal')
Idir: direct beam intensity (normal)
tsol: total solar transmittance (SC * 0.87)
fsvv: sky vault view fraction: fraction of sky vault in occupant's



view [0, 1]
fbes: fraction body exposed to sun [0, 1]
asa: average shortwave absorptivity of body [0, 1] (alpha_sw) */
var DEG_TO_RAD = 0.0174532925;
var hr = 6;
var Idiff = 0.2 * Idir;
var fp = get_fp(alt, sharp, posture);



if (posture=='standing' || posture == 'horizontal'){



var feff = 0.725;
} else if (posture=='seated'){



var feff = 0.696;
} else {



console.log("Invalid posture (choose seated or seated)");
return;
}



var sw_abs = asa;
var lw_abs = 0.95;


34 ANSI/ASHRAE Standard 55-2023
