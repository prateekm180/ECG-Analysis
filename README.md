# ECG Physics and Digitization Foundations

## 1. Introduction

Electrocardiograms (ECGs) record the electrical activity of the heart over time and are one of the most widely used diagnostic tools in cardiology. Despite their importance, a large portion of historical ECG data exists only in analog form—printed on paper, scanned, or photographed. Such data cannot be directly used by modern machine learning or AI systems, which require numerical time-series signals.

The purpose of this document is to build a **foundational understanding of ECG signals and paper ECG properties**, so that the task of converting ECG images into digital waveforms is approached as a **signal reconstruction problem**, not merely an image-to-number regression task.

The goal of digitization is to recover, as faithfully as possible, the original electrical signal that was recorded by the ECG machine, preserving both **temporal accuracy** and **amplitude fidelity**.

---

## 2. ECG Signal Basics

### 2.1 What an ECG Represents

An ECG is a plot of voltage (millivolts) versus time (milliseconds or seconds), representing the summed electrical activity of the heart during each cardiac cycle.

The signal is continuous in nature but is sampled digitally by ECG machines at a fixed sampling rate (commonly 250 Hz, 360 Hz, or 500 Hz).

---

### 2.2 Major ECG Components

Each cardiac cycle typically consists of the following components:

* **P wave**
  Represents atrial depolarization. It is usually low in amplitude and smooth in shape.

* **QRS complex**
  Represents ventricular depolarization. This is the most prominent part of the ECG, characterized by:

  * High amplitude
  * Sharp peaks
  * Short duration

* **T wave**
  Represents ventricular repolarization. It is broader and smoother than the QRS complex.

* **U wave (optional)**
  Sometimes visible after the T wave, often small and not always present.

Accurate reconstruction of the **QRS complex**, especially the R-peak, is critical, as many diagnostic measurements depend on it.

---

### 2.3 Timing and Amplitude Importance

* **Amplitude (mV)** reflects the strength of electrical activity.
* **Time (ms)** reflects conduction speed and rhythm.

Small distortions in either dimension can significantly affect:

* Heart rate estimation
* Interval measurements (PR, QRS, QT)
* Arrhythmia detection

Therefore, digitization must preserve **both shape and scale**.

---

## 3. Paper ECG Characteristics

### 3.1 ECG Grid System

Paper ECGs are printed on standardized grid paper to allow manual measurement.

* **Small square (1 mm × 1 mm)**

  * Horizontal: 40 ms (at 25 mm/s)
  * Vertical: 0.1 mV

* **Large square (5 mm × 5 mm)**

  * Horizontal: 200 ms
  * Vertical: 0.5 mV

This grid provides the reference needed to convert pixel distances back into time and voltage.

---

### 3.2 Paper Speed

The most common paper speed is:

* **25 mm/s**

This means:

* 25 mm horizontally corresponds to 1 second

Some ECGs may use 50 mm/s, which must be detected or inferred during digitization.

---

### 3.3 Trace Properties

* **Trace thickness** varies by printer and scan quality
* Ink intensity may fade or bleed
* Traces may overlap grid lines

These factors introduce ambiguity when extracting a single-pixel-wide waveform from an image.

---

### 3.4 Lead Layout

ECG images may contain:

* **Single-lead recordings**
* **Multi-lead recordings (e.g., 12-lead ECGs)** arranged spatially

Digitization models must either:

* Focus on one lead at a time, or
* Correctly separate multiple leads from a single image

---

## 4. Common Artifacts in ECG Images

### 4.1 Baseline Wander

Low-frequency fluctuations caused by:

* Respiration
* Patient movement
* Electrode impedance changes

Baseline wander shifts the signal vertically and must be corrected to recover true amplitudes.

---

### 4.2 Noise

* Muscle noise (EMG)
* Power-line interference
* Scanner or camera noise

Noise can obscure small features such as P waves.

---

### 4.3 Image Distortions

* Rotation or skew during scanning
* Perspective distortion from photographs
* Uneven lighting
* Compression artifacts

These distortions complicate pixel-to-signal mapping.

---

## 5. Digitization Challenges

Digitizing ECG images involves solving several non-trivial problems:

* Mapping **pixels → millimeters → physical units (mV, ms)**
* Removing grid lines without damaging the trace
* Separating signal from background noise
* Handling missing or broken segments
* Maintaining temporal continuity

This makes ECG digitization fundamentally a **signal recovery problem under visual corruption**.

---

## 6. Signal Recovery Considerations

### 6.1 Amplitude Calibration

Vertical pixel distance must be converted into millivolts using grid spacing or learned scale.

### 6.2 Time Calibration

Horizontal pixel distance must be converted into time using paper speed assumptions.

### 6.3 Noise and Baseline Correction

Post-processing techniques such as:

* Smoothing filters
* High-pass filtering
* Polynomial baseline removal

can significantly improve signal quality.

### 6.4 Peak Preservation

Special care must be taken to preserve:

* R-peak height
* QRS width

Over-smoothing can destroy clinically important features.

---

## 7. Research Insights Relevant to This Project

* Preprocessing encodes domain knowledge that models cannot easily learn from limited data.
* A model that ignores ECG physics may score well numerically but fail clinically.
* Loss functions should penalize both amplitude and temporal misalignment.
* Visual inspection of reconstructed waveforms is essential.

---

## 8. Conclusion

Successful ECG digitization requires understanding both **cardiac electrophysiology** and **paper ECG conventions**. Treating the task as pure computer vision is insufficient; it must be approached as a hybrid of signal processing, medical knowledge, and deep learning.

This document serves as the theoretical backbone for all subsequent preprocessing, modeling, and evaluation decisions in this project.

---

## 9. References

* PhysioNet ECG Databases and Documentation
* Goldberger et al., *Clinical Electrocardiography*
* ECG Signal Processing Literature
