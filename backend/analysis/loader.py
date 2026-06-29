from pathlib import Path
import pandas as pd


def incarca_csv(cale=None) -> pd.DataFrame:
    if cale is None:
        cale = Path(__file__).parent.parent / "data" / "tranzactii.csv"
    df = pd.read_csv(cale)
    df["data"] = pd.to_datetime(df["data"])
    for c in ["debit", "credit", "sold"]:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
    df = df.sort_values(["client_id", "data"]).reset_index(drop=True)
    return df