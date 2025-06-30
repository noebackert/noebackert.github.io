---
title: "Laser Fault Injection - Internship"
date: 2024-07-01
author: "Noé Backert"
description: "Investigation and experimentation with laser fault injection techniques to analyze hardware vulnerabilities. Includes attack setups, power and pulse width parameters, and resulting BBICS behaviors."

---

### Power-off laser fault injection on embedded security primitives

- **Project Type:** Internship hardware security  
- **Tools:** Python, laser laboratory sources (picosecond, nanosecond)  
- **Duration:** 4 months  
- **Team:** SAS department EMSE  

---

### Introduction

This internship aims to investigate whether power-off laser fault injection can be utilized to disable or manipulate security mechanisms, such as Physically Unclonable Functions (PUFs) or Bulk Built-In Current Sensors (BBICS).

The project will focus on designing experiments and testing them on a specialized chip, which is used to simulate the effects of radiation on a system.

---

### Project Overview

The project involves:

- Understanding the different physical attacks on chips  
- Exploring the use of laser to induce faults on devices  
- Developing experiments aimed at influencing security sensors  
- Analyzing results for security evaluation  

---

### Important Definitions

#### BBICS (Bulk Built-In Current Sensors)

Bulk Built-In Current Sensors are essential components used in modern embedded security systems to:

- Detect current anomalies in the bulk substrate of integrated circuits, specifically when subjected to external attacks like laser fault injection.  
- Generate an alert flag, triggering an alarm whenever an anomaly or fault condition is detected, thus preventing potential breaches or malfunctions in the chip.  
- Operate by sensing transient currents within the CMOS structure, helping to maintain system integrity during fault conditions.  

BBICS play a critical role in securing integrated circuits against physical attacks, such as power-off laser fault injection. By ensuring that any suspicious activity is flagged, these sensors protect sensitive data and security mechanisms in embedded systems.

---

<div style="width:50%; margin: 1em auto;">
  <img src="/img/projects/lfi/inverter-BBICS.png">
  <p style="text-align:center; font-style:italic;">Figure 1: Architecture of a single NP BBICS</p>
</div>

BBICS are composed of a latch in the middle, and are surrounded by transistors connected to N-wells and P-wells on either side. When a transient current is detected in the bulk, the transistors trigger a change in the state of the latch, which raises an alert signal. This configuration ensures the detection of anomalies in both N-type and P-type regions, maintaining comprehensive fault detection coverage in the CMOS structure.

---

### Single Event Effects

Single Event Effects (SEEs) occur when an ionizing particle strikes a sensitive node within a semiconductor device, altering its state. This impact can lead to errors in digital circuits or transient faults in memory cells, known as Single Event Upsets (SEUs). According to NASA's definition, SEEs are measurable effects on a circuit caused by ion impact. These effects include, but are not limited to:

<ul class="two-column-list">
<li><b>Single Event Upset (SEU):</b> A transient state change induced by an energetic particle, affecting components like digital, analog, or optical elements. SEUs are "soft" errors that can be corrected by resetting or rewriting the device.</li>
<li><b>Single Event Transient (SET):</b> A temporary incorrect output caused by a transient current, induced by an ionizing particle striking a PN junction. This type of event does not permanently alter the device, but the erroneous output can lead to security vulnerabilities.</li>
<li><b>Single Event Latchup (SEL):</b> A persistent short-circuit state triggered by an ionizing particle, which often requires a power cycle to correct.</li>
<li><b>Single Event Burnout (SEB):</b> A catastrophic failure where an ionizing particle induces a high-current state, leading to permanent destruction of the device.</li>
<li><b>Single Event Gate Rupture (SEGR):</b> A physical rupture of the gate oxide in a MOSFET due to ionizing particle impact.</li>
<li><b>Single Event Dielectric Rupture (SEDR):</b> A rupture in the dielectric layer of a semiconductor device caused by an ionizing particle, which can result in permanent damage.</li>
</ul>

Example on a CMOS inverter:

