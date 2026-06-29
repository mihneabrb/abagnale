import { useState, useRef, useEffect } from 'react'

interface Tranzactie {
  id: number; data: string; descriere: string; suma: number; valuta: string
  contraparte: string; scor: number; severitate: string; explicatie: string
}
interface Client {
  client_id: string; scor_risc: number; nr_tranzactii: number; nr_flaguite: number
  tranzactii_flaguite: Tranzactie[]
}
interface Rezultat { clienti: Client[] }

const API = 'http://127.0.0.1:8000'
const disp = 'Space Grotesk, sans-serif'
const mono = 'IBM Plex Mono, monospace'
const ui = 'Inter, system-ui, sans-serif'

function culoareRisc(s: number): string {
  if (s >= 60) return '#E0484F'
  if (s >= 35) return '#E08A2B'
  return '#2FB389'
}
function styleSeveritate(sev: string) {
  if (sev === 'ridicata') return { border: '#E0484F', bg: '#FCEBEC', text: '#A32D2D', label: 'Ridicat' }
  if (sev === 'medie') return { border: '#E08A2B', bg: '#FBF1E2', text: '#8A5310', label: 'Mediu' }
  return { border: '#92A1B5', bg: '#EEF2F6', text: '#586A82', label: 'Scăzut' }
}

function Donut({ scor }: { scor: number }) {
  const r = 28, c = 2 * Math.PI * r
  const dash = (Math.min(scor, 100) / 100) * c
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="#E9F0F8" strokeWidth={8} />
      <circle cx={36} cy={36} r={r} fill="none" stroke={culoareRisc(scor)} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={`${dash} ${c}`} transform="rotate(-90 36 36)" />
      <text x={36} y={36} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: mono, fontSize: 19, fontWeight: 500, fill: '#101D30' }}>{scor}</text>
    </svg>
  )
}

