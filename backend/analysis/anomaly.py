import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from analysis.loader import incarca_csv
from analysis.features import FEATURES, calculeaza_features


def detecteaza_anomalii(df: pd.DataFrame, contamination=0.05) -> pd.DataFrame:
    df = df.copy()
    X = df[FEATURES].fillna(0)
    X_scaled = StandardScaler().fit_transform(X)

    model = IsolationForest(n_estimators=200, contamination=contamination, random_state=42)
    model.fit(X_scaled)

    scoruri = -model.score_samples(X_scaled)
    smin, smax = scoruri.min(), scoruri.max()
    df["scor_anomalie"] = (scoruri - smin) / (smax - smin + 1e-9)  # 0..1
    df["anomalie"] = (model.predict(X_scaled) == -1).astype(int)
    return df


if __name__ == "__main__":
    df = incarca_csv()
    df = calculeaza_features(df)
    df = detecteaza_anomalii(df)

    print("=== Top 15 dupa scor de anomalie ===")
    top = df.sort_values("scor_anomalie", ascending=False).head(15)
    print(top[["client_id", "descriere", "suma", "valuta", "scor_anomalie", "eticheta"]].to_string())

    print("\n=== Scor mediu pe eticheta (validare) ===")
    print(df.groupby("eticheta")["scor_anomalie"].mean())