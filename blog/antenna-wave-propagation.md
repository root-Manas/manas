---
title: "Antenna Theory and Wave Propagation: Fundamentals for Security Researchers"
description: "A practical derivation of wavelength, antenna gain, path loss, noise, multipath, and what a radio link budget can actually tell a security researcher."
pubDate: "June 05 2024"
updated: "2026-09-26"
image: "/public/figures/rf-og.png"
tags: "RF, wireless, link budget"
---

Radio investigations often begin with a tool name or a frequency label. A stronger starting point is a **link model**: where is energy launched, how does it propagate, what reaches the receiver, and what noise and interference compete with it? That model prevents two common errors: assuming a signal cannot be received outside a nominal coverage map, and assuming that hearing a signal means its content is readable.

This article develops a first-order link budget, then lists the conditions under which it stops being predictive. The interactive calculator is a teaching model for unobstructed free space; it is not a site survey or an authorization to intercept traffic.

![A direct RF path, reflected path, antennas, and link-budget terms](/public/figures/rf-link.svg)

## From frequency to wavelength

An electromagnetic wave in vacuum travels at $c\approx299{,}792{,}458$ m/s. Frequency $f$ and wavelength $\lambda$ satisfy $\lambda=c/f$. At 2.4 GHz, the free-space wavelength is about 0.125 m. At 900 MHz it is about 0.333 m. Wavelength matters because antenna dimensions, diffraction around obstacles, and the size of the Fresnel zone scale with it.

An antenna is not simply a “signal amplifier.” It converts between guided energy and a radiated field and distributes sensitivity by direction and polarization. Gain in **dBi** compares radiation in a specified direction with an ideal isotropic radiator. A higher directional gain usually narrows the angular pattern; it does not create power. Effective aperture relates to gain as $A_e=G\lambda^2/(4\pi)$ when $G$ is linear, linking reception to wavelength and direction.

The far-field approximation itself has a boundary. A commonly used antenna criterion is $r\gtrsim 2D^2/\lambda$, where $D$ is the largest antenna dimension. Close to a large array, field geometry can differ from the plane-wave model used below. The criterion is a design rule, not a sharp physical wall.

## Deriving the free-space loss term

For an isotropic source, power spreads over the area of a sphere, $4\pi d^2$. The power density at distance $d$ is $P_t/(4\pi d^2)$. Multiply by the receiving antenna’s effective aperture and include transmit and receive gains to obtain the Friis relation:

$$P_r=P_tG_tG_r\left(\frac{\lambda}{4\pi d}\right)^2$$

In decibels, the engineering form is $P_r(\mathrm{dBm})=P_t+G_t+G_r-L_{FS}-L_{other}$. The free-space basic transmission loss is:

$$L_{FS}=20\log_{10}\!\left(\frac{4\pi d}{\lambda}\right)\ \mathrm{dB}$$

With frequency in MHz and distance in km, [ITU-R P.525-5](https://www.itu.int/rec/R-REC-P.525-5-202411-I/en) gives the convenient approximation $L_{FS}\approx32.4+20\log_{10}f_{MHz}+20\log_{10}d_{km}$ dB. The unit convention is essential: inserting GHz or meters into that form without conversion produces a plausible-looking but wrong number.

For example, an unobstructed 2.4 GHz path over 1 km has approximately 100 dB free-space loss. With 20 dBm transmit power and 2 dBi antennas at both ends, the ideal received power is near $-76$ dBm before cable, polarization, obstruction, and fading losses. This is a budget illustration, not a prediction of a real street or building.

<div class="simulation" data-sim="rf"><h3>Radio link budget</h3><p>Change frequency, distance, power, and gains. The estimate assumes far-field, unobstructed free-space propagation.</p><div class="sim-ui">Interactive calculator loading…</div></div>

## Noise floor and usable signal

Received power alone does not tell us whether a receiver can decode a transmission. Thermal noise power is approximately $N=kTB$, where $k$ is Boltzmann’s constant, $T$ is system noise temperature, and $B$ is receiver bandwidth. In common dBm shorthand at roughly room temperature, $N\approx-174+10\log_{10}(B_{Hz})+NF$, where $NF$ is receiver noise figure in dB. The $-174$ term is an approximation tied to temperature, not a universal constant of every receiver. [NIST defines the SI value of $k$](https://www.nist.gov/si-redefinition/meet-constants).

At 20 MHz bandwidth, thermal noise is about $-101$ dBm before noise figure; a 5 dB noise figure moves the receiver floor near $-96$ dBm. The ideal $-76$ dBm example then has roughly 20 dB signal-to-noise ratio. Whether that is enough depends on modulation, coding, error target, interference, and implementation. In an actual assessment, measure rather than infer these from a marketing range claim.

## What free space leaves out

The simple formula assumes clear line of sight, matched polarization, far-field conditions, and no significant reflections or absorption. Real links depart from it in several ways:

- **Obstruction and diffraction.** The first Fresnel zone has radius $r_1\approx\sqrt{\lambda d_1d_2/(d_1+d_2)}$ at a point with path distances $d_1$ and $d_2$. A visually clear centerline can still have poor Fresnel clearance.
- **Multipath.** A reflected wave may reinforce or cancel the direct wave depending on phase, delay, and position. A small receiver movement can change the result.
- **Polarization mismatch.** Antennas with different linear orientations lose coupled power; polarization can also change along a reflected path.
- **Material and weather loss.** Walls, foliage, terrain, rain, and gases add frequency-dependent attenuation.
- **Interference.** Another transmitter can dominate the link even when thermal noise is low.

[ITU-R P.530](https://www.itu.int/rec/R-REC-P.530-19-202509-I/en) treats terrestrial line-of-sight design as a statistical problem involving diffraction, rain, multipath, and cross-polar effects. This is why a single free-space budget should be read as a baseline, not as a coverage guarantee.

## The security interpretation

RF range is a property of a transmitter, receiver, antennas, environment, and required signal quality together. It is not a fixed radius drawn around an access point. A more sensitive receiver or directional antenna can detect a signal beyond a client device’s practical service area. Conversely, a strong signal can be unusable because of interference or protocol protections.

Separate three questions during an authorized review:

1. **Can energy be detected?** A spectrum observation answers only that some power is present in a band.
2. **Can a transmission be demodulated?** This requires sufficient signal quality and a compatible physical layer.
3. **Can content or control be understood or changed?** This depends on protocol design, authentication, encryption, keys, and implementation, not only RF power.

The same distinction matters defensively. A physical-layer map can identify unexpected reach, interference, or a weak link margin, but it cannot establish a cryptographic weakness. Document the frequency, bandwidth, antenna geometry, power assumptions, receiver, environment, and observed measurements before drawing a security conclusion.

### Sources and further reading

- [ITU-R P.525-5, Calculation of free-space attenuation](https://www.itu.int/rec/R-REC-P.525-5-202411-I/en)
- [ITU-R P.530-19, terrestrial line-of-sight propagation methods](https://www.itu.int/rec/R-REC-P.530-19-202509-I/en)
- [NIST, SI value of the Boltzmann constant](https://www.nist.gov/si-redefinition/meet-constants)
