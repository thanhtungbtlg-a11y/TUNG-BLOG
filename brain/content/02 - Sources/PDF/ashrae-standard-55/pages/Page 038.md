---
type: source-page
source_document: "[[ASHRAE-Standard-55 - Source Note]]"
page: 38
extraction_method: text
page_classification: text
needs_review: true
publish: false
---

# ASHRAE-Standard-55 - Page 038

![[99 - Attachments/Sources/ASHRAE-Standard-55.pdf#page=38]]

## Extracted Content

**(This is a normative appendix and is part of this standard.)**


**NORMATIVE APPENDIX D**
**PROCEDURE FOR EVALUATING COOLING EFFECT OF**
**ELEVATED AIR SPEED USING STANDARD EFFECTIVE TEMPERATURE (SET)**


**D1. CALCULATION OVERVIEW**

Section 5.3 requires that the elevated air speed adjustment be used when average air speed _Va_ is greater than
0.10 m/s (20 fpm). This appendix describes the calculation procedures for the elevated air speed adjustment.
For a given set of environmental and personal variables, including an elevated average air speed, an
average air temperature _ta_, and a mean radiant temperature _tr_, the SET is first calculated. Then the average
air speed _Va_ is replaced by still air (0.1 m/s [20 fpm]), and the average air temperature and radiant temperature are adjusted according to the cooling effect (CE). The CE of the elevated air speed is the value that,
when subtracted equally from both the average air temperature and the mean radiant temperature, yields the
same SET under still air as in the first SET calculation under elevated air speed. The PMV adjusted for an
environment with elevated average air speed is calculated using the adjusted average air temperature, the
adjusted radiant temperature, and still air (0.1 m/s [20 fpm]).

a. Enter the average air temperature _ta_, radiant temperature, relative humidity, clo value, and met rate.
b. Set the average air speed _Va_ .
c. Note the calculated value for SET in the output data.
d. Reduce the average air speed _Va_ to 0.1 m/s (20 fpm).
e. Reduce the average air temperature _ta_ and radiant temperature _tr_ equally in small increments until the

SET is equal to the value noted in Step (c).
f. The CE is the quantity by which the average air temperature and radiant temperature have been reduced.
The resulting air temperature value is the adjusted average air temperature, and the resulting radiant temperature is the adjusted mean radiant temperature.
g. The PMV adjusted for elevated average air speed is calculated using the following inputs:

1. Adjusted average air temperature from Step (f)
2. Adjusted mean radiant temperature from Step (f)
3. Average air speed _Va_ of 0.1 m/s (20 fpm)
4. Original relative humidity
5. Original clo value
6. Original met rate


**D2. CALCULATION PROCEDURE**



The following is a formal description of this process that can be automated.



Suppose _ta_ is the average air temperature and  _elev_ is the elevated average air speed, such that  _elev_  - 0.1
m/s (20 fpm). Let  _still_ = 0.1 m/s (20 fpm). Consider functions PMV and SET, which take six parameters,
which we will denote with the shorthand PMV(.,*) and SET(.,*). The variables of importance will be listed
explicitly, while the parameters that are invariant will be denoted by “*”. The variables we will refer to
explicitly are the average air temperature _ta_, mean radiant temperature _tr_, average air speed _Va_, and relative
humidity RH.



_tr_



To define the CE, we assert that it satisfies the following:

SET  _ta_  _tr_   _elev_         -  = SET  _ta_        - CE  _tr_        - CE   _still_         - 



(D-1)



That is, the adjusted average air temperature yields the same SET, given still air, as the actual air temperature does at elevated average air speed. In order to determine the cooling effect, an iterative root-finding
method such as the bisection or secant method may be employed. The root of the parameterized function
_f_ (ce) is the CE:



_f_  ce  = SET  _ta_  _tr_   _elev_               -               - SET  _ta_              - ce  _tr_              - ce   _still_               - 

The adjusted PMV is given by

PMV _adj_ = PMV  _ta_        - CE  _tr_        - CE   _still_         - 



(D-2)


(D-3)



_**Informative Note:**_ For the use of SET in ASHRAE Standard 55, the function for self-generated air speed as

a function of met rate has been removed.


**D3. VALIDATION TABLE FOR SET CALCULATION**

Software implementations and other methods of SET calculation shall be validated against Table D-1.


36 ANSI/ASHRAE Standard 55-2023
