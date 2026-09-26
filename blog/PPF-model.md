---
title: "The Zero-Sum Silicon Game: Analyzing US Tech Dominance via the PPF Model"
description: "A production-possibilities model for semiconductor design, fabrication, packaging, and the bottlenecks that make simple zero-sum stories misleading."
pubDate: "June 01 2024"
updated: "2026-09-26"
image: "/public/figures/ppf-og.png"
tags: "economics, semiconductors, systems modeling"
---

Calling semiconductor strategy a *zero-sum game* is useful only for a narrow question: with a fixed pool of skilled labor, capital, power, equipment, and time **today**, what must be deferred to do more of something else? The phrase becomes misleading when used as a permanent description of the industry. Tooling, training, research, trade, and better processes can move the frontier itself. Design and manufacturing also depend on one another; an additional designer is not a substitute for a lithography system.

This article builds a production-possibilities frontier (PPF) as a **model**, then tests where that model breaks. It does not claim that the plotted units are measured U.S. output. The simulator below uses normalized illustrative values so that the assumptions are visible.

![Two semiconductor production frontiers: a current trade-off and a possible outward shift](/public/figures/ppf-system.svg)

## First define the outputs

“Software versus hardware” is too coarse. A useful semiconductor model separates at least four capabilities:

1. **Design**: architecture, RTL, verification, EDA flows, and reusable IP.
2. **Fabrication**: process integration, wafer starts, yield, and equipment utilization.
3. **Assembly and advanced packaging**: substrate, interconnect, thermal design, and test.
4. **Supporting inputs**: chemicals, materials, tooling, utilities, logistics, and trained people.

The outputs do not share a natural unit. A tape-out, a wafer start, and a packaged accelerator are different objects. For an analytical sketch, normalize each to an index of capability. Keep that normalization explicit; otherwise a graph can make incomparable quantities look interchangeable.

