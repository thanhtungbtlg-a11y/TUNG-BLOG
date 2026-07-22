---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 57
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-Standard-55 - Page 057

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=57]]

## Extracted Content

**(This appendix is not part of this standard. It is merely informative and does not contain requirements**
**necessary for conformance to the standard. It has not been processed according to the ANSI require-**
**ments for a standard and may contain material that has not been subject to public review or a consen-**
**sus process. Unresolved objectors on informative material are not offered the right to appeal at**
**ASHRAE or ANSI.)**


**INFORMATIVE APPENDIX J**
**OCCUPANT-CONTROLLED NATURALLY CONDITIONED SPACES**

For the purposes of this standard, occupant-controlled naturally conditioned spaces (see Section 5.4) are
those spaces where the thermal conditions of the space are regulated primarily by the occupants through
opening and closing of fenestration in the envelope. Field experiments have shown that occupants’ thermal
responses in such spaces depend in part on the outdoor climate and may differ from thermal responses in
buildings with centralized HVAC systems, primarily because of the different thermal experiences, changes
in clothing, availability of control, and shifts in occupant expectations. This optional method is intended for
such spaces.

In order for this optional method to apply, the space in question must be equipped with operable fenestration to the outdoors that can be readily opened and adjusted by the occupants of the space.

It is permissible to use mechanical ventilation with unconditioned air. Opening and closing of fenestration must be the primary means of regulating the thermal conditions in the space. It is permissible for the
space to be provided with a heating and/or cooling system, but this optional method does not apply when the
heating and/or cooling system is in operation. It applies only to spaces where the occupants are engaged in
near-sedentary physical activities, with metabolic rates ranging from 1.0 to 1.3 met. This optional method
applies only to spaces where the occupants are free to adapt their clothing to the indoor and/or outdoor thermal conditions. The permitted range of acceptable clothing must be at least as broad as 0.5 to 1.0 clo. Table
J-1 shows example clothing ensembles that achieve 0.5 clo or lower.

For spaces that meet these criteria, it is acceptable to determine the allowable indoor operative temperatures _to_ from Figure 5-9. This figure includes two sets of operative temperature limits, one for 80% satisfaction and one for 90% satisfaction. The 80% satisfaction limits are for typical applications. It is acceptable to
use the 90% satisfaction limits when a higher standard of thermal comfort is desired. Figure 5-9 is based on
an adaptive model of thermal comfort that is derived from a global database of 21,000 measurements taken
primarily in office buildings.

The input variable in the adaptive model in Figure 5-9 is prevailing mean outdoor air temperature



~~_t_~~ _pma_  _out_ 



~~_t_~~ _pma_  _out_  _._ This temperature is based on the arithmetic average of the mean daily outdoor temperatures over

some period of days. It represents the broader external climatic environment to which building occupants
have become physiologically, behaviorally, and psychologically adapted. At its simplest, _tpma_  _out_  can be
approximated by the climatically normal monthly mean air temperature from the most representative local
meteorological station available. However, because days in the more remote past have less influence on the
building occupants’ comfort temperature than more recent days, Equation J-1 should be used to calculate



_tpma_  _out_ 



_tpma_  _out_ 



:



_tpma_  _out_  =  1 -  _te_  _n_ - 1  +  _trm_  _n_ - 1 



(J-1)



where _te_ ( _n_ - 1) is the mean daily outdoor temperature for the day before the day in question, _trm_ ( _n_ - 1) is the
running mean temperature for the day before the day in question ( _n_ - 1), and  is a constant between 0 and 1
that controls the speed at which the running mean responds to changes in weather (outdoor temperature).
Recommended values for  are between 0.9 and 0.6, corresponding to a slow- and fast-response running
mean, respectively. See Figure J-1 for examples. Adaptive comfort theory suggests that a slow-response running mean (  = 0.9) could be more appropriate for climates in which synoptic-scale (day-to-day) temperature dynamics are relatively minor, such as the humid tropics. But for midlatitude climates, where people are
more familiar with synoptic-scale weather variability, a lower value of  could be more appropriate. For
example, if  = 0.7, the prevailing mean outdoor temperature for today would be 30% of yesterday’s mean
daily outdoor temperature plus 70% of yesterday’s running mean outdoor temperature. This form of the
equation advances the value of the running mean from one day to the next and is convenient both for computer algorithms and for manual calculations. A value for running mean temperature has to be assumed for
day one in order to seed the sequence, but from there it can be calculated with Equation J-1. The running
mean may be initiated seven days prior to the start of the period of interest, and the actual daily mean outdoor temperature can be used for that first day to seed the sequence.

The allowable operative temperature _to_ limits in Figure 5-9 may not be extrapolated to outdoor temperatures above and below the end points of the curves in this figure. If the prevailing mean outdoor temperature


ANSI/ASHRAE Standard 55-2023 55
