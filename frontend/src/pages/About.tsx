import type { ReactNode } from 'react'
import { disp, mono } from '../shared'

function Sec({ titlu, children }: { titlu: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontFamily: disp, fontSize: 17, fontWeight: 600, color: '#163E73', marginBottom: 8 }}>{titlu}</div>
      <div style={{ fontSize: 14, color: '#3a4658', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}

export default function About() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ fontFamily: disp, fontSize: 24, fontWeight: 600, color: '#163E73', marginTop: 16 }}>Despre Abagnale</div>
      <div style={{ fontSize: 14.5, color: '#586A82', marginTop: 8, lineHeight: 1.6 }}>O platformă de KYC fraud detection care asistă analiștii bancari în identificarea activității suspecte dintr-un extras de cont.</div>

      <Sec titlu="Problema">
        Băncile trebuie să detecteze tranzacții suspecte (spălare de bani, fraudă). Analiștii KYC verifică manual conturi flag-uite — muncă laborioasă, subiectivă, cu ~80% false positives. Abagnale nu înlocuiește analistul, ci îl ajută să se concentreze pe ce contează.
      </Sec>

      <Sec titlu="Cum funcționează">
        Pipeline-ul rulează trei straturi complementare, fiecare prinzând alt tip de fraudă:
        <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
          <li><b>Anomaly detection</b> (Isolation Forest) — tranzacții atipice ca valoare față de profilul clientului.</li>
          <li><b>Keyword matching</b> — gambling, crypto, cash, transfer extern.</li>
          <li><b>Reguli compuse</b> — structuring, cash + transfer extern în 48h, gambling peste prag.</li>
        </ul>
        Un scoring engine combină semnalele într-un scor de risc 0–100 per client, cu explicații per tranzacție.
      </Sec>

      <Sec titlu="Tehnologii">
        <span style={{ fontFamily: mono, fontSize: 13 }}>Python · FastAPI · scikit-learn · pandas · React · TypeScript · Vite</span>
      </Sec>

      <Sec titlu="Numele">
        De la Frank Abagnale Jr., escrocul devenit consultant FBI anti-fraudă — ideea că, pentru a prinde un escroc, trebuie să gândești ca unul.
      </Sec>

      <Sec titlu="Resurse">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <a href="https://github.com/mihneabrb/abagnale" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#163E73', color: '#fff', textDecoration: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 14, fontWeight: 500 }}>
            ↗ Cod sursă pe GitHub
          </a>
          <a href="https://github.com/mihneabrb/abagnale#readme" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#163E73', textDecoration: 'none', border: '0.5px solid #C7D4E3', borderRadius: 9, padding: '10px 18px', fontSize: 14, fontWeight: 500 }}>
            Documentație (README)
          </a>
        </div>
      </Sec>
    </main>
  )
}