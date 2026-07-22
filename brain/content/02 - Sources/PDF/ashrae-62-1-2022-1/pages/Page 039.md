---
type: source-page
source_document: "[[ASHRAE+62.1-2022+(1) - Source Note]]"
page: 39
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE+62.1-2022+(1) - Page 039

![[99 - Attachments/Sources/ASHRAE+62.1-2022+(1).pdf#page=39]]

## Extracted Content

**(This is a normative appendix and is part of the standard.)**


**NORMATIVE APPENDIX A**
**MULTIPLE-ZONE SYSTEM VENTILATION EFFICIENCY: ALTERNATIVE PROCEDURE**

This appendix presents an alternative procedure for calculating the system ventilation efficiency ( _Ev_ ) for multiple-zone recirculating systems that must be used when Section 6.2.4.3 is not used. In this alternative procedure, _Ev_ is equal to the lowest calculated value of the zone ventilation efficiency ( _Evz_ ) (see Equation A-2).
Figure A-1 contains a ventilation system schematic depicting most of the quantities used in this appendix.


**A1. SYSTEM VENTILATION EFFICIENCY**

For any multiple-zone recirculating system, the system ventilation efficiency ( _Ev_ ) shall be calculated in
accordance with Sections A1.1 through A1.3.

**A1.1 Average Outdoor Air Fraction.** The average outdoor air fraction ( _Xs_ ) for the ventilation system shall
be determined in accordance with Equation A-1.


_Xs = Vou/Vps_ (A-1)


where the uncorrected outdoor air intake ( _Vou)_ is found in accordance with Section 6.2.4.1, and the system
primary airflow ( _Vps)_ is found at the condition analyzed.

_**Informative Note:**_ For VAV-system design purposes, _Vps_ is the highest expected system primary airflow
at the design condition analyzed. System primary airflow at design is usually less than the sum of design
zone primary airflow values, because primary airflow seldom peaks simultaneously in all VAV zones.

**A1.2 Zone Ventilation Efficiency.** The zone ventilation efficiency ( _Evz_ ) shall be determined in accordance
with Sections A1.2.1 or A1.2.2.

**A1.2.1 Single Supply Systems.** For single supply systems, wherein all of the air supplied to each ventilation zone is a mixture of outdoor air and system-level recirculated air, zone ventilation efficiency ( _Evz_ ) shall
be determined in accordance with Equation A-2. Examples of single supply systems include constant-airvolume reheat, single-duct VAV, single-fan dual-duct, and multiple-zone systems.


_Evz =_ 1 _+ Xs – Zpz_ (A-2)


where the average outdoor air fraction for the system ( _Xs_ ) is determined in accordance with Equation A-1,
and the primary outdoor air fraction for the zone ( _Zpz_ ) is determined in accordance with Equation A-3.


_Zpz_ = _Voz_ / _Vpz_ (A-3)


For VAV systems, _Vpz_ is the lowest zone primary airflow value expected at the design condition analyzed.

**A1.2.2 Secondary Recirculation Systems.** For secondary recirculation systems wherein all or part of the
supply air to each ventilation zone is recirculated air (air that has not been directly mixed with outdoor air)
from other zones, zone ventilation efficiency ( _Evz_ ) shall be determined in accordance with Equation A-4.
Examples of secondary recirculation systems include dual-fan dual-duct and fan-powered mixing-box systems and systems that include transfer fans for conference rooms.


_Evz =_ ( _Fa + Xs_ × _Fb – Zpz_ × _Ep_ × _Fc_ )/ _Fa_ (A-4)


where system air fractions _Fa_, _Fb_, and _Fc_ are determined in accordance with Equations A-5, A-6, and A-7,
respectively.


_Fa = Ep +_ ( _1 – Ep_ ) × _Er_ (A-5)


_Fb_ _=_ _Ep_ (A-6)


_Fc = 1 –_ ( _1 – Ez_ ) × ( _1 – Er_ ) × ( _1 – Ep_ ) (A-7)


Where the zone primary air fraction ( _Ep_ ) is determined in accordance with Equation A-8, zone secondary
recirculation fraction ( _Er_ ) is determined by the designer based on system configuration, and zone air distribution effectiveness ( _Ez_ ) is determined in accordance with Section 6.2.1.2.

_Ep = Vpz /Vdz_ (A-8)


ANSI/ASHRAE Standard 62.1-2022 37
