import { useRef, useEffect } from 'react'

export const disp = 'Space Grotesk, sans-serif'
export const mono = 'IBM Plex Mono, monospace'
export const ui = 'Inter, system-ui, sans-serif'
export const API = (import.meta.env as Record<string, string | undefined>).VITE_API_URL || 'http://127.0.0.1:8000'

export interface Tranzactie {
  id: number; data: string; descriere: string; suma: number; valuta: string
  contraparte: string; scor: number; severitate: string; explicatie: string
}
export interface Client {
  client_id: string; scor_risc: number; nr_tranzactii: number; nr_flaguite: number
  tranzactii_flaguite: Tranzactie[]
}
export interface Rezultat { clienti: Client[] }

export function culoareRisc(s: number): string {
  if (s >= 60) return '#E0484F'
  if (s >= 35) return '#E08A2B'
  return '#2FB389'
}
export function styleSeveritate(sev: string) {
  if (sev === 'ridicata') return { border: '#E0484F', bg: '#FCEBEC', text: '#A32D2D', label: 'Ridicat' }
  if (sev === 'medie') return { border: '#E08A2B', bg: '#FBF1E2', text: '#8A5310', label: 'Mediu' }
  return { border: '#92A1B5', bg: '#EEF2F6', text: '#586A82', label: 'Scăzut' }
}

export function Donut({ scor }: { scor: number }) {
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

export function DigitScan({ height = 240 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const cx = cv.getContext('2d'); if (!cx) return
    let raf = 0
    const chars = '0123456789ABCDEF', CELL = 20, H = height
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
        const rr: { ch: string; ph: number; brown: boolean }[] = []
        for (let i = 0; i < cols; i++) rr.push({ ch: chars[(Math.random() * 16) | 0], ph: Math.random() * 6.28, brown: Math.random() < 0.18 })
        grid.push(rr)
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
  }, [height])
  return <canvas ref={ref} style={{ width: '100%', height, display: 'block', borderRadius: 12, border: '0.5px solid #DAD3C4' }} />
}

export function Fundal() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const cx = cv.getContext('2d'); if (!cx) return
    let raf = 0, W = 0, Hh = 0
    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; Hh = window.innerHeight
      cv!.width = W * dpr; cv!.height = Hh * dpr
      cx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const benzi = [
      { y: 0.30, amp: 60, sp: 0.00006, ph: 0, a: 0.35 },
      { y: 0.48, amp: 85, sp: 0.00009, ph: 2, a: 0.40 },
      { y: 0.66, amp: 70, sp: 0.00007, ph: 4, a: 0.48 },
      { y: 0.82, amp: 55, sp: 0.00010, ph: 1.2, a: 0.55 },
    ]
    function curba(x: number, b: typeof benzi[number], yc: number, t: number) {
      return yc + Math.sin(x * 0.0017 + t * b.sp + b.ph) * b.amp + Math.sin(x * 0.0009 - t * b.sp * 0.7 + b.ph) * b.amp * 0.5
    }
    function draw(t: number) {
      const g = cx!.createLinearGradient(0, 0, 0, Hh)
      g.addColorStop(0, '#B8D7F0'); g.addColorStop(1, '#DEF1FB')
      cx!.fillStyle = g; cx!.fillRect(0, 0, W, Hh)
      for (const b of benzi) {
        const yc = Hh * b.y
        cx!.beginPath()
        cx!.moveTo(0, curba(0, b, yc, t))
        for (let x = 0; x <= W; x += 8) cx!.lineTo(x, curba(x, b, yc, t))
        cx!.lineTo(W, Hh); cx!.lineTo(0, Hh); cx!.closePath()
        const gg = cx!.createLinearGradient(0, yc - b.amp, 0, Hh)
        gg.addColorStop(0, `rgba(255,255,255,${b.a})`)
        gg.addColorStop(0.35, `rgba(255,255,255,${b.a * 0.35})`)
        gg.addColorStop(1, 'rgba(255,255,255,0)')
        cx!.fillStyle = gg; cx!.fill()
        cx!.beginPath()
        for (let x = 0; x <= W; x += 8) { const y = curba(x, b, yc, t); x === 0 ? cx!.moveTo(x, y) : cx!.lineTo(x, y) }
        cx!.strokeStyle = `rgba(255,255,255,${Math.min(b.a + 0.2, 0.85)})`
        cx!.lineWidth = 1.5; cx!.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    setup(); raf = requestAnimationFrame(draw)
    const onR = () => setup(); window.addEventListener('resize', onR)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}