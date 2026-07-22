---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 379
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-90.1-2022- - Page 379

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=379]]

## Extracted Content

f. For a _building_ model with multiple blocks, each block facade input shall provide adequate information to
identify the outside boundary condition (outside, inside to adjacent block, ground contact, or adiabatic)
of each facade or portion of each facade that match the actual _proposed design_ .


_**Informative Note:**_ The _simulation program_ may _automatically_ identify the adjacent block facade outside boundary conditions through a graphic input process.

**L2.2.2 Building Envelope Components.** _Building envelope_ thermal properties used in the _proposed_
_design_ shall be based on the actual _proposed design_ using documented user-defined values and shall comply
with all of the following:


a. Where different _roof_ thermal properties are present in a single block, an area-weighted _U-factor_ shall be

used.
b. Where different _wall_ constructions exist on the facade of a block, an area-weighted _U-factor_ shall be used.
c. Where different _below-grade wall_ constructions exist in a block, an area-weighted _C- factor_ shall be used.
d. Where different _floor_ constructions exist in the block _,_ an area-weighted _U-factor_ shall be used.
e. Where different _slab-on-grade floor_ constructions exist in a block, an area-weighted _F-factor_ shall be used.
f. Where different vertical _fenestration_ types or sill heights exist, area-weighted sill heights, _U-factor_, and
_SHGC_ values shall be used.
g. Where different _skylight_ types exist, area-weighted _U-factor_ and _SHGC_ values shall be used.
h. Permanent shading devices such as overhangs shall be modeled only if >50% of the area of vertical _fen-_

_estration_ on a facade is shaded by the same.


**L2.2.3 HVAC System Components.** The _HVAC_ _system_ parameters shall be provided for the _proposed_
_design_ at _design conditions_ unless otherwise stated with clarifications and simplifications as described in
Table L2.2.3 and as follows:


a. All _HVAC zones_ within a block shall be served by the same _HVAC_ _system_ type as listed in Table L.1.1.1.
b. Where multiple _system_ components serve a block, average values weighted by the appropriate metric as

described in Section L2.2.3.1 shall be used.
c. The Table L2.2.3 parameter requirements are based on input of full-load. _equipment efficiencies_ with

adjustment using part-load curves integrated in the _simulation program_ . Where other approaches to partload adjustment are used, it is permitted for specific input parameters to vary.


_**Informative Note:**_ Table L2.2.3 includes both user-defined parameters and parameters that are fixed in
the _simulation program_ and may not be changed by the user. They are maintained in one table here so related
items can be viewed together in context.

**L2.2.3.1 Proposed Building HVAC System Aggregation.** Projects using the Mechanical System Performance Rating Method shall comply with all the following requirements.


a. Where multiple fan _systems_ serve a single block, fan power shall be based on weighted average using the

design supply air (cfm).
b. Where multiple cooling _systems_ serve a single block, _COP_ shall be based on a weighted average using

cooling capacity. DX coils shall be entered as multistage if more than 50% of coil capacity serving the
block is multistage with staged controls.
c. Where multiple heating _systems_ serve a single block, thermal _efficiency_ or heating _COP_ shall be based

on a weighted average using heating capacity.
d. Where multiple _boiler_ s or chillers serve a heating-water or chilled-water loop, _efficiency_ shall be based

on a weighted average for using heating or cooling capacity.
e. When multiple cooling towers serving a condenser water loop are combined, the cooling tower _effi-_

_ciency_, cooling tower design approach, and design range are based on a weighted average of the design
water flow rate through each cooling tower.
f. Where multiple _pumps_ serve a heating-water, chilled-water, or condenser water loop, _pump_ power shall
be based on a weighted average for using design water flow rate.
g. When multiple _system_ types with and without economizers are combined, the economizer maximum _out-_

_door air_ fraction of the combined _system_ shall be based on weighted average of 100% supply air for _sys-_
_tems_ with economizers and design _outdoor air_ for _systems_ without economizers.
h. Multiple _systems_ with and without ERVs cannot be combined.
i. _Systems_ with and without supply air temperature _reset_ cannot be combined.
j. _Systems_ with different fan control (constant volume, multispeed, or _VAV_ ) for supply fans cannot be combined.


ANSI/ASHRAE/IES Standard 90.1-2022 (I-P) 377
