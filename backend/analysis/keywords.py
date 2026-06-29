import pandas as pd
from collections import Counter

from analysis.loader import incarca_csv
from analysis.features import calculeaza_features

CATEGORII = {
    "gambling": ["superbet", "betano", "bet365", "fortuna", "casino", "pariuri", "lotto"],
    "crypto": ["binance", "coinbase", "kraken", "bitcoin", "btc", "eth", "crypto"],
    "cash": ["numerar", "cash"],
    "transfer_extern": ["transfer extern", "iban cy", "iban ch", "offshore"],
}
SCOR_CATEGORIE = {"gambling": 0.5, "crypto": 0.5, "cash": 1.0, "transfer_extern": 1.0}


def potriveste_keywords(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    cats = []
    for _, row in df.iterrows():
        text = (str(row["descriere"]) + " " + str(row["contraparte"])).lower()
        gasite = [c for c, cuvinte in CATEGORII.items() if any(k in text for k in cuvinte)]
        cats.append(gasite)
    df["categorii_keyword"] = cats
    df["are_keyword"] = df["categorii_keyword"].apply(lambda x: int(len(x) > 0))
    df["scor_keyword"] = df["categorii_keyword"].apply(
        lambda cs: max([SCOR_CATEGORIE[c] for c in cs], default=0.0)
    )
    return df


if __name__ == "__main__":
    df = incarca_csv()
    df = calculeaza_features(df)
    df = potriveste_keywords(df)

    print(f"Tranzactii cu keyword: {int(df['are_keyword'].sum())} din {len(df)}")
    print("\n=== Pe categorie ===")
    c = Counter()
    for cats in df["categorii_keyword"]:
        c.update(cats)
    for cat, n in c.items():
        print(f"  {cat}: {n}")

    print("\n=== Gambling / crypto (ce a ratat Isolation Forest) ===")
    masca = df["categorii_keyword"].apply(lambda x: "gambling" in x or "crypto" in x)
    print(df[masca][["client_id", "descriere", "suma", "valuta",
                     "categorii_keyword", "scor_keyword", "eticheta"]].head(10).to_string())