function DigitScan() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const cx = cv.getContext('2d'); if (!cx) return
    let raf = 0
    const chars = '0123456789ABCDEF', CELL = 20, H = 240
    let W = 0, cols = 0, rows = 0
    let grid: { ch: string; ph: number; brown: boolean }[][] = []
    let anoms: { i: number; j: number; hue: number }[] = []
    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = cv!.clientWidth || 600
      cv!.width = W * dpr; cv!.height = H * dpr
      cx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.floor(W / CELL); rows = Math.floor(H / CELL)
      grid = []
      for (let j = 0; j < rows; j++) {
        const r = []
        for (let i = 0; i < cols; i++) r.push({ ch: chars[(Math.random() * 16) | 0], ph: Math.random() * 6.28, brown: Math.random() < 0.18 })
        grid.push(r)
      }
      anoms = []
      for (let k = 0; k < 4; k++) anoms.push({ i: 2 + ((Math.random() * (cols - 5)) | 0), j: 1 + ((Math.random() * (rows - 3)) | 0), hue: k % 3 === 0 ? 1 : 0 })
    }
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const mix = (c1: number[], c2: number[], t: number) => [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))]
    const bF = [200, 206, 216], bD = [23, 59, 107], rF = [214, 204, 188], rD = [110, 78, 46], teal = [14, 145, 168]
    function draw(t: number) {
      cx!.fillStyle = '#F2EEE3'; cx!.fillRect(0, 0, W, H)
      const scanX = ((t * 0.06) % (W + 220)) - 110
      cx!.font = '14px "IBM Plex Mono", monospace'; cx!.textAlign = 'center'; cx!.textBaseline = 'middle'
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * CELL + CELL / 2, y = j * CELL + CELL / 2, g = grid[j][i]
        let b = 0.34 + 0.30 * Math.sin(t * 0.0016 + g.ph + i * 0.35 + j * 0.3)
        const d = Math.abs(x - scanX), sf = d < 75 ? (1 - d / 75) : 0
        b += sf * 0.55; if (b < 0) b = 0; if (b > 1) b = 1
        let col = g.brown ? mix(rF, rD, b) : mix(bF, bD, b)
        if (sf > 0) col = mix(col, teal, sf * 0.6)
        cx!.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`
        if (Math.random() < 0.014) g.ch = chars[(Math.random() * 16) | 0]
        cx!.fillText(g.ch, x, y)
      }
      for (const o of anoms) {
        const x0 = o.i * CELL, y0 = o.j * CELL
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.004 + o.i)
        cx!.strokeStyle = o.hue ? `rgba(168,95,46,${pulse})` : `rgba(14,145,168,${pulse})`
        cx!.lineWidth = 1.4; cx!.setLineDash([4, 3]); cx!.strokeRect(x0 + 2, y0 + 2, 2 * CELL - 4, 2 * CELL - 4); cx!.setLineDash([])
      }
      raf = requestAnimationFrame(draw)
    }
    setup(); raf = requestAnimationFrame(draw)
    const onR = () => setup(); window.addEventListener('resize', onR)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} style={{ width: '100%', height: 240, display: 'block', borderRadius: 12, border: '0.5px solid #DAD3C4' }} />
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [rezultat, setRezultat] = useState<Rezultat | null>(null)
  const [selectat, setSelectat] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [eroare, setEroare] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  async function analizeaza() {
    if (!file) return
    setLoading(true); setEroare(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${API}/analiza`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data: Rezultat = await res.json()
      setRezultat(data); setSelectat(data.clienti[0]?.client_id ?? null)
    } catch {
      setEroare('Nu am putut analiza fișierul. Verifică backend-ul și CSV-ul.')
    } finally { setLoading(false) }
  }
  function reset() { setRezultat(null); setSelectat(null); setFile(null) }
  const cs = rezultat?.clienti.find(c => c.client_id === selectat) ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FB', color: '#101D30', fontFamily: ui }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'rgba(233,240,248,0.85)', backdropFilter: 'blur(8px)', borderBottom: '0.5px solid #D5DFEA', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(180deg,#EAF0F4,#B9C6D2 48%,#93A4B3 52%,#D6DEE5)', border: '0.5px solid #AFC0CD' }} />
        <span style={{ fontFamily: disp, fontSize: 18, fontWeight: 600, color: '#163E73' }}>Abagnale</span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#18C7E6' }} />
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#586A82' }}>KYC fraud detection</span>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 24px' }}>
        {loading ? (
          <div style={{ background: '#fff', border: '0.5px solid #D5DFEA', borderRadius: 16, padding: 28, marginTop: 30 }}>
            <div style={{ fontFamily: disp, fontSize: 18, color: '#163E73', marginBottom: 14 }}>Scanez tranzacțiile…</div>
            <DigitScan />
          </div>
        ) : !rezultat ? (
          <div style={{ position: 'relative', background: 'linear-gradient(135deg,#F6F9FC,#E4EEF8 60%,#EDE6DA 165%)', border: '0.5px solid #D5DFEA', borderRadius: 18, padding: '44px 36px', marginTop: 30, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, width: 120, height: 78, border: '1.5px dashed #18C7E6', borderRadius: 4, opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: 13, right: 13, fontFamily: mono, fontSize: 11, color: '#0E7E92', background: '#E2FAFE', padding: '2px 7px', borderRadius: 5 }}>anomalie 0.92</div>
            <div style={{ fontFamily: disp, fontSize: 30, lineHeight: 1.15, color: '#163E73' }}>Gândește ca un escroc.</div>
            <div style={{ fontSize: 14, color: '#586A82', marginTop: 12, maxWidth: 440, lineHeight: 1.6 }}>Încarcă un extras de cont (CSV) — Abagnale încadrează tranzacțiile suspecte, cu scor de risc și explicații.</div>
            <div onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f) }}
              style={{ marginTop: 26, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', border: `1.5px dashed ${drag ? '#0E7E92' : '#18C7E6'}`, borderRadius: 14, padding: 30, textAlign: 'center' }}>
              <div style={{ fontFamily: disp, fontSize: 15, color: '#101D30' }}>Trage CSV-ul aici</div>
              <div style={{ fontSize: 12, color: '#92A1B5', margin: '4px 0 14px' }}>sau</div>
              <label style={{ display: 'inline-block', background: '#fff', border: '0.5px solid #C7D4E3', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#163E73' }}>
                Alege fișier
                <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
              </label>
              {file && <div style={{ marginTop: 12, fontFamily: mono, fontSize: 12, color: '#586A82' }}>{file.name}</div>}
            </div>
            <button onClick={analizeaza} disabled={!file}
              style={{ marginTop: 22, background: file ? '#2C7BD6' : '#A9C3E2', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 30px', fontSize: 14, fontWeight: 500, cursor: file ? 'pointer' : 'default' }}>
              Analizează
            </button>
            {eroare && <div style={{ marginTop: 14, color: '#A32D2D', fontSize: 13 }}>{eroare}</div>}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
              <span style={{ fontFamily: disp, fontSize: 20, fontWeight: 600 }}>Rezultate analiză</span>
              <button onClick={reset} style={{ marginLeft: 'auto', background: '#fff', border: '0.5px solid #D5DFEA', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#586A82' }}>Analiză nouă</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 12, marginBottom: 26 }}>
              {rezultat.clienti.map(c => {
                const activ = c.client_id === selectat
                return (
                  <div key={c.client_id} onClick={() => setSelectat(c.client_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: activ ? '2px solid #2C7BD6' : '0.5px solid #D5DFEA', borderRadius: 14, padding: 14, cursor: 'pointer', boxShadow: activ ? '0 1px 8px rgba(22,62,115,0.10)' : 'none' }}>
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
    </div>
  )
}

export default App