import { useState } from 'react'
import styles from "../Styles/Landing.module.css"
import { SendHorizonal, Send, Menu, X } from 'lucide-react'
import hero from "../assets/hero.png"
import {useNavigate} from "react-router-dom"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const Navlinks = [

    {label:"Features",href:"/features"},
    {label:"Privacy",href:"/privacy-policy"}

  ]

  return (
    <>
      <nav style={{
        width: '100%',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: '#ffffff',
        borderBottom: '1px solid #f0f0f0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        boxSizing: 'border-box',
      }}>

        {/* Logo */}
        <div style={{ fontWeight: 700, fontSize: '18px', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Lunaar <SendHorizonal size={18} />
        </div>

        {/* Desktop Links */}
        <div className={styles.nav_links}>
 {Navlinks.map((link) => (

              <span key={link.label} style={{ fontSize: '14px', color: '#555', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(link.href)}>
              {link.label}
            </span>
))}          
        </div>

        {/* Desktop CTA */}
        <div className={styles.nav_cta}>
          <button style={{ background: 'none', border: 'none', fontSize: '14px', color: '#555', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/auth')}>
            Sign in
          </button>
          <button style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/auth')}>
            Get started
          </button>
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '100%',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 2rem',
          gap: '1.2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        }}>
                    {Navlinks.map((link) => (

              <span key={link.label} style={{ fontSize: '14px', color: '#555', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(link.href)}>
              {link.label}
            </span>
))}          

<hr style={{ border: 'none', borderTop: '1px solid #f0f0f0' }} />
          <button style={{ background: 'none', border: 'none', fontSize: '15px', color: '#555', cursor: 'pointer', fontWeight: 500, textAlign: 'left', padding: 0 }} onClick={() => navigate('/auth')}>
            Sign in
          </button>
          <button style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
            Get started
          </button>
        </div>
      )}
    </>
  )
}

function Hero_section() {
  return (
    <div className={styles.Hero_section_container}>
      <div className={styles.content}>
        <h1>Make your docs talk. for free</h1>
        <span>make a chat agent for free and stay worry free, train agent on prompt, documents let it do the hard work</span>
        <button onClick={() => navigate('/auth')}>Check Out <Send size={18} /></button>
      </div>
      <img src={hero} alt="hero img" />
    </div>
  )
}

export function Landing() {
  return (
    <div className={styles.landing_page_container}>
      <Navbar />
      <Hero_section />
    </div>
  )
}