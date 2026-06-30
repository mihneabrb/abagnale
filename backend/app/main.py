import io
from pathlib import Path
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analysis.scoring import analizeaza, scor_risc_client
from analysis.loader import incarca_csv
from data_generator.generator import main as genereaza_date

app = FastAPI(title="Abagnale API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def asigura_date_demo():
    cale = Path(__file__).parent.parent / "data" / "tranzactii.csv"
    if not cale.exists():
        genereaza_date()


@app.get("/")
def read_root():
    return {"message": "Abagnale API is running"}


def _construieste_raspuns(df: pd.DataFrame):
    rezultat = analizeaza(df)
    clienti = []
    for cid, g in rezultat.groupby("client_id"):
        flagged = g[g["flag"] == 1].sort_values("scor_final", ascending=False)
        tranzactii = [
            {
                "id": int(r["tranzactie_id"]),
                "data": r["data"].strftime("%Y-%m-%d"),
                "descriere": r["descriere"],
                "suma": float(r["suma"]),
                "valuta": r["valuta"],
                "contraparte": r["contraparte"],
                "scor": round(float(r["scor_final"]), 3),
                "severitate": r["severitate"],
                "explicatie": r["explicatie"],
            }
            for _, r in flagged.iterrows()
        ]
        clienti.append({
            "client_id": cid,
            "scor_risc": scor_risc_client(g),
            "nr_tranzactii": int(len(g)),
            "nr_flaguite": int(len(flagged)),
            "tranzactii_flaguite": tranzactii,
        })
    clienti.sort(key=lambda c: c["scor_risc"], reverse=True)
    return {"clienti": clienti}


@app.post("/analiza")
async def analiza(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Doar fisiere CSV sunt acceptate")
    continut = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(continut))
        df["data"] = pd.to_datetime(df["data"])
        for c in ["debit", "credit", "sold"]:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
        df = df.sort_values(["client_id", "data"]).reset_index(drop=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Nu am putut citi CSV-ul")
    return _construieste_raspuns(df)


@app.get("/demo")
def demo():
    cale = Path(__file__).parent.parent / "data" / "tranzactii.csv"
    if not cale.exists():
        genereaza_date()
    df = incarca_csv()
    return _construieste_raspuns(df)