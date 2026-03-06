# 🛡 GigShield — AI-Powered Parametric Income Insurance for Gig Workers
 
**Guidewire DEVTrails 2026 | Team: [YOUR TEAM NAME]**
 
## The Problem
India's 12+ million platform-based delivery partners (Zomato, Swiggy) lose 20-30% of their
monthly income when external disruptions strike — heavy monsoon rain, extreme heat, local
curfews, or bandhs. They have zero income protection. When they can't deliver, they earn nothing.
 
## Our Solution: GigShield
GigShield is an AI-powered parametric insurance platform that:
- Automatically detects disruptions using real-time weather APIs
- Triggers claims with zero rider input (zero paperwork)
- Pays out lost income within minutes via UPI
- Covers all major Indian cities where Zomato/Swiggy operates
 
## Persona
**Food Delivery Partners** — Zomato & Swiggy riders across Pan-India metro cities
 
## Weekly Premium Model
Riders pay weekly (Monday to Sunday) to match their weekly payout cycle.
Premium is dynamically calculated by our AI engine based on:
- City-level flood/disruption risk score
- Current season (monsoon = higher risk = higher premium)
- Rider's average daily earnings
- Selected coverage tier (Basic / Standard / Premium)
 
**Example: Mumbai rider, Standard plan, Monsoon season**
- Daily earning: Rs.800 | Zone risk: 0.90 | Season multiplier: 1.8
- Weekly Premium: Rs.~104 | Coverage: Rs.4,000 (5 days)
 
## Parametric Triggers
Claims trigger automatically when ANY of these thresholds are crossed:
 
| Trigger | Threshold | Payout |
|---------|-----------|--------|
| Heavy Rain | > 64.5mm/day | 60% of weekly coverage |
| Moderate Rain | > 15.6mm/day | 30% of weekly coverage |
| Extreme Heat | > 45°C | 40% of weekly coverage |
| High Wind | > 62 km/h | 35% of weekly coverage |
 
Data source: Open-Meteo API (real-time, free, no API key required)
 
## AI/ML Integration
1. **Premium Engine**: Random Forest model trained on 5,000 synthetic records
   - Features: city_risk, season_multiplier, daily_earning, experience, tier
   - MAE: ~Rs.3.50 on test data
2. **Fraud Detector**: Rule-based anomaly detection system checking:
   - High claim frequency (>3 claims in 7 days)
   - Duplicate same-day triggers
   - New account exploitation
   - Near-threshold trigger values
 
## Platform Choice: Web (Mobile-First PWA)
Chosen over native mobile because:
- Instant access — no app store download required
- Works on any Android/iPhone browser
- Easier to demo and test
- Single codebase covers both rider app and admin dashboard
 
## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js (mobile-first) |
| Backend | Python + FastAPI |
| Database | SQLite (dev) |
| ML | scikit-learn Random Forest |
| Weather API | Open-Meteo (free) |
| Payments | Razorpay Test Mode |
 
## Development Plan
- Phase 1 (Mar 4-20): Foundation — DB, auth, basic UI, README
- Phase 2 (Mar 21-Apr 4): Core features — policy, claims, triggers, payouts
- Phase 3 (Apr 5-17): Advanced — fraud detection, admin dashboard, final polish
 
## Repository Structure
```
gigshield/
├── frontend/          # React mobile-first app
├── backend/           # Python FastAPI + ML
│   ├── ai/            # Premium engine + fraud detector
│   ├── routes/        # API endpoints
│   └── data/          # SQLite DB + trained model
└── README.md          # This file
```