NIST describes metrology needs spanning laboratory R&D, prototyping, fabrication, assembly, packaging, and verification. That is a useful warning against treating “making chips” as one stage. [NIST’s metrology report](https://www.nist.gov/system/files/documents/2023/06/05/CHIPS_Metrology-Gaps-in-the-Semi-Ecosystem_0.pdf) also notes that the U.S. led in design and R&D while accounting for roughly 10% of commercial global production at the time of its 2023 assessment. That is a dated observation, not a current market-share estimate.

## A deliberately small PPF model

Let a short-run resource budget be $R$. Allocate a fraction $s$ to design and the remainder to fabrication. With diminishing returns, an illustrative model is:

$$D(s)=A(sR)^\alpha,\qquad F(s)=B((1-s)R)^\beta,\qquad 0\le s\le 1$$

Here $D$ and $F$ are normalized capabilities; $A$ and $B$ represent productivity; and $0<\alpha,\beta<1$ creates diminishing marginal returns. Holding $A$, $B$, $R$, and the exponents fixed, varying $s$ traces a frontier. A point inside it suggests unused or poorly matched resources **under this model**, not proof of real-world inefficiency.

The local slope, $-dF/dD$, is an opportunity-cost measure: how much fabrication capability the model gives up for a small increase in design capability. Because the functions are curved, this cost changes with the starting allocation. Moving engineers between organizations is not instantaneous, however, and capital equipment cannot be reallocated like hours on a calendar. The mathematical slope is a thought experiment, not a staffing instruction.

<div class="simulation" data-sim="ppf"><h3>Explore the frontier</h3><p>Move the allocation slider. The outputs are normalized model units, not observed national production.</p><div class="sim-ui">Interactive model loading…</div></div>

## Why the frontier is not the whole supply chain

A design becomes a shipped chip only after fabrication, packaging, test, and delivery. If normalized stage capacities are $D$, $F$, $P$, and $T$, a toy bottleneck model is $Q=\min(D,F,P,T)$. The minimum is crude, but it exposes an important point: adding design capacity does little to final throughput when packaging is the limiting stage. The stages are often **complements**, even when a policy budget must be divided among them.

The bottleneck can shift over time. A higher-yield process increases usable output from the same wafer starts; a packaging advance can unlock a design already waiting for integration; measurement and standards can improve both. NIST specifically identifies advanced packaging, models, interoperability, and supply-chain assurance as metrology priorities. These are not side issues to a design-versus-fab contest; they change the conversion of inputs into usable devices. [NIST CHIPS Metrology Program](https://www.nist.gov/chips/research-development-programs/metrology-program).

## Static allocation versus a moving frontier

Three mechanisms can move the frontier outward:

- **Productivity**: better process control, EDA, simulation, and yield learning raise $A$ or $B$.
- **Capacity**: new equipment, facilities, power delivery, and trained teams increase the feasible resource base $R$.
- **Complementarity**: shared standards, packaging, and research reduce coordination losses between stages.

These mechanisms take different amounts of time. A new fab requires long-lived capital and a local ecosystem. A design team may scale differently, but depends on process design kits, EDA tools, and available foundry capacity. Investment can also fail to move the frontier if skilled labor, utilities, or packaging remain scarce. The correct question is therefore not simply “which side wins?” It is “which constraint is binding, over what horizon, and what intervention changes that constraint?”

U.S. business R&D data can inform this question, but expenditure is an **input**, not a direct measure of technical output. The [National Science Foundation’s semiconductor R&D analysis](https://ncses.nsf.gov/pubs/nsf25304) separates industry categories and describes the data source and limitations. It should be read alongside production, yield, trade, workforce, and packaging measures rather than substituted for them.

## Comparative advantage has a dependency cost

Specialization can raise aggregate output when organizations focus on what they do well and trade for the rest. In semiconductors, specialization also creates dependencies on foreign or single-source facilities, materials, and expertise. A PPF drawn for one country does not show the resilience of a global supply chain or the cost of a disruption. Nor does a domestic-capacity target automatically imply that every stage should be replicated at any cost.

A more complete decision model would include expected output **and** exposure to rare interruptions. For example, a planner might compare two feasible portfolios under the same budget:

| Portfolio | Expected short-run output | Disruption exposure | Capability gained |
| --- | --- | --- | --- |
| Specialize heavily | Potentially higher | Concentrated supplier risk | Deep expertise in one stage |
| Diversify selectively | Potentially lower initially | Some redundancy | Learning and option value in constrained stages |

Those are directions, not measured outcomes. The actual comparison requires probabilities, recovery times, substitution possibilities, and costs. “Domestic” alone is not a reliability metric; a single domestic site can also fail.

## How to use the model without overstating it

1. **State the time horizon.** A short-run allocation frontier and a decade-long investment frontier are different objects.
2. **Name the constrained resource.** Money, skilled labor, cleanroom capacity, water, power, and equipment are not interchangeable.
3. **Measure each stage separately.** Design starts, yield-adjusted wafer output, packaging capacity, and delivered devices answer different questions.
4. **Test the bottleneck.** If packaging is binding, shifting design resources toward fabrication may not move final deliveries.
5. **Show uncertainty.** Use ranges for productivity, demand, and disruption rather than a single precise-looking line.

The PPF is valuable because it forces an opportunity-cost question. Its limit is equally valuable: the semiconductor ecosystem is a network of complementary stages whose frontier can move. A useful strategy measures both the trade-off **and** the mechanisms that make the trade-off less severe.

### Sources and further reading

- [NIST, *Metrology Gaps in the Semiconductor Ecosystem* (2023)](https://www.nist.gov/system/files/documents/2023/06/05/CHIPS_Metrology-Gaps-in-the-Semi-Ecosystem_0.pdf)
- [NIST, CHIPS Metrology Program](https://www.nist.gov/chips/research-development-programs/metrology-program)
- [NSF NCSES, U.S. Business R&D in Semiconductor-Related Industries](https://ncses.nsf.gov/pubs/nsf25304)
