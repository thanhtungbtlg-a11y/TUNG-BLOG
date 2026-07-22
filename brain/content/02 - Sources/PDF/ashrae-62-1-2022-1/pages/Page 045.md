---
type: source-page
source_document: "[[ASHRAE+62.1-2022+(1) - Source Note]]"
page: 45
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE+62.1-2022+(1) - Page 045

![[99 - Attachments/Sources/ASHRAE+62.1-2022+(1).pdf#page=45]]

## Extracted Content

**(This is a normative appendix and is part of the standard.)**


**NORMATIVE APPENDIX C**
**ZONE AIR DISTRIBUTION EFFECTIVENESS: ALTERNATIVE PROCEDURES**

This appendix provides a procedure for determining zone air distribution effectiveness ( _Ez_ ) for all system
types.

_**Informative Note:**_ Table 6-4 provides default values of _Ez_ that are permitted to be used for the air distribution configurations described in the table. The reference _Ez_ value of 1 is typical of ideal mixing in the
zone. The strategy of removing contaminants or displacing contaminants from the breathing zone may result
in an effective _Ez_ value greater than unity, which is typical of stratified systems.


**C1. ZONE AIR DISTRIBUTION EFFECTIVENESS**

Zone air distribution effectiveness shall be calculated in accordance with Equation C-1:


_Ez_ = ( _Ce_                  - _Cs_ )/( _C_                  - _Cs_ ) (C-1)


where

_Ez_ _=_ zone air distribution effectiveness

_C_ _=_ average contaminant concentration at the breathing zone

_Ce_ _=_ average contaminant concentration at the exhaust

_Cs_ _=_ average contaminant concentration at the supply

**C1.1 Personalized Ventilation Systems.** For the purpose of calculating zone air distribution effectiveness
for personalized ventilation systems, the breathing zone shall be 9 ft [2] (0.8 m [2] ) centered on each occupant
with a height of 4.5 ft (1.4 m) from the floor.


**C2. MODELED AIR DISTRIBUTION SYSTEM**


**C2.1 Computational Model.** The computational fluid dynamics model for calculating zone air distribution
effectiveness shall be in accordance with the following subsections.

**C2.1.1 Computational Domain.** The computational domain shall comprise all sensible heat sources, all
major obstructions to airflow, and all air distribution devices. The calculation domain shall include all
boundary walls.

**C2.1.2 Solution Variables.** Analysis shall include the solutions for fluid flow, heat transfer, and chemical
species transport. The buoyancy (gravitational) effects shall be included in the calculation procedure.

**C2.1.3 Boundary Conditions.** Sensible heat sources shall be permitted to be modeled as volumetric heat
sources to allow the air to pass through the source or as hollow blocks (no mesh inside) specified with either
heat flux or constant temperature on the surfaces of the blocks. Boundary walls shall be modeled as adiabatic (zero heat flux), specified heat flux, or specified temperature boundary.

**C2.1.4 Species Transport.** The sources shall be modeled as volumetric source or a boundary flux with
known generation rate with zero release velocity. The analysis shall be performed with a uniformly distributed source at the breathing zone level of the occupants. All the boundary walls shall be modeled as impermeable to the chemical species.

_**Informative Note:**_ The species modeled should be a tracer gas, such as CO2. Discretion is left to the
modeler to determine the appropriate model depending on the design compounds in the zone.

**C2.1.5 Turbulence Model.** Reynolds (ensemble) averaging turbulence models shall be used.

_**Informative Note:**_ Renormalization group and realizable k-  models meet the requirements of this section.
**C2.1.6 Computational Mesh.** A fine mesh shall be generated near the sensible heat sources, such as
occupants and computers, to resolve the thermal plume surrounding these sources. The fine mesh shall be
generated on all supply air and return air locations.

**C2.1.7 Solution Convergence.** The solution convergence levels shall include the monitoring of relevant
physical quantities, such as temperature or species concentration, at strategic locations. The globally scaled
residuals shall be decreased to10 [–3] for all equations except the energy and species equations, for which the
residuals shall be decreased to 10 [–7] . The mass and energy balance shall be calculated up to at least four (4)
decimal places.

_**Informative Note:**_ Review of the thermal comfort of occupants in the computational model may be
desirable.


ANSI/ASHRAE Standard 62.1-2022 43
