---
title: "ASCON128 Digital System Design Project"
date: 2023-11-01
author: "Noé Backert"
description: "Study and implementation of the Ascon128 lightweight authenticated encryption algorithm, focusing on its efficiency and security for resource-constrained environments and development using SystemVerilog." 
tags: ["ASCON128", "SystemVerilog", "Cryptography"]
---

### Lightweight Encryption System ASCON128 in SystemVerilog

---

## Project Details

- **Project Type:** Digital System Design  
- **Tools:** ModelSim, SystemVerilog  
- **Duration:** 1 month  
- **Code:** [Github noebackert/Ascon128](https://github.com/noebackert/ascon128)  
- **Report:** [Download report](/files/rapport_ascon128.pdf)  

---

## Introduction
Data security in digital communication systems is a priority for ensuring private conversations.

The project aims to design, simulate, and analyze the ASCON128 encryption system, a lightweight and efficient solution primarily used in IoT, where available resources are limited.

The NIST (National Institute of Standards and Technology) has selected ASCON128 to be the reference for lightweight cryptography.  
*NIST : [https://www.nist.gov/news-events/news/2023/02/nist-selects-lightweight-cryptography-algorithms-protect-small-devices](https://www.nist.gov/news-events/news/2023/02/nist-selects-lightweight-cryptography-algorithms-protect-small-devices)*

---

## Project Overview

The project involves:

- Understanding the ASCON128 encryption system  
- Exploring SystemVerilog for system description  
- Designing a finite state machine (FSM)  
- Simulating system components  
- Analyzing results for system validation  

---

## General Description of the Project

### ASCON128 Operation

The ASCON128 module is divided into several blocks:

- the Finite State Machine  
- the Permutation block  
- the XOR blocks  
- Permutation and block counters  

![General Operation Scheme of ASCON128 Encryption Method](/img/projects/ascon128/ascon_schema.PNG)

*Figure 1: General operation scheme of ASCON128 encryption method*

---
## Notations

The algorithm operates on a current state $S$ of 320 bits, composed of a vector of $5 * 64$ bits named $ (x_0, x_1, x_2, x_3, x_4) $. The state is updated using a permutation operation, either 6 iterations $ p^6 $ or 12 iterations $ p^{12} $. The state is divided into:

- An internal part of 256 bits, denoted $ S_c (=x_1, x_2, x_3, x_4) $  
- An external part of 64 bits, denoted $ S_r (=x_0) $  
- A 128-bit key, denoted $ K $  
- A 128-bit nonce, denoted $ N $  
- A 64-bit associated data, denoted $ A $  
- A 248-bit plaintext, denoted $ P $  
- A 248-bit ciphertext, denoted $ C $  
- A 128-bit tag, denoted $ T $  
- An initialization vector, denoted $ IV = $ 0x80400C0600000000  

---

## ASCON128 Operation Diagram

![ASCON128 Functionment](/img/projects/ascon128/ascon_functionment.PNG)

*Figure 2: Description of ASCON128 operation*

---

## Code Structure

To maintain clarity in digital system design projects, it is essential to separate source code from test benches and compiled files:

![Project Directory Structure](/img/projects/ascon128/tree.PNG)

*Figure 3: Project directory structure*

- `./SRC/RTL`: Source files  
- `./SRC/BENCH`: Test files  
- `./LIB/LIB_BENCH` and `./LIB/LIB_RTL`: Compiled libraries and executables  
- `./DO`: Scripts for simulation execution  
- `init_modelsim.txt`: Initialization commands for ModelSim  
- `compil_ascon.txt`: Compilation commands  
- `DO/[module.do]`: Simulation execution scripts  

---

## Simulation Results

The simulation results indicate successful verification of the encryption system, confirming correct cipher and tag outputs.

![Complete Simulation Result](/img/projects/ascon128/output_ascon.PNG)

*Figure 4: Complete simulation result*

---

### Initial validation data:

- K = 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F (16 octets)  
- N = 00 11 22 33 44 55 66 77 88 99 AA BB CC DD EE FF (16 octets)  
- A = 32 30 32 33 (4 octets)  
- P = 43 6F 6E 63 65 76 65 7A 20 41 53 43 4F 4E 20 65 6E 20 53 79 73 74 65 6D 56 65 72 69 6C 6F 67 (31 octets)  

### Result Cipher:

- C1 = 05 67 b4 6d 13 8a 8b 5f  
- C2 = db 5c ba 98 23 53 0f 3f  
- C3 = 33 39 ce 01 a4 e4 b3 2f  
- C4 = 1f c9 a1 49 ab fd 3a (f5)  

### Final tag:

- T = C5 EB 90 2A 13 30 70 77 47 00 39 BC 3A 69 28 EC  

---

We can finally verify using tools like [https://motarekk.github.io/](https://motarekk.github.io/) that the encryption is correct, and we find the same result.
