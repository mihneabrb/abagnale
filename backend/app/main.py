import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analysis.scoring import analizeaza, scor_risc_client
from analysis.loader import incarca_csv

app = FastAPI(title="Abagnale API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


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

        # Verificăm dacă coloana 'data' există înainte de conversie
        if "data" not in df.columns:
            raise ValueError("Coloana 'data' lipseste din CSV")

        df["data"] = pd.to_datetime(df["data"])

        for c in ["debit", "credit", "sold"]:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
            else:
                df[c] = 0.0  # Inițializăm cu 0 dacă lipsește, ca să nu crape mai jos

        df = df.sort_values(["client_id", "data"]).reset_index(drop=True)

    except Exception as e:
        # Printează eroarea exactă în terminalul unde rulează FastAPI
        print(f"--- EROARE INTERNĂ CSV: {str(e)} ---")
        raise HTTPException(
            status_code=400,
            detail=f"Eroare la procesarea CSV-ului: {str(e)}"
        )

    return _construieste_raspuns(df)


@app.get("/demo")
def demo():
    df = incarca_csv()
    return _construieste_raspuns(df)