<div style="display:flex; justify-content:center; gap:5%;">
  <div style="width:45%;">
    <img src="/img/projects/lfi/inverter_N_case.png">
    <p style="text-align:center; font-style:italic;">Figure 2: Inverter with input '0'</p>
    <p>This diagram illustrates the behavior of an inverter circuit when a Single Event Transient (SET) induced by a laser occurs, with the input set to '0'. In this state:</p>
    <ul>
      <li><b>Input and output states:</b> The input of the inverter is '0', which means the NMOS transistor is off and the PMOS transistor is on. As a result, the output is '1'.</li>
      <li><b>Laser impact:</b> A laser beam hits the NMOS transistor, causing a transient current.</li>
      <li><b>Effect of the transient current:</b> This transient current can induce a SET, potentially changing the output state from '1' to '0'.</li>
      <li><b>Sensitive regions:</b> The sensitive region in this scenario is the NMOS transistor, which is vulnerable to the transient induced by the laser when the input is '0'.</li>
    </ul>
  </div>
  <div style="width:45%;">
    <img src="/img/projects/lfi/inverter_P_case.png">
    <p style="text-align:center; font-style:italic;">Figure 3: Inverter with input '1'</p>
    <p>This diagram illustrates the behavior of an inverter circuit when a Single Event Transient (SET) induced by a laser occurs, with the input set to '1'. In this state:</p>
    <ul>
      <li><b>Input and output states:</b> The input of the inverter is '1', which means the NMOS transistor is on and the PMOS transistor is off. As a result, the output is '0'.</li>
      <li><b>Laser impact:</b> A laser beam hits the PMOS transistor, causing a transient current.</li>
      <li><b>Effect of the transient current:</b> This transient current can induce a SET, potentially changing the output state from '0' to '1'.</li>
      <li><b>Sensitive regions:</b> The sensitive region in this scenario is the PMOS transistor, which is vulnerable to the transient induced by the laser when the input is '1'.</li>
    </ul>
  </div>
</div>

---

### Layout Analysis (GDS File) of the Radhard Chip

Since the chip we are working on is the result of research from the SAS laboratory, we have access to the layout files of the Radhard board (Radiation Hardening). This allows us to know where to direct our efforts. In our case, we will first focus on the single_BBICS located at the top of the board, and then on the Calisson_pattern_Well block, which is located at the bottom of the pattern_SC_TW_Well block and groups together the different BBICS with high sensitivity (hs_bbics) and low leakage (ll_bbics).

<div>
  <img src="/img/projects/lfi/RadhardGDS/1.png" alt="Complete layout of the Radhard board">
  <p style="text-align:center; font-style:italic;">Complete layout of the Radhard board</p>
</div>

<div style="display:flex; justify-content:center; gap:2em;">
  <div>
    <img src="/img/projects/lfi/RadhardGDS/2.png" alt="Layout of the isolated single BBICS" style="max-width:100%;">
    <p style="text-align:center; font-style:italic;">Layout of the isolated single BBICS</p>
  </div>
  <div>
    <img src="/img/projects/lfi/RadhardGDS/3.png" alt="Layout of the BBICS block" style="max-width:100%;">
    <p style="text-align:center; font-style:italic;">Layout of the BBICS block</p>
  </div>
</div>

<div>
  <img src="/img/projects/lfi/RadhardGDS/4.png" alt="Zoom on the layout of the multiple BBICS in the Calisson_pattern_Well block" style="max-width:100%;">
  <p style="text-align:center; font-style:italic;">Zoom on the layout of the multiple BBICS in the Calisson_pattern_Well block</p>
</div>

---

### BBICS Functionality Verification

To verify the functionality of the BBICS, we first perform characterization at different laser energies and pulse widths.

To achieve this, we used the following experimental setup:

<div>
  <img src="/img/projects/lfi/montage-bispot.png" alt="Setup 1 - bispot laser" style="max-width:100%;">
  <p style="text-align:center; font-style:italic;">Setup 1 - bispot laser</p>
</div>

The camera provides real-time information on the laser's position during the attack, allowing us to precisely target the desired BBICS with the help of the layout shown in the figure below.

<div style="display:flex; justify-content:center; gap:2em;">
  <div>
    <img src="/img/projects/lfi/screen_single_BBICS.png" alt="Location of the origin (0,0) for the attack on the single BBICS" style="max-width:100%;">
    <p style="text-align:center; font-style:italic;">Location of the origin (0,0) for the attack on the single BBICS</p>
  </div>
  <div>
    <img src="/img/projects/lfi/zone_gds_withoutPlot.JPG" alt="Characterization zone on the Radhard.gds layout (characterization 4)" style="max-width:100%;">
    <p style="text-align:center; font-style:italic;">Characterization zone on the Radhard.gds layout (characterization 4)</p>
  </div>
</div>

---

### Summary of Characterization Parameters

Here are the parameters used to characterize the operation of the BBICS. The table below lists the different ranges of the laser attack, the step size, the maximum current sent to the optical fiber, and the pulse width.

