import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { disp, ui, Fundal } from './shared'
import Home from './pages/Home'
import Analiza from './pages/Analiza'
import About from './pages/About'

function linkStyle({ isActive }: { isActive: boolean }) {
  return { fontSize: 13, textDecoration: 'none', color: isActive ? '#163E73' : '#586A82', fontWeight: isActive ? 500 : 400 }
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'transparent', color: '#101D30', fontFamily: ui }}>
        <Fundal />
        <header style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 28px', background: 'rgba(233,240,248,0.7)', backdropFilter: 'blur(10px)', borderBottom: '0.5px solid #D5DFEA', position: 'sticky', top: 0, zIndex: 10 }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(180deg,#EAF0F4,#B9C6D2 48%,#93A4B3 52%,#D6DEE5)', border: '0.5px solid #AFC0CD' }} />
            <span style={{ fontFamily: disp, fontSize: 18, fontWeight: 600, color: '#163E73' }}>Abagnale</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#18C7E6' }} />
          </NavLink>
          <nav style={{ display: 'flex', gap: 18, marginLeft: 12 }}>
            <NavLink to="/" end style={linkStyle}>Acasă</NavLink>
            <NavLink to="/analiza" style={linkStyle}>Analiză</NavLink>
            <NavLink to="/despre" style={linkStyle}>Despre</NavLink>
          </nav>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#586A82' }}>KYC fraud detection</span>
        </header>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analiza" element={<Analiza />} />
            <Route path="/despre" element={<About />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}