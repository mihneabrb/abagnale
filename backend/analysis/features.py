import pandas as pd
from analysis.loader import incarca_csv

FEATURES = [
    "suma_normalizata", "zi_luna", "zi_saptamana", "este_weekend",
    "este_cash", "este_transfer_extern", "frecventa_contraparte",
    "suma_7zile", "suma_30zile", "este_debit",
]

CUVINTE_CASH = ["numerar", "cash"]


def _este_cash(desc):
    d = str(desc).lower()
    return int(any(k in d for k in CUVINTE_CASH))


def _este_transfer_extern(desc, contraparte):
    d = str(desc).lower()
    cp = str(contraparte).upper()
    return int("extern" in d or (cp.startswith("IBAN") and "RO" not in cp[:7]))


def _rolling_sum(df, zile):
    parti = []
    for _, g in df.groupby("client_id"):
        g = g.sort_values("data")
        r = g.set_index("data")["suma"].rolling(f"{zile}D").sum()
        parti.append(pd.Series(r.values, index=g.index))
    return pd.concat(parti).sort_index()


def calculeaza_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["suma"] = df["debit"] + df["credit"]
    df["este_debit"] = (df["debit"] > 0).astype(int)
    df["zi_luna"] = df["data"].dt.day
    df["zi_saptamana"] = df["data"].dt.dayofweek
    df["este_weekend"] = (df["zi_saptamana"] >= 5).astype(int)
    df["este_cash"] = df["descriere"].apply(_este_cash)
    df["este_transfer_extern"] = df.apply(
        lambda r: _este_transfer_extern(r["descriere"], r["contraparte"]), axis=1
    )

    venit = df[df["credit"] > 0].groupby("client_id")["credit"].sum() / 6
    df["venit_estimat"] = df["client_id"].map(venit).fillna(1).replace(0, 1)
    df["suma_normalizata"] = df["suma"] / df["venit_estimat"]

    df["frecventa_contraparte"] = df.groupby(["client_id", "contraparte"])["tranzactie_id"].transform("count")

    df["suma_7zile"] = _rolling_sum(df, 7)
    df["suma_30zile"] = _rolling_sum(df, 30)
    return df


if __name__ == "__main__":
    df = incarca_csv()
    df = calculeaza_features(df)
    print(f"Tranzactii: {len(df)}")
    print(df[["client_id", "descriere", "suma"] + FEATURES].head(10).to_string())
    print("\nExemple cash / transfer extern:")
    print(df[(df["este_cash"] == 1) | (df["este_transfer_extern"] == 1)]
          [["client_id", "descriere", "suma_normalizata", "este_cash", "este_transfer_extern", "suma_7zile"]]
          .head(8).to_string())