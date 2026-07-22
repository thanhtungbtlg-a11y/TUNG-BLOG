---
type: source-page
source_document: "[[ASHRAE+62.1-2022+(1) - Source Note]]"
page: 67
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE+62.1-2022+(1) - Page 067

![[99 - Attachments/Sources/ASHRAE+62.1-2022+(1).pdf#page=67]]

## Extracted Content

**Table K-1 Ventilation Intensity Brackets**


**Bracket** **(L/s)·m** **[2]** **cfm/ft** **[2]** **Commonly Encountered Space Typologies Bracket**


1 0.0 to 1.0 0.0 to 0.2 Office, living room, main entry lobby


2 1.0 to 2.0 0.2 to 0.4 Reception area, general manufacturing, kitchen, lobby


3 2.0 to 3.0 0.4 to 0.6 Classroom, daycare


4 3.0 to 4.0 0.6 to 0.8 Restaurant dining room, places of religious worship


5 4.0 to 5.5 0.6 to 1.1 Auditorium, health club/aerobics room, bar, gambling


Not addressed: Lecture Hall and spectator areas (6 [L/s])/m [2] ) and disco/dance floors (10.3 [L/s]/m [2] )


**K3. PRESCRIPTIVE PATH A CALCULATIONS**


**K3.1 Ventilation Intensity.** Spaces have been defined by a ventilation intensity, which represents the
amount of flow rate needed per Equation 6-1, divided by the floor area of the space. Its units are (L/s)/m [2] of
floor area or cfm/ft [2] of floor area.



(K-1)



Ventilation Intensity



= ------- = ---------------------------------------- **-**

_Az_ _Az_



------- _Vbz_ = ---------------------------------------- _Rp_  _Pz_ + _Ra_  _A_ **-** _z_
_Az_ _Az_



_Vbz_



The ventilation intensity brackets in Table K-1 are used.

**K3.2 Single Openings.** The flow through a single sharp opening due to bidirectional buoyancy-driven flow
( _Vbd_sharp_ ) (see Etheridge and Sandberg [1996] in Informative Appendix P) is expressed as follows:





(K-2)



where

_Aw_ = free unobstructed area of the window, or openable area

 _T_ = temperature difference between indoors and outdoors. Given the conservative nature of a prescriptive
path, a temperature difference of 1°C (1.8°F) is assumed for these calculations. In reality, this
temperature will depend on the internal gains in the space and will likely be higher than 1°C (1.8°F),
leading to higher airflows (and a smaller window area requirement).

_Hs_ = vertical dimension of the opening

_g_ = gravity constant

_Tref_ = reference temperature in Kelvin (or Rankine), typically equal to _Tin_, _Tout_ or an expected average. A
reference temperature of 21°C (70°F, 294K) was assumed for these calculations.


A safety factor is incorporated assuming that an awning window is used. Awning (or top-hinged) windows are among the most common windows used for natural ventilation and, because of their uneven vertical area distribution, are more inefficient than a sliding window (sharp opening) at driving flow. An
efficiency (  _v_ ) of around 83% (value used in these calculations) when compared to sliding windows is
inferred from



_Vso_ = _Vso_ _ _sharp_   _w_



(K-3)



Assuming a height-to-width ratio for the window of _RH/W_ ( _R_ = _H/W_ ), the window area can be rewritten as



2



(K-4)



_Aw_



= ---------- **-**
_RH_ / _W_



_HS_ 2



The required openable area as a fraction of the zone’s floor area is therefore calculated by equating the
bidirectional buoyancy-driven flow through a single awning opening ( _Vso_ ) to the goal flow rate ( _Vbz_ )
obtained from Table 6-1.



_Vso_ = _Vbz_



(K-5)



ANSI/ASHRAE Standard 62.1-2022 65