<table>
  <thead>
    <tr>
      <th>№</th>
      <th>Range (x,y) [\(\mu m\)]</th>
      <th>Step \(\Delta\) [\(\mu m\)]</th>
      <th>\(I_{max}\) [mA]</th>
      <th>PW [ns]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>(-50,-50) → (75,75)</td>
      <td>5</td>
      <td>75, 100, 200, 300</td>
      <td>5, 10, 50, 100, 200, 500</td>
    </tr>
    <tr>
      <td>2</td>
      <td>(-20,-20) → (45,45)</td>
      <td>0.5</td>
      <td>50, 75, 100</td>
      <td>5, 10, 50, 100, 200, 500</td>
    </tr>
    <tr>
      <td>3</td>
      <td>(-50,-50) → (75,75)</td>
      <td>5</td>
      <td>60, 70, 80, 90, 100</td>
      <td>10, 50, 100, 200, 500</td>
    </tr>
    <tr>
      <td>4</td>
      <td>(-150,-150) → (100,150)</td>
      <td>5</td>
      <td>80, 100, 200, 300, 400</td>
      <td>10, 50, 100, 200, 500</td>
    </tr>
    <tr>
      <td>5</td>
      <td>(-30,0) → (70,70)</td>
      <td>1</td>
      <td>100, 200, 300, 400, 500, 1000</td>
      <td>5</td>
    </tr>
  </tbody>
</table>

**Table 1:** Characterization

---

### Results of the characterization

<div style="text-align:center;">
  <img src="/img/projects/lfi/subplot.png" alt="BBICS characterization" style="max-width:100%;">
</div>

#### Characterization on the Calisson_pattern_Well Block

We also performed a characterization on the block containing the other BBICS, although these are not the ones we will attack first.

<div style="text-align:center;">
  <img src="/img/projects/lfi/subplot_multi.png" alt="Characterization on the Calisson_pattern_Well block" style="max-width:100%;">
</div>

We can already observe two surprising results from these characterizations:

1. Only 4 flags are present (no fault, single NWell, high sensitivity PWell, and both at the same time).  
2. The high sensitivity BBICS seems to detect fault injections less sensitively than the single NWell BBICS.

My mistake here was only performing one characterization. Indeed, the result does not seem to be consistent, and we cannot be sure of the proper functioning of the other BBICS. I should have run a characterization on another test card to compare the results.

---

### Attack protocol

Several aspects need to be tested with different parameters to try to temporarily or permanently damage our integrated mass current sensor.

First, the initial idea was to attack in order to exceed the <acronym title="Total Ionizing Dose">TID</acronym> (Total Ionizing Dose) of the targeted area. Indeed, when using a pulsed laser, it generates radiation effects that, at certain doses, can modify the behavior of the electronic circuit either temporarily or permanently. These radiation effects stem from the interactions between the laser and the sensor material, generating electron-hole pairs and inducing parasitic currents. As the accumulated radiation dose increases, these currents can alter the electrical characteristics of the components, leading to malfunctions. For example, a sufficient dose of radiation can cause a threshold voltage shift in transistors, an increase in leakage current, or a degradation of the overall performance of the circuit. These changes can result in temporary malfunctions, where the sensor can recover after a certain time, or permanent malfunctions where the damage is irreversible.

Next, the second way to attack the integrated mass current sensor would be to use thermal effects associated with pulsed laser attacks, thus melting certain transistors during the attack.

The experimental protocol I devised for these two methods is as follows:

- Initial rough characterization (BBICS on)  
- Turning off the board's power supply  
- Attack with energy/power P for X seconds and at a frequency F  
- Powering the board  
- Final rough characterization (BBICS on)  

These attacks will be performed using two different laser sources (nanosecond and picosecond) to test the different effects related to these sources.

The first targeted attacks we conducted on the BBICS were carried out on a different setup than the one used during the characterization (see **Figure** below). This setup uses the advanced laser from room E017, which has several interchangeable laser sources (nanosecond source, high-power nanosecond source: NanoHP, and a picosecond source).

<div style="text-align:center;">
  <img src="/img/projects/lfi/montage-laserAV.png" alt="Advanced laser setup (laser AV)" style="max-width:100%;">
</div>

This laser allowed us to carry out our experimental protocol with the greatest number of possible parameters (see tables below).

---

<h4>Summary of the attacks performed with the picosecond laser source:</h4>

<table border="1" cellpadding="5" cellspacing="0" width="100%">
  <thead>
    <tr>
      <th>Attack Name</th>
      <th>Energy [nJ]</th>
      <th>PW [ps]</th>
      <th>Optics</th>
      <th>Frequency F [Hz]</th>
      <th>Time T [s]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>exp_pico1</td>
      <td>1 → 50</td>
      <td>30</td>
      <td>x20</td>
      <td>continuous (1 MHz)</td>
      <td>180 → 300</td>
    </tr>
    <tr>
      <td>exp_pico2</td>
      <td>50</td>
      <td>30</td>
      <td>x20</td>
      <td>continuous (1 MHz)</td>
      <td>180 → 300</td>
    </tr>
    <tr>
      <td>exp_pico3</td>
      <td>10 → 45</td>
      <td>30</td>
      <td>x20</td>
      <td>continuous (1 MHz)</td>
      <td>180 → 600</td>
    </tr>
  </tbody>
