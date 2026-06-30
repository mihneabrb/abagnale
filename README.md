# Abagnale

> *"It's important to know who I am, before I do what I do."* — Frank Abagnale Jr.

**Abagnale** is a KYC (Know Your Customer) fraud-detection platform that assists bank analysts in spotting suspicious activity in a customer's account statement. You upload a CSV of transactions, and Abagnale flags the suspicious ones, assigns a **0–100 risk score** per customer, and explains *why* each transaction was flagged.

It doesn't replace the analyst — it helps them focus on what matters.

The name comes from Frank Abagnale Jr., the con artist turned FBI anti-fraud consultant: to catch a fraudster, you have to think like one.

---

## Screenshots

| Landing | Analysis |
|---|---|
| ![Home](screenshots/home.png) | ![Results](screenshots/results.png) |

---

## Why

Banks are legally required to detect suspicious transactions (money laundering, terrorism financing, fraud). KYC analysts manually review flagged accounts — laborious, subjective work where ~80% of cases turn out to be false positives. Abagnale automates the first pass: it surfaces the riskiest transactions with clear explanations, so analysts spend their time on real signals.

---

## Features

- **Synthetic data generator** — realistic labeled transactions across multiple customer profiles (employee, freelancer, pensioner, homemaker), with controlled fraud patterns injected. No real personal data.
- **Three-layer detection pipeline** — each layer catches a different kind of fraud.
- **Risk scoring** — combines all signals into a 0–100 score per customer.
- **Explanations** — every flag comes with a human-readable reason and severity.
- **REST API** — FastAPI backend with upload + analysis endpoints.
- **Web app** — React frontend: landing, analysis (drag & drop or one-click demo data), results, and an about page.

---

## Architecture
React (Vite + TypeScript)  ──HTTP / JSON──▶  FastAPI

landing / upload / results                  │

├─ CSV parser (pandas)

├─ Feature engineering

└─ ML pipeline

├─ Isolation Forest (anomaly)

├─ Keyword matching

├─ Compound rules

└─ Scoring engine → 0–100 + explanations

---

## ML pipeline

Three complementary layers, each catching fraud the others miss:

1. **Anomaly detection (Isolation Forest)** — learns each customer's normal profile from engineered features (amount normalized to income, day of month/week, weekend, cash, external transfer, counterparty frequency, rolling 7/30-day sums) and flags statistically atypical transactions. Fully unsupervised — never sees the labels.
2. **Keyword matching** — category dictionaries (gambling, crypto, cash, external transfer) catch patterns that look numerically ordinary, like small recurring gambling deposits.
3. **Compound rules** — KYC heuristics: structuring (3+ cash deposits under the reporting threshold within 30 days), cash deposit followed by an external transfer within 48h, gambling over a share of income, large unexplained income from individuals.

A **scoring engine** combines the three signals into a 0–100 risk score per customer with per-transaction explanations and severity (low / medium / high).

On the synthetic set (ground-truth known), suspicious transactions score ~2.8× higher than legitimate ones on the unsupervised layer alone, and both suspicious customer profiles surface at the top of the risk ranking.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 · FastAPI · uvicorn |
| ML | scikit-learn · pandas · numpy |
| Frontend | React · TypeScript · Vite · Tailwind |

---

## Project structure

abagnale/

├── backend/

│   ├── app/main.py            # FastAPI app + endpoints

│   ├── analysis/

│   │   ├── loader.py          # CSV → DataFrame

│   │   ├── features.py        # feature engineering

│   │   ├── anomaly.py         # Isolation Forest

│   │   ├── keywords.py        # keyword matching

│   │   ├── reguli.py          # compound rules

│   │   └── scoring.py         # scoring engine

│   ├── data_generator/generator.py   # synthetic data

│   └── requirements.txt

└── frontend/

└── src/

├── App.tsx            # router + layout

├── shared.tsx         # shared components / types

└── pages/             # Home, Analiza, About

---

## Getting started

**Prerequisites:** Python 3.12, Node.js 18+

### Backend

```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1          # Windows (use source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python -m data_generator.generator  # generate the synthetic dataset
uvicorn app.main:app --reload       # http://127.0.0.1:8000
```

Interactive API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Open the app and click **"Folosește date demo"** to analyze the built-in synthetic dataset — no upload needed.

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analiza` | Upload a CSV, returns the analysis as JSON |
| `GET` | `/demo` | Runs the analysis on the built-in synthetic dataset |

Expected CSV columns: `client_id, data, descriere, debit, credit, sold, contraparte, valuta`.

---

## Data & privacy

All data is **synthetic**, produced by the generator — no real customers. This is a demonstration project; do not upload real account statements containing personal data.

---

## Design decisions

- **Unsupervised-first.** Labeled fraud is scarce in the real world, so Isolation Forest (no labels needed) is the backbone. The layered approach compensates for what any single method misses.
- **Synthetic data.** Sidesteps privacy/GDPR concerns and provides ground-truth labels for evaluation.
- **Explanations over black-box scores.** An analyst needs to know *why*, not just a number — every flag carries a reason.
- **Stateless API.** No database required to run the demo.

---

## Limitations & future work

- Real bank-statement parsing (PDF → CSV) — every bank format differs and it's a privacy liability.
- Supervised classifier (Random Forest) + SHAP explainability.
- User accounts, case history, persistence (PostgreSQL).
- Live deployment.

---

## License

MIT

---

**Author:** Andrei Mihnea Barbieru