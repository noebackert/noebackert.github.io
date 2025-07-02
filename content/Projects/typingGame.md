---
title: "Multithreading Typing Game in C"
date: 2023-06-01
author: "Noé Backert"
description: "Development of a multiplayer console typing game in C using sockets and threads. Focuses on managing multiple clients, time tracking, and score ranking in a client-server architecture."
tags: ["C", "Multiplayer Game", "Sockets", "Threads", "Client-Server Architecture", "Programming"]
---

### Server-Client Multiplayer based game in C


## Project Details

- **Project Type:** Programmation in C  
- **Tools:** C, Debian, git  
- **Duration:** 1 week  
- **Team:** Duo project with [Antoine Banchet](https://github.com/AntoineDevFr)  
- **Code:** [Github noebackert/ProjetPSE](https://github.com/noebackert/ProjetPSE)  
- **Report:** [Download report](/files/rapport_PSE.pdf)  

---

## Introduction

The goal of this project was to understand the basis of sockets, fork and threads in C programming.  
The project aims to design, simulate, and test a simple console game to work with threads and sockets.

---

## Project Overview

The project involves:  
- Understanding the concept of forks and threads  
- Understanding sockets and multiplayer management  
- Designing a Server-Client application  
- Using the GCC flags `-ansi -pedantic -Wall` to write standard-compliant code  

---

## General Description of the Project

### Multiplayer Client/Server Typing Speed Game

- The player who types the most words correctly wins  
- **Originality:**  
  - Ability to start the game with a variable number of users (from 1 to `NB_CLIENT_MAX` players, as long as everyone is ready)  
  - Time management handled in a separate thread  
  - Score and ranking management with a variable number of clients  

---

## Code Structure

To maintain clarity in digital system design projects, it is essential to separate source code from test benches and compiled files:

<div class="figure" style="text-align:center;">
  <img src="/img/projects/typingGame/tree.JPG" alt="Project Directory Tree" style="max-width:100%;height:auto;">
  <p>Figure 3: Project directory structure</p>
</div>

- **appli:** contains `client.c`, `serveur.c`, and `liste_francais.txt` (word list)  
- **include:** contains the headers of the modules  
- **modules:** contains the PSE modules used plus `words.c`  
- **lib:** contains `libpse.a`, the static library of the PSE modules  

---

## Server

The server is the central element of the game. It manages the game, the players, and the game statistics.

<div class="figure" style="text-align:center;">
  <img src="/img/projects/typingGame/serveur.png" alt="Server Flowchart" style="max-width:100%;height:auto;">
  <p>Figure 2: Server Flowchart</p>
</div>

---

## Client

The client is the player. It connects to the server and plays the game.

<div class="figure" style="text-align:center;">
  <img src="/img/projects/typingGame/client.png" alt="Client Flowchart" style="max-width:100%;height:auto;">
  <p>Figure 3: Client Flowchart</p>
</div>

