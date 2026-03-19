# GigShield AI — Parametric Income Insurance for Gig Workers

**Guidewire DEVTrails 2026 · Team: GIGABIT**

---

## The Problem

India's 12+ million gig delivery partners lose 20–30% of monthly income during external disruptions — monsoon rain, extreme heat, curfews, bandhs. Zero income protection. When they can't deliver, they earn nothing.

## Our Solution

GigShield is an AI-powered parametric insurance platform that:
- Detects disruptions automatically via real-time weather APIs
- Triggers payouts with **zero rider input** — no paperwork, no claim forms
- Credits lost income **within minutes** via UPI
- Covers all major Indian metro cities

---

## Phase 1 Challenge Response — Adversarial Defense & Anti-Spoofing Strategy

> *"500 delivery partners. Fake GPS. Real payouts. A coordinated fraud ring just drained a platform's liquidity pool. Simple GPS verification is dead. How does GigShield fight back?"*

The challenge asks three specific questions. We answer each directly.

---

### Question 1 — How do you spot the faker from the genuinely stranded worker?

A real stranded worker and a GPS spoofer look similar on the surface — both appear inside the rain zone, both have zero deliveries. The difference is in the **consistency of their signals across multiple data points.**

A genuinely stranded worker shows:
- GPS location stable inside the disrupted zone (not moving — they're stuck)
- Zero order completions — consistent with the disruption
- Location matches the zone they have historically worked in
- Device and network signals align with their GPS pin

A GPS spoofer shows at least one of these breaks:
- **Impossible travel:** GPS jumps more than 5km in under 2 minutes — physically impossible
- **Activity mismatch:** GPS is "moving through the zone" but zero orders = the platform sees no activity consistent with being present
- **Zone history mismatch:** Worker has never operated in that zone before today — suddenly claiming from a flood hotspot
- **Tower vs. GPS conflict:** The mobile network tower their device is connected to places them 8km away from their GPS pin

Any single break raises a flag. Two or more breaks = automatic hold, no payout released.

---

### Question 2 — What data catches a fraud ring?

A fraud ring is not one bad actor — it's coordination. That coordination always leaves a pattern in the data, even when individual accounts look legitimate.

**The data signals that expose a ring:**

| Data Point | What a Ring Looks Like |
|------------|----------------------|
| Device fingerprints | Multiple accounts registered from the same phone or shared device |
| IP / network block | Sudden spike in new registrations from the same IP range within 24 hours |
| UPI / bank details | Different account names but same UPI handle or same bank account number |
| Claim timing | 50+ accounts all triggering claims within the same 30-minute window |
| Geographic clustering | Dozens of "different" workers all pinned to the same 500m radius simultaneously |
| Account age vs. claim size | Brand new accounts immediately claiming the maximum payout tier |

No single signal is enough to block — a real mass disruption will also produce clustered claims. The difference is that a fraud ring shows **multiple signals firing together**. A genuine flood event produces clustered claims but those accounts have diverse device fingerprints, varied UPI IDs, and established work histories in that zone.

The rule: if 3 or more of these signals align on the same claim batch → the batch is held and escalated, not auto-paid.

---

### Question 3 — How do you flag bad actors without punishing honest ones?

This is the hardest problem. Flag too loosely and fraud slips through. Flag too tightly and a worker stranded in a real flood gets their payout held while they have no income. Both are failures.

GigShield's approach: **never block, only score and tier the response.**

Every claim gets a fraud risk score based on the signals above. The score determines the response — not a binary approve/deny:

| Risk Score | Response |
|------------|----------|
| Low (clean signals) | Auto-approve, instant payout |
| Medium (1–2 flags) | Approve at reduced amount (60%), flag for review within 2 hours |
| High (3+ flags) | Hold payout, worker gets SMS with one-tap appeal, 2-hour review SLA |

**Why this protects honest workers:**

- Weather triggers are binary and third-party — a real disruption is confirmed by Open-Meteo data, not by the worker's claim. No honest worker is ever denied on the grounds of weather.
- Holds are not denials. A held payout is reviewed within 2 hours and released if the worker is genuine. They are never permanently blocked based on automated scoring alone.
- Established workers (30+ days, clean history) are fast-tracked — their prior behavior is their credential. They skip the queue entirely.
- Every worker can see exactly why their payout was scored the way it was — no black box.

**The key principle:** the system should be harder to game than it is to use honestly. A real stranded worker needs to do nothing — the weather data speaks for them. A fraudster needs to simultaneously fake GPS, fake work history, use a unique device, avoid IP clustering, and not share UPI details with co-conspirators. The honest path is frictionless. The fraud path is expensive.

---

### Full Defense Summary

| Scenario | Key Signals | Response |
|----------|-------------|----------|
| Real stranded worker | Stable GPS, zero orders, confirmed weather, clean history | ✅ Instant auto-payout |
| GPS spoofer | Impossible travel, tower mismatch, zone history gap | ❌ Flagged, payout held |
| Fraud ring (bulk) | Device clusters, same UPI, synchronized claim timing | ❌ Batch held, escalated |
| Near-threshold gaming | Repeated claims just above trigger cutoff, no disruption pattern | ⚠️ Reduced payout, reviewed |
| New but genuine worker | New account, real weather, unique device, no cluster signals | ✅ Reduced cap, auto-approved |
| Established honest worker | 30+ days history, clean score | ✅ Fast-tracked, no queue |

---

## Persona

**Food Delivery Partners** — Zomato & Swiggy riders across Pan-India metro cities

---

## Weekly Premium Model

Premium is dynamically calculated based on:
- City-level flood/disruption risk score
- Current season (monsoon = higher risk = higher premium)
- Rider's average daily earnings
- Selected coverage tier (Basic / Standard / Premium)

**Example: Mumbai rider, Standard plan, Monsoon season**
- Daily earning: Rs.800 · Zone risk: 0.90 · Season multiplier: 1.8
- Weekly Premium: ~Rs.104 · Coverage: Rs.4,000

---

## Parametric Triggers

| Trigger | Threshold | Payout |
|---------|-----------|--------|
| Heavy Rain | > 64.5mm/day | 60% of weekly coverage |
| Moderate Rain | > 15.6mm/day | 30% of weekly coverage |
| Extreme Heat | > 45°C | 40% of weekly coverage |
| High Wind | > 62 km/h | 35% of weekly coverage |

**Data source:** Open-Meteo API (real-time, free, no API key required)

---

## AI/ML Integration (Planned)

1. **Premium Engine** — Random Forest model trained on synthetic records
   - Features: city_risk, season_multiplier, daily_earning, experience, tier

2. **Fraud Detector** — Rule-based anomaly scoring system as described in the defense strategy above

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS (Current Prototype) |
| Planned Backend | Python + FastAPI |
| Planned ML | scikit-learn Random Forest |
| Weather API | Open-Meteo (free, no key required) |
| Planned Payments | Razorpay Test Mode |

---

## Repository Structure

```
GigShield-AI/
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── index.html
└── README.md
```

---

## Development Phases

- **Phase 1 (Mar 4–20):** Prototype UI + Adversarial Defense Strategy ← *current*
- **Phase 2 (Mar 21–Apr 4):** Backend, policy engine, real weather triggers, UPI payouts
- **Phase 3 (Apr 5–17):** ML fraud detection, admin dashboard, final polish
