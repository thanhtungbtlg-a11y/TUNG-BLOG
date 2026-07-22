---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 288
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 288

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=288]]

## Extracted Content

**C3.5.2 Model Geometry and Thermal Zones.** The _building_ model shall be divided into thermal zones
described as follows:


a. Determine the ratio ( _Rc_ ) of the _floor_ area to the _gross wall area_ for each unique combination of _space_

_conditioning category_ and _building_ area type. The index “c” refers to a combination of _space condition-_
_ing category_ and _building_ area type as defined for each surface.
b. Create a perimeter zone for each unique combination of _building_ area type, _above_      - _grade_      - _wall_ _orienta-_

_tion_, and _space conditioning category_ . If there is more than one _above_       - _grade_       - _wall_ assembly for a _build-_
_ing_ area type and _orientation_, each _above_       - _grade_       - _wall_ assembly shall be placed end-to-end in the order it
is defined. The area of each perimeter zone shall be the _gross wall area_ of the zone times _Rc_ or 1.25,
whichever is smaller.
c. For each unique combination of _space conditioning category_ and _building_ area type with _Rc_ greater than

1.25, interior zones shall be created and used in the trade-off procedure. The area of the interior zone
shall be the total area for the unique combination of _space conditioning category_ and _building_ area type
less the area of the perimeter zones for that combination of _space conditioning category_ and _building_
area type.
d. Create a below- _grade_ zone for each unique combination of _space conditioning category_ and _building_

area type associated with _below-grade walls_ . If there is more than one _below_       - _grade_       - _wall_ assembly for a
_building_ area type, each below- _grade_       - _wall_ assembly shall be placed end-to-end in the order it is defined.
The area of each below- _grade_ zone shall be the _gross wall area_ of the zone times _Rc_ or 1.25, whichever
is smaller.
e. The _wall_ height and the height of each thermal zone shall be 15 ft.
f. _Roof_ area and _floor_ area associated with each _building_ area type shall be prorated among all zones of the
corresponding _building_ area type in proportion to the zone area of each zone. _Roof_ area and _floor_ area in
each zone shall be centered in the horizontal plane of the zone with the same aspect ratio as the horizontal plane of the zone.
g. _Slab-on-grade floor_ perimeter associated with each _building_ area type shall be prorated among perimeter

zones of the corresponding _building_ area type in proportion to the area of each zone.
h. _Vertical fenestration area_ shall be assigned to the associated surface as described in Section C1.4. _Verti-_

_cal fenestration_ shall be centered on the associated surface with the same aspect ratio as the associated
surface. Windows with equivalent _U-factor_, _SHGC_, and _VT_ that do not include fins may be combined
into a single window on the associated surface.
i. _Skylight_ area shall be assigned to the associated surface as described in Section C1.4 and Figure C1.4,
prorated among interior zones containing the _roof_ area with which the _skylight_ area is associated, in proportion to the associated _roof_ area. If the total _skylight_ area exceeds the associated _roof_ area in interior
zones, the remaining _skylight_ area shall be prorated among perimeter zones containing the _roof_ area with
which the _skylight_ area is associated, in proportion to the associated _roof_ area.
j. Each zone shall be modeled as being fully enclosed. Zone boundaries not created as described above
shall be modeled as adiabatic interior surfaces.


**C3.5.3 Daylight Area and Photosensor Location.** _Daylight areas_ and _photosensors_ shall not be modeled
in _residential_ zones. In each _nonresidential_ zone, _daylight areas_ and _photosensor_ locations shall be modeled
in accordance with the following:


a. For each _nonresidential_ zone associated with _vertical fenestration_, the _daylight area_ shall be modeled as

directly adjacent to the _vertical fenestration_ with a width equal to the width of the _vertical fenestration_
and a depth equal to the head height of the _vertical fenestration_ .
b. In each _nonresidential_ zone associated with _skylights_, the _daylight area under skylights_ shall be modeled

as bounded, in each direction, by the edge of the _skylight_ area plus 10 ft or the distance to the edge of the
zone, whichever is less.
c. For each _daylight area_ associated with _vertical fenestration_, a _photosensor_ shall be modeled as located at

the center of the width of the _daylight area_, at the depth of the _daylight area_ and at a height of 3 ft.
d. For each _daylight area_ associated with a _skylight_, a _photosensor_ shall be modeled as located at the center

of the horizontal plane of the _skylight_ and at a height of 5 ft.


**C3.5.4 Schedules.** The schedule types listed in Section C3.1.1(c) shall be required input. The schedules
shall be consistent with those in the _building envelope trade-off schedules and loads_ [1] for the applicable
_building_ area type.


1 Schedules and internal loads by _building_ area type are found at http://sspc901.ashraepcs.org/documents.php.


286 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)
