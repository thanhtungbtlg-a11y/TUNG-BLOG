---
type: source-page
source_document: "[[ASHRAE-90.1-2022- - Source Note]]"
page: 386
extraction_method: text
page_classification: text
needs_review: true
publish: true
---

# ASHRAE-90.1-2022- - Page 386

![[99 - Attachments/Sources/ASHRAE-90.1-2022-.pdf#page=386]]

## Extracted Content

**Table L4.2.3-1 Fan and Pump Power Curve Coefficients**











|Equation Term|Fan Power Coefficients|Col3|Pump Power Coefficients|Col5|
|---|---|---|---|---|
|**Equation Term**|**VSD (no Static**<br>**Pressure Reset)**|**VSD + Static**<br>**Pressure Reset**|**Ride Pump Curve**|**VSD + Differential**<br>**Pressure/Valve Reset**|
|_b_|0.0013|0.0408|0|0|
|_x_|0.147|0.088|3.2485|0.0205|
|_x_2|0.9506|–0.0729|–4.7443|0.4101|
|_x_3|–0.0998|0.9437|2.5295|0.5753|


**Figure L4.2.3-1 Fan and pump power performance as a function of design water flow or airflow.**


**L4.1.7 Elevators.** Elevators shall not be modeled.
**L4.1.8 Service Water-Heating Equipment.** _Service water heating_ shall not be modeled.
**L4.1.9 On-site Renewable Energy Systems.** _On-site renewable energy systems_ shall not be modeled.

**L4.2 Simulation of the Proposed Design (HVAC).** The _proposed design HVAC_ _systems_ shall be configured and analyzed as specified in this section.

**L4.2.1 HVAC Equipment.** The _simulation program_ shall analyze the control parameters that meet the
mandatory requirements of Section 6.4 and the parameters provided by the user or specified as fixed in Section L2.2.3 as applicable for each _HVAC_ _system_ included in the _proposed design_ .

**L4.2.2 Supported HVAC Systems.** The _HVAC_ _systems_ included in the _proposed design_ and the _TSPR_
_reference building design_ shall be supported by the _simulation program_ . _HVAC_ _systems_ permitted are limited
to those shown in Table L.1.1.1. The _simulation program_ shall support multiple blocks being served by one
central _system_ .

**L4.2.3 Proposed Building HVAC System Simulation.** The _HVAC_ _systems_ shall be modeled as in the
_proposed design_ with clarifications and simplifications as described in Table L2.2.3 and the following rules:


a. _System_ parameters not described in Table L2.2.3 and the following sections shall be simulated to meet

the minimum requirements of Section 6.4.
b. Where multiple _system_ components serve a block, average values weighed by the appropriate metric as

described in Section L2.2.3.1 shall be used.
c. Heat loss from ducts and pipes shall not be modeled.
d. The _simulation program_ shall model part-load HVAC _equipment_ performance using either

1. full-load _efficiency_ (adjusted for fan power input that is modeled separately) and typical part-load
performance adjustments for the proposed _equipment_ ;
2. part-load adjustments based on input of both full-load and part-load metrics, or
3. _equipment_ -specific adjustments based on performance data provided by the _equipment_ _manufacturer_
for the proposed _equipment_ .


384 ANSI/ASHRAE/IES Standard 90.1-2022 (I-P)



![[02 - Sources/PDF/ashrae-90-1-2022/assets/page-386-385-0.png]]
