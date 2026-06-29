import csv
import random
from pathlib import Path
from datetime import date

random.seed(42)  # date reproductibile

CAMPURI = [
    "tranzactie_id", "client_id", "data", "descriere",
    "debit", "credit", "sold", "contraparte", "valuta", "eticheta",
]

PROFILURI = [
    {"client_id": "Client_001", "tip": "salariat",   "venit": 6500, "chirie": 2000, "sold_initial": 4000, "suspect": False},
    {"client_id": "Client_002", "tip": "freelancer", "venit": 9000, "chirie": 2500, "sold_initial": 8000, "suspect": True},
    {"client_id": "Client_003", "tip": "pensionar",  "venit": 2100, "chirie": 0,    "sold_initial": 3000, "suspect": False},
    {"client_id": "Client_004", "tip": "casnica",    "venit": 0,    "chirie": 1500, "sold_initial": 2000, "suspect": True},
]

MAGAZINE = ["Mega Image", "Lidl", "Kaufland", "Carrefour", "Profi", "Glovo food delivery", "Tazz by eMAG"]
TRANSPORT = ["Bolt ride", "Uber trip", "OMV benzina", "STB abonament", "Rompetrol"]
UTILITATI = [("Enel energie", "Enel"), ("Digi internet", "RCS-RDS"), ("Engie gaz", "Engie"), ("Apa Nova", "Apa Nova")]
SHOPPING = ["eMAG", "Amazon", "Decathlon", "H&M", "Altex", "IKEA"]
GAMBLING = ["Superbet", "Betano", "bet365", "Fortuna"]
CRYPTO = ["Binance", "Coinbase", "Kraken"]


def tx(client_id, d, descriere, debit, credit, contraparte, valuta="RON", eticheta="legitim"):
    return {
        "tranzactie_id": 0, "client_id": client_id, "data": d, "descriere": descriere,
        "debit": debit, "credit": credit, "sold": 0,
        "contraparte": contraparte, "valuta": valuta, "eticheta": eticheta,
    }


def genereaza_legitim(profil, an, luni=6):
    cid = profil["client_id"]
    out = []
    for luna in range(1, luni + 1):
        if profil["tip"] == "salariat":
            out.append(tx(cid, date(an, luna, 28), "Salariu", 0, profil["venit"], "SC Exemplu SRL"))
        elif profil["tip"] == "pensionar":
            out.append(tx(cid, date(an, luna, 12), "Pensie", 0, profil["venit"], "Casa de Pensii"))
        elif profil["tip"] == "freelancer":
            for _ in range(random.randint(1, 2)):
                out.append(tx(cid, date(an, luna, random.randint(5, 25)), "Invoice payment",
                              0, random.randint(3000, 6000), "Client extern SRL"))
        if profil["chirie"] > 0:
            out.append(tx(cid, date(an, luna, 1), "Chirie", profil["chirie"], 0, "Proprietar"))
        for desc, cp in random.sample(UTILITATI, k=2):
            out.append(tx(cid, date(an, luna, random.randint(8, 16)), desc, random.randint(80, 350), 0, cp))
        for _ in range(random.randint(6, 10)):
            m = random.choice(MAGAZINE)
            out.append(tx(cid, date(an, luna, random.randint(1, 28)), m, random.randint(25, 320), 0, m))
        for _ in range(random.randint(2, 5)):
            t = random.choice(TRANSPORT)
            out.append(tx(cid, date(an, luna, random.randint(1, 28)), t, random.randint(15, 250), 0, t))
        if random.random() < 0.5:
            s = random.choice(SHOPPING)
            out.append(tx(cid, date(an, luna, random.randint(1, 28)), s, random.randint(100, 900), 0, s))
    return out


def injecteaza_suspecte(profil, an):
    cid = profil["client_id"]
    out = []
    if profil["tip"] == "freelancer":
        for zi in [6, 17, 27]:
            out.append(tx(cid, date(an, 3, zi), "Depunere numerar", 0, random.randint(9300, 9900),
                          "Numerar - ghiseu", eticheta="suspect"))
        out.append(tx(cid, date(an, 3, 29), "Transfer extern", 38500, 0, "IBAN CY12 0020 0123", eticheta="suspect"))
        for luna in [2, 4, 5]:
            broker = random.choice(CRYPTO)
            out.append(tx(cid, date(an, luna, random.randint(3, 25)), broker + " top-up",
                          random.randint(800, 2500), 0, broker, valuta="EUR", eticheta="suspect"))
    if profil["tip"] == "casnica":
        for luna in [2, 4]:
            out.append(tx(cid, date(an, luna, random.randint(5, 20)), "Transfer primit",
                          0, random.randint(12000, 20000), "Persoana fizica", eticheta="suspect"))
        for _ in range(6):
            g = random.choice(GAMBLING)
            out.append(tx(cid, date(an, random.randint(1, 6), random.randint(1, 28)), g + " depunere",
                          random.randint(300, 1500), 0, g, eticheta="suspect"))
    return out


def scrie_csv(tranzactii, cale_fisier):
    with open(cale_fisier, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CAMPURI)
        writer.writeheader()
        writer.writerows(tranzactii)


def main():
    an = 2026
    toate = []
    for profil in PROFILURI:
        tranzactii = genereaza_legitim(profil, an)
        if profil["suspect"]:
            tranzactii += injecteaza_suspecte(profil, an)
        toate += tranzactii

    toate.sort(key=lambda t: (t["client_id"], t["data"]))

    sold = {p["client_id"]: p["sold_initial"] for p in PROFILURI}
    for idx, t in enumerate(toate, start=1):
        t["tranzactie_id"] = idx
        cid = t["client_id"]
        if t["valuta"] == "RON":
            sold[cid] += t["credit"] - t["debit"]
        t["sold"] = round(sold[cid], 2)

    folder_data = Path(__file__).parent.parent / "data"
    folder_data.mkdir(exist_ok=True)
    cale = folder_data / "tranzactii.csv"
    scrie_csv(toate, cale)
    print(f"Am scris {len(toate)} tranzactii pentru {len(PROFILURI)} clienti in {cale}")


if __name__ == "__main__":
    main()