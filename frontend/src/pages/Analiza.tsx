import { useState } from 'react'
import { API, disp, mono, Donut, DigitScan, styleSeveritate } from '../shared'
import type { Rezultat } from '../shared'

const TEMPLATE = `tranzactie_id,client_id,data,descriere,debit,credit,sold,contraparte,valuta,eticheta
1,Client_001,2026-01-28,Salariu,0,6500,6500,SC Exemplu SRL,RON,legitim
2,Client_001,2026-02-01,Chirie,2000,0,4500,Proprietar,RON,legitim
3,Client_001,2026-02-05,Mega Image,120,0,4380,Mega Image,RON,legitim
4,Client_002,2026-03-06,Depunere numerar,0,9500,15000,Numerar - ghiseu,RON,suspect
5,Client_002,2026-03-29,Transfer extern,38500,0,-1000,IBAN CY12 0020 0123,RON,suspect`

function descarcaTemplate() {
  const blob = new Blob([TEMPLATE], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'template_tranzactii.csv'; a.click()
  URL.revokeObjectURL(url)
}

const pasi = [
  { n: '1', t: 'Încarci datele', d: 'Un extras de cont în format CSV — sau apeși „Folosește date demo" pentru un set sintetic.' },
  { n: '2', t: 'ML-ul scanează', d: 'Anomaly detection, keyword matching și reguli compuse rulează peste fiecare tranzacție.' },
  { n: '3', t: 'Primești raportul', d: 'Scor de risc 0–100 per client și tranzacțiile flag-uite, fiecare cu explicație.' },
]

export default function Analiza() {
  const [file, setFile] = useState<File | null>(null)
  const [rezultat, setRezultat] = useState<Rezultat | null>(null)
  const [selectat, setSelectat] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [eroare, setEroare] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  async function trimite(promise: Promise<Response>) {
    setLoading(true); setEroare(null)
    try {
      const res = await promise
      if (!res.ok) throw new Error()
      const data: Rezultat = await res.json()
      setRezultat(data); setSelectat(data.clienti[0]?.client_id ?? null)
    } catch { setEroare('Nu am putut analiza. Verifică backend-ul și CSV-ul.') }
    finally { setLoading(false) }
  }
  function analizeaza() {
    if (!file) return
    const fd = new FormData(); fd.append('file', file)
    trimite(fetch(`${API}/analiza`, { method: 'POST', body: fd }))
  }
  function analizeazaDemo() { trimite(fetch(`${API}/demo`)) }
  function reset() { setRezultat(null); setSelectat(null); setFile(null) }
  const cs = rezultat?.clienti.find(c => c.client_id === selectat) ?? null

  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 24px' }}>
      {loading ? (
        <div style={{ background: '#fff', border: '0.5px solid #D5DFEA', borderRadius: 16, padding: 28, marginTop: 24 }}>
          <div style={{ fontFamily: disp, fontSize: 18, color: '#163E73', marginBottom: 14 }}>Scanez tranzacțiile…</div>
          <DigitScan />
        </div>
      ) : !rezultat ? (
        <>
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', border: '0.5px solid #D5DFEA', borderRadius: 18, padding: '36px 32px', marginTop: 24 }}>
            <div style={{ fontFamily: disp, fontSize: 24, fontWeight: 600, color: '#163E73' }}>Analizează un extras de cont</div>
            <div style={{ fontSize: 14, color: '#586A82', marginTop: 8, lineHeight: 1.6 }}>
              Coloane necesare: <span style={{ fontFamily: mono, fontSize: 12.5 }}>client_id, data, descriere, debit, credit, sold, contraparte, valuta</span>.
              <button onClick={descarcaTemplate} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#2C7BD6', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Descarcă template ↓</button>
            </div>
            <div onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f) }}
              style={{ marginTop: 20, background: 'rgba(255,255,255,0.6)', border: `1.5px dashed ${drag ? '#0E7E92' : '#18C7E6'}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
              <div style={{ fontFamily: disp, fontSize: 15, color: '#101D30' }}>Trage CSV-ul aici</div>
              <div style={{ fontSize: 12, color: '#92A1B5', margin: '4px 0 14px' }}>sau</div>
              <label style={{ display: 'inline-block', background: '#fff', border: '0.5px solid #C7D4E3', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#163E73' }}>
                Alege fișier
                <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
              </label>
              {file && <div style={{ marginTop: 12, fontFamily: mono, fontSize: 12, color: '#586A82' }}>{file.name}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={analizeaza} disabled={!file} style={{ background: file ? '#2C7BD6' : '#A9C3E2', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 28px', fontSize: 14, fontWeight: 500, cursor: file ? 'pointer' : 'default' }}>Analizează</button>
              <button onClick={analizeazaDemo} style={{ background: '#fff', color: '#163E73', border: '0.5px solid #C7D4E3', borderRadius: 9, padding: '12px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Folosește date demo →</button>
            </div>
            {eroare && <div style={{ marginTop: 14, color: '#A32D2D', fontSize: 13 }}>{eroare}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 14, marginTop: 18 }}>
            {pasi.map(p => (
              <div key={p.n} style={{ background: 'rgba(255,255,255,0.85)', border: '0.5px solid #D5DFEA', borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: '#18C7E6' }}>{p.n}</div>
                <div style={{ fontFamily: disp, fontSize: 15, fontWeight: 500, color: '#163E73', marginTop: 6 }}>{p.t}</div>
                <div style={{ fontSize: 13, color: '#586A82', marginTop: 8, lineHeight: 1.55 }}>{p.d}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, fontSize: 12.5, color: '#586A82', background: 'rgba(226,250,254,0.7)', border: '0.5px solid #BfE6F0', borderRadius: 10, padding: '10px 14px' }}>
            🔒 Datele demo sunt 100% sintetice — niciun client real. Nu încărca extrase cu date personale reale.
          </div>
        </>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18, marginTop: 6 }}>
            <span style={{ fontFamily: disp, fontSize: 20, fontWeight: 600 }}>Rezultate analiză</span>
            <button onClick={reset} style={{ marginLeft: 'auto', background: '#fff', border: '0.5px solid #D5DFEA', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#586A82' }}>Analiză nouă</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 12, marginBottom: 26 }}>
            {rezultat.clienti.map(c => {
              const activ = c.client_id === selectat
              return (
                <div key={c.client_id} onClick={() => setSelectat(c.client_id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: activ ? '2px solid #2C7BD6' : '0.5px solid #D5DFEA', borderRadius: 14, padding: 14, cursor: 'pointer', boxShadow: activ ? '0 1px 8px rgba(22,62,115,0.10)' : 'none' }}>
                  <Donut scor={c.scor_risc} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.client_id}</div>
                    <div style={{ fontSize: 12, color: '#586A82', marginTop: 4 }}>{c.nr_flaguite} flag-uite</div>
                    <div style={{ fontSize: 11, color: '#92A1B5' }}>din {c.nr_tranzactii} tranzacții</div>
                  </div>
                </div>
              )
            })}
          </div>
          {cs && (
            <div>
              <div style={{ fontFamily: disp, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Tranzacții flag-uite — {cs.client_id}</div>
              {cs.tranzactii_flaguite.map(t => {
                const s = styleSeveritate(t.severitate)
                return (
                  <div key={t.id} style={{ background: '#fff', border: '0.5px solid #D5DFEA', borderLeft: `3px solid ${s.border}`, padding: '12px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: mono, fontSize: 13, color: '#586A82', width: 92 }}>{t.data}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14 }}>{t.descriere}</div>
                        <div style={{ fontSize: 12, color: '#92A1B5' }}>{t.contraparte}</div>
                      </div>
                      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.suma.toLocaleString('ro-RO')} {t.valuta}</span>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.text, minWidth: 66, textAlign: 'center' }}>{s.label}</span>
                    </div>
                    {t.explicatie && <div style={{ fontSize: 12, color: '#586A82', marginTop: 8, paddingLeft: 106 }}>{t.explicatie}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </main>
  )
}