</table>
<p><strong>Table 3:</strong> Attacks performed with the picosecond source</p>

<div class="results" style="margin-bottom: 50px; margin-top: 50px;">
  <h2>Results</h2>
  <h3>Nanosecond Source</h3>

  <p><strong>Summary of Results:</strong><br>
  All attacks using the nanosecond laser source (experiments exp1 to exp17) were <strong>unsuccessful</strong> in causing damage or detectable effects on the BBICS. Comparisons of the sensor’s performance before and after the attacks showed no significant changes, meaning the sensors continued to function as before.</p>

  <p><strong>Challenges Faced:</strong><br>
  Increasing the attack duration might have led to more significant effects, but the laser would often <strong>overheat</strong> and shut down when performing consecutive attacks or extended attacks, especially in the final experiments (exp8 to exp17) where <strong>high power</strong> and <strong>long durations</strong> were used.</p>

  <div class="figure-wrapper">
    <img class="figure-subplot" src="/img/projects/lfi/caracterisation.png" alt="Characterization with the nanosecond laser source">
  </div>
  <div class="figure-wrapper">
    <img class="figure-subplot" style="width: 30%;" src="/img/projects/lfi/exp6.png" alt="Experiment exp6 (2.8W - 500ns - 90s)">
    <img class="figure-subplot" style="width: 30%;" src="/img/projects/lfi/exp8.png" alt="Experiment exp8 (2.8W - 1s - 60s)">
    <img class="figure-subplot" style="width: 30%;" src="/img/projects/lfi/exp17.png" alt="Experiment exp17 (2.8W - 500ns - 600s)">
  </div>

  <p><strong>Visuals:</strong><br>
  <ul>
    <li>Figure 1: Initial characterization with the nanosecond laser source (10 mW at 50 ns, x20 optics)</li>
    <li>Figure 2: Experiment exp6 (2.8W - 500ns - 90s)</li>
    <li>Figure 3: Experiment exp8 (2.8W - 1s - 60s)</li>
    <li>Figure 4: Experiment exp17 (2.8W - 500ns - 600s)</li>
  </ul>
  </p>

  <h3>Picosecond Source</h3>
  <p><strong>Results:</strong><br>
  For the picosecond source, we obtained <strong>better results</strong>. We gradually increased the attack energies from 1 nJ to 50 nJ, while testing for various durations ranging from 180 to 300 seconds.</p>

  <p>The first attack (exp_pico1) already shows that the attacks have a short-term effect on the detection range of the BBICS. Indeed, as the energy increases, we notice that the detection threshold of the BBICS gradually decreases.</p>

  <p><strong>Influence of Duration:</strong><br>
  Based on the results, the attack duration does not seem to have a significant influence on the detection threshold.</p>

  <div class="figure-wrapper">
    <img class="figure-subplot" src="/img/projects/lfi/carac_pico_15nJ.png" alt="Experiment exp_pico1 (1 → 50nJ - 30ps - 180 → 300s)">
  </div>

  <p><strong>Visuals:</strong><br>
  <ul>
    <li>Figure 5: Comparison of attack results from 10 nJ to 15 nJ for 180 and 300 s (characterization done at 0.1 nJ and 30 ps)</li>
  </ul>
  </p>

  <p>As the energy of the attack increases, this reduction in the detection range of the transient current sensor becomes more pronounced. These results, obtained with the picosecond laser, support the idea that it is possible to conduct an attack that could permanently or temporarily bias the sensor. After a certain time, the BBICS would return to its normal detection threshold.</p>

  <p>Another step in the analysis, which I did not have time to conduct, would be to measure how long it takes for the sensor to return to its initial state after an off-power attack.</p>

  <p><strong>Higher Energy Attacks:</strong><br>
  New attacks with higher energy were conducted. In Figure 6, we can see the characterizations done after attacks with 35 to 40 nJ. In this energy range, the reduction in the detection range is not as obvious as between 10 nJ and 15 nJ, but it remains present.</p>

  <p>Finally, by increasing the energy further, we achieved a permanent BBICS failure for an energy of 45 nJ during a 300-second attack. The first attack that permanently biased the BBICS was performed with 50 nJ for 180 seconds and was confirmed by another attack at 45 nJ for 300 seconds on a different board.</p>

  <div class="figure-wrapper">
    <img class="figure-subplot" style="width: 80%;" src="/img/projects/lfi/caracterisation_pico_35_40nJ.png" alt="Characterization after attacks with 35 to 40 nJ">
  </div>

  <p><strong>Visuals:</strong><br>
  <ul>
    <li>Figure 7: BBICS attack at 50 nJ 30 ps on board number 4</li>
    <li>Figure 8: BBICS attack at 45 nJ 30 ps on board number 6</li>
  </ul>
  </p>
</div>
