import pandas as pd

from analysis.loader import incarca_csv
from analysis.features import calculeaza_features
from analysis.keywords import potriveste_keywords


def aplica_reguli(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().reset_index(drop=True)
    df["scor_regula"] = 0.0
    df["reguli"] = [[] for _ in range(len(df))]

    def adauga(idx, scor, text):
        df.at[idx, "scor_regula"] = max(df.at[idx, "scor_regula"], scor)
        df.at[idx, "reguli"] = df.at[idx, "reguli"] + [text]

    for cid, g in df.groupby("client_id"):
        g = g.sort_values("data")
        venit = g["venit_estimat"].iloc[0]

        # R1: structuring - 3+ depuneri numerar in 30 zile
        cash = g[(g["este_cash"] == 1) & (g["credit"] > 0)]
        for idx, row in cash.iterrows():
            fereastra = cash[(cash["data"] <= row["data"]) &
                             (cash["data"] > row["data"] - pd.Timedelta(days=30))]
            if len(fereastra) >= 3:
                adauga(idx, 1.0, f"Structuring: {len(fereastra)} depuneri numerar in 30 zile")

        # R2: depunere numerar urmata de transfer extern in 48h
        extern = g[g["este_transfer_extern"] == 1]
        for idx, row in extern.iterrows():
            recent = cash[(cash["data"] <= row["data"]) &
                          (cash["data"] >= row["data"] - pd.Timedelta(days=2))]
            if len(recent) > 0:
                adauga(idx, 1.0, "Transfer extern la <48h dupa depunere numerar")

        # R3: gambling > 20% din venitul lunar
        gambling = g[g["categorii_keyword"].apply(lambda x: "gambling" in x)].copy()
        if len(gambling):
            gambling["luna"] = gambling["data"].dt.month
            for luna, gl in gambling.groupby("luna"):
                total = gl["debit"].sum()
                if total > 0.2 * venit:
                    for idx in gl.index:
                        adauga(idx, 0.6, f"Gambling {total:.0f} RON intr-o luna (>20% din venit)")

        # R4: venit mare neexplicat de la persoana fizica
        for idx, row in g.iterrows():
            if row["credit"] > 10000 and "persoana fizica" in str(row["contraparte"]).lower():
                adauga(idx, 0.9, f"Venit mare ({row['credit']:.0f}) de la persoana fizica necunoscuta")

    return df


if __name__ == "__main__":
    df = incarca_csv()
    df = calculeaza_features(df)
    df = potriveste_keywords(df)
    df = aplica_reguli(df)

    cu_reguli = df[df["scor_regula"] > 0]
    print(f"Tranzactii cu reguli declansate: {len(cu_reguli)}")
    print(cu_reguli[["client_id", "descriere", "suma", "scor_regula", "reguli", "eticheta"]].to_string())