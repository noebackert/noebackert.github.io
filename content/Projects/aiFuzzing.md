---
title: "TranFuzz: AI Fuzzing and Black-Box Adversarial Attack Evaluation"
date: 2025-03-26
author: "Noé Backert"
description: "Study and evaluation of TranFuzz for generating black-box adversarial examples on image classification models." 
tags: ["AI", "Fuzzing", "Adversarial Attacks", "TranFuzz", "Black-Box Attacks", "Image Classification"]
---

### Studying and evaluating TranFuzz for generating black-box adversarial examples on image classification models

## Project Details

- **Project Type:** Research and evaluation project on AI security
- **Tools:** PyTorch, Adversarial Robustness Toolbox (ART), Python, GitHub
- **Duration:** 2 months
- **Team:** 5 members (students and industry mentor)
- **Article**: [Article](/files/2021_TranFuzz.pdf)
- **Report:**: [Report](/files/PR_2025_Report.pdf)
- **Code**: [GitHub Repository](https://github.com/noebackert/PR-ICICS)

---

## Introduction

Adversarial attacks can trick neural networks into making incorrect predictions through imperceptible perturbations, threatening critical systems in autonomous driving, healthcare, and cybersecurity. Traditional **white-box attacks** require full knowledge of the model architecture, while **black-box attacks** operate without this knowledge, making them realistic in practice.

TranFuzz is a system for generating **highly transferable black-box adversarial examples** using domain adaptation and fuzzing techniques, providing a framework to train and test models under adversarial conditions while exploring robustness improvements.

---

## Project Overview

The project involved:

- Reviewing **adversarial attacks and defenses**, focusing on black-box scenarios.
- Studying **TranFuzz**, which combines **Domain Adaptation (DSAN)** and **fuzzing** for generating adversarial samples.
- Evaluating the **robustness of models** (DenseNet, AlexNet, VGG) under various attacks (FGSM, PGD, C&W, ST, TranFuzz).
- Exploring **adversarial retraining** using TranFuzz-generated samples to improve robustness.
- Comparing results across datasets (Office31, OfficeHome) and analyzing the **impact of dataset complexity** on transferability and attack effectiveness.

---

## TranFuzz System

TranFuzz operates through:
- **Domain Adaptation using DSAN** to align source and target distributions, enabling effective local substitute models.
- **Fuzzing with neuron coverage metrics** to explore under-tested areas of the model for effective perturbations.
- An **ensemble-based seed mutation strategy** to enhance adversarial sample diversity and transferability.
- Ensuring **misclassification while preserving similarity** (using a high SSIM threshold) for effective, human-imperceptible adversarial examples.

Example of an adversarial attack :
![advExample](/img/projects/aiFuzzing/adv.png)

*Figure 1: Example of a basic adversarial attack : adding some carefully selected noise to a panda image can trick an image classification model into classifying the image as a gibbon with high confidence*

---

## Evaluation Methodology

The evaluation involved:

1. **Training target models** on selected datasets.
2. **Training DSAN-based source models** on complementary subsets.
3. Generating adversarial examples using the TranFuzz system.
4. Testing transferability and attack effectiveness on target models.
5. Performing **adversarial retraining** with TranFuzz-generated samples to improve model robustness.
6. Comparing results with classical attacks (FGSM, PGD, C&W, ST) and with Madry’s adversarial training baseline.


![trainMethodo](/img/projects/aiFuzzing/trainingMethodology.png)
*Figure 2: Overall fuzzing methodology diagram*


![advRetraining](/img/projects/aiFuzzing/advRetraining.png)
*Figure 3: Adversarial retraining with augmented dataset*


---

## Results
### Transferability results
TranFuzz demonstrated strong transferability of adversarial examples across different models and datasets, with notable improvements over traditional methods.
![tranResults](/img/projects/aiFuzzing/transfResults.png)

*Figure 4: Transfer accuracy of the target model DenseNet-121 on the source model using
 different target datasets*

- **TranFuzz demonstrated strong black-box attack capabilities**, reducing DenseNet accuracy from 94% to 42% in some cases.
- **Transferability** of adversarial examples increased with dataset complexity, with TranFuzz outperforming Madry retraining on harder datasets (Amazon, Product) by up to +4% in transfer accuracy.
- **PGD attacks remained the most powerful** in white-box settings, while TranFuzz was highly competitive in black-box conditions.
- **Adversarial retraining with TranFuzz samples** improved model resilience to certain attacks, but complete defense across all attack types was not achieved.
- Limitations included dataset size, old model architectures, and unprovided hyperparameter details, impacting reproducibility and generalization.

![densenetResults](/img/projects/aiFuzzing/densenetResults.png)
*Figure 5: DensetNet-121 result charts on different datasets*

![webcamDatasetResults](/img/projects/aiFuzzing/webcamDatasetResults.png)
*Figure 6: Office31/Webcam result charts for different model architectures*

---

## Conclusion

TranFuzz is a **promising system for generating black-box adversarial attacks** while enhancing model robustness via retraining, though its defensive capabilities are partial. It complements existing adversarial training strategies, with **notable improvements on complex datasets** and under realistic black-box conditions.

Future work includes:
- Expanding to advanced architectures (Transformers, EfficientNets).
- Testing on larger, more diverse datasets.
- Exploring additional attacks and defense mechanisms for holistic adversarial robustness evaluation.