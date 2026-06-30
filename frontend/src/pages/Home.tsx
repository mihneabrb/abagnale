import { useNavigate } from 'react-router-dom'
import { disp, mono, DigitScan } from '../shared'

const features = [
  { t: 'Anomaly detection', d: 'Isolation Forest învață profilul normal al fiecărui client și scoate la iveală tranzacțiile atipice ca valoare.' },
  { t: 'Keyword matching', d: 'Dicționare pe categorii (gambling, crypto, cash, transfer extern) prind tiparele pe care anomaliile numerice le ratează.' },
  { t: 'Reguli compuse', d: 'Structuring, depunere numerar urmată de transfer extern în 48h, gambling peste pragul de venit — reguli din experiența KYC reală.' },
]

export default function Home() {
  const nav = useNavigate()
  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 24px' }}>
      <section style={{ background: 'linear-gradient(135deg,#F6F9FC,#E4EEF8 60%,#EDE6DA 170%)', border: '0.5px solid #D5DFEA', borderRadius: 18, padding: '40px 36px', marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 12, color: '#0E7E92', marginBottom: 12 }}>// to catch a fraudster, think like one</div>
            <div style={{ fontFamily: disp, fontSize: 34, lineHeight: 1.12, color: '#163E73', fontWeight: 600 }}>Gândește ca<br />un escroc.</div>
            <div style={{ fontSize: 14.5, color: '#586A82', marginTop: 14, lineHeight: 1.6, maxWidth: 380 }}>Abagnale asistă analiștii KYC: încarci un extras de cont, iar platforma încadrează tranzacțiile suspecte cu scor de risc și explicații clare.</div>
            <button onClick={() => nav('/analiza')} style={{ marginTop: 22, background: '#2C7BD6', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 26px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Analizează un extras →</button>
          </div>
          <DigitScan height={220} />
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 14, marginTop: 22 }}>
        {features.map(f => (
          <div key={f.t} style={{ background: '#fff', border: '0.5px solid #D5DFEA', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: disp, fontSize: 15, fontWeight: 500, color: '#163E73' }}>{f.t}</div>
            <div style={{ fontSize: 13, color: '#586A82', marginTop: 8, lineHeight: 1.55 }}>{f.d}</div>
          </div>
        ))}
      </div>
    </main>
  )
}