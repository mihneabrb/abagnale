import csv
from pathlib import Path

CAMPURI = {
    "tranzactie_id",
    "client_id",
    "data",
    "descriere",
    "debit",
    "credit",
    "sold",
    "contraparte",
    "valuta",
}

tranzactii_proba = [
    {
        "tranzactie_id" : 1,
        "client_id": "Client_001",
        "data": "2026-01-31",
        "descriere": "Salariu ianuarie",
        "debit": 0,
        "credit": 6500,
        "sold": 6500,
        "contraparte": "SC Exemplu SRL",
        "valuta": "RON",
    },
    {
        "tranzactie_id": 2,
        "client_id": "Client_001",
        "data": "2026-02-02",
        "descriere": "Chirie februarie",
        "debit": 2000,
        "credit": 0,
        "sold": 4500,
        "contraparte": "Ion Popescu",
        "valuta": "RON",
    },
    {
        "tranzactie_id": 3,
        "client_id": "Client_001",
        "data": "2026-02-05",
        "descriere": "Glovo food delivery",
        "debit": 75,
        "credit": 0,
        "sold": 4425,
        "contraparte": "Glovo",
        "valuta": "RON",
    },
]

def scrie_csv(tranzactii, cale_fisier):
    with open(cale_fisier, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CAMPURI)
        writer.writeheader()
        writer.writerows(tranzactii)

if __name__ == "__main__":
    folder_data = Path (__file__).parent.parent / "data"
    folder_data.mkdir(exist_ok=True)
    cale = folder_data / "tranzactii.csv"
    scrie_csv(tranzactii_proba, cale)
    print(f"Am scris {len(tranzactii_proba)} tranzactii in {cale}")