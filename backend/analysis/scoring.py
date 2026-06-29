import pandas as pd

from analysis.loader import incarca_csv
from analysis.features import calculeaza_features
from analysis.anomaly import detecteaza_anomalii
from analysis.keywords import potriveste_keywords
from analysis.reguli import aplica_reguli

W_ANOM, W_KEYWORD, W_REGULA = 0.35, 0.25, 0.40


def _explicatie(row):
    parti = list(row["reguli"])
    for cat in row["categorii_keyword"]:
        parti.append(f"Categorie: {cat}")
    if row["anomalie"] == 1 and not parti:
        parti.append("Anomalie statistica fata de profilul clientului")
    return "; ".join(parti)


def _severitate(scor):
    if scor >= 0.7:
        return "ridicata"
    if scor >= 0.4:
        return "medie"
    return "scazuta"


def analizeaza(df: pd.DataFrame) -> pd.DataFrame:
    df = calculeaza_features(df)
    df = detecteaza_anomalii(df)
    df = potriveste_keywords(df)
    df = aplica_reguli(df)

    df["scor_final"] = (W_ANOM * df["scor_anomalie"]
                        + W_KEYWORD * df["scor_keyword"]
                        + W_REGULA * df["scor_regula"]).clip(0, 1)
    df["flag"] = ((df["scor_regula"] > 0) | (df["scor_keyword"] >= 0.5) | (df["anomalie"] == 1)).astype(int)
    df["severitate"] = df["scor_final"].apply(_severitate)
    df["explicatie"] = df.apply(_explicatie, axis=1)
    return df


def scor_risc_client(df_client: pd.DataFrame) -> int:
    flagged = df_client[df_client["flag"] == 1]
    if len(flagged) == 0:
        return int(round(100 * df_client["scor_final"].max() * 0.5))
    risc = 0.7 * flagged["scor_final"].max() + 0.3 * flagged["scor_final"].mean()
    return int(min(100, round(100 * risc)))


if __name__ == "__main__":
    df = analizeaza(incarca_csv())

    print("=== Scor de risc per client ===")
    for cid, g in df.groupby("client_id"):
        print(f"  {cid}: risc={scor_risc_client(g)}/100, flag-uite={int(g['flag'].sum())}")

    print("\n=== Top 12 tranzactii flag-uite ===")
    flagged = df[df["flag"] == 1].sort_values("scor_final", ascending=False).head(12)
    print(flagged[["client_id", "descriere", "suma", "scor_final",
                   "severitate", "eticheta", "explicatie"]].to_string())