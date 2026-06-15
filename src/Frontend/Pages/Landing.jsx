import { useState } from 'react'
import styles from "../Styles/Landing.module.css"
import { Send, ArrowRight, Check, Crown, FileText, UserPlus, Calendar, Palette, Link2 } from 'lucide-react'
import { useNavigate } from "react-router-dom"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const Navlinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy", href: "/privacy-policy" },
  ]

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <Send size={15} /> Lunaar
        </div>
        <div className={styles.nav_links}>
          {Navlinks.map(link => (
            <span key={link.label} onClick={() => navigate(link.href)}>{link.label}</span>
          ))}
        </div>
        <div className={styles.nav_cta}>
          <button className={styles.btn_ghost} onClick={() => navigate('/auth')}>Sign in</button>
          <button className={styles.btn_dark} onClick={() => navigate('/auth')}>Get started</button>
        </div>
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span className={styles.hline} />
          <span className={styles.hline} style={{ width: '60%' }} />
          <span className={styles.hline} />
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.mobile_drawer}>
          {Navlinks.map(link => (
            <span key={link.label} onClick={() => { navigate(link.href); setMenuOpen(false) }}>{link.label}</span>
          ))}
          <hr className={styles.drawer_divider} />
          <button className={styles.btn_ghost} onClick={() => navigate('/auth')}>Sign in</button>
          <button className={styles.btn_dark} onClick={() => navigate('/auth')}>Get started</button>
        </div>
      )}
    </>
  )
}

function ChatMockup() {
  return (
    <div className={styles.chat_phone}>
      <div className={styles.chat_head}>
        <div className={styles.chat_head_left}>
          <div className={styles.chat_avatar}>🏨</div>
          <div>
            <div className={styles.chat_name}>Grand Hotel</div>
            <div className={styles.chat_status}>● Online</div>
          </div>
        </div>
      </div>
      <div className={styles.chat_body}>
        <div className={styles.bubble_bot}>Hi! I'm Grand Hotel's assistant. How can I help you? 🏨</div>
        <div className={styles.bubble_user}>Is the hotel open on 28th June?</div>
        <div className={styles.bubble_bot}>Yes! We're fully open on June 28th. Want to check room availability? ✨</div>
        <div className={styles.bubble_user}>Yes, for 2 adults</div>
        <div className={styles.bubble_bot}>Deluxe rooms from ₹4,500/night are available. Shall I book one? 🛏️</div>
      </div>
      <div className={styles.chat_input_row}>
        <span>Type something</span>
        <div className={styles.send_btn}><Send size={12} color="#fff" /></div>
      </div>
    </div>
  )
}

function Hero_section() {
  const navigate = useNavigate()
  return (
    <div className={styles.Hero_section_container}>
      <div className={styles.content}>
        <div className={styles.badge}>✨ AI-powered chat agents</div>
        <h1>Make your docs do the <em>talk</em></h1>
        <p>Train a chat agent on your documents and prompts. Handle queries, capture leads, and book appointments — automatically.</p>
        <div className={styles.hero_btns}>
          <button className={styles.btn_primary} onClick={() => navigate('/auth')}>
            Start for free <ArrowRight size={15} />
          </button>
          <button className={styles.btn_outline} onClick={() => navigate('/pricing')}>
            See pricing
          </button>
        </div>
      </div>
      <div className={styles.chat_wrap}>
        <ChatMockup />
      </div>
    </div>
  )
}

const steps = [
  {
    num: 1, title: "Name & choose type", tag: "Free", pro: false,
    bg: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
    desc: "Give your agent a name and pick what it does — customer care, lead capture, or appointment booking.",
    preview: (
      <div className={styles.mini_form}>
        <div className={styles.mini_title}>Let your docs talk</div>
        <div className={styles.mini_input}>Enter chatbot name</div>
        <div className={styles.mini_select}>Customer Care ▾</div>
        <div className={styles.mini_btn}>Continue</div>
      </div>
    )
  },
  {
    num: 2, title: "Brand it your way", tag: "Free", pro: false,
    bg: "linear-gradient(135deg,#fef9c3,#fde68a)",
    desc: "Upload your logo and pick a color. Your agent matches your brand so it feels native to your business.",
    preview: (
      <div className={styles.mini_form}>
        <div className={styles.mini_title}>Style your Agent</div>
        <div className={styles.logo_upload}>📁 Upload logo</div>
        <div className={styles.mini_label}>Pick a color</div>
        <div className={styles.color_row}>
          {['#f59e0b','#6366f1','#10b981','#ef4444','#111'].map(c => (
            <div key={c} className={styles.color_dot} style={{ background: c }} />
          ))}
        </div>
        <div className={styles.mini_btn}>Continue</div>
      </div>
    )
  },
  {
    num: 3, title: "Add prompt & docs", tag: "Free", pro: false,
    bg: "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
    desc: "Write a system prompt and upload your files. Your agent learns from your knowledge base instantly.",
    preview: (
      <div className={styles.mini_form}>
        <div className={styles.mini_title}>Train your Agent</div>
        <div className={styles.mini_textarea}>You are a helpful customer support agent for...</div>
        <div className={styles.file_area}>📄 Upload PDF, CSV or TXT</div>
        <div className={styles.mini_btn}>Create</div>
      </div>
    )
  },
  {
    num: 4, title: "Connect Instagram", tag: "Pro", pro: true,
    bg: "linear-gradient(135deg,#fdf4ff,#e9d5ff)",
    desc: "Link your Instagram Business account and your agent starts auto-replying to DMs — one click.",
    preview: (
      <div className={styles.mini_form} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', margin: '4px 0 8px' }}>📸</div>
        <div className={styles.mini_title}>Connect Instagram</div>
        <div className={styles.mini_sub}>Link your Instagram Business account to auto-reply to DMs</div>
        <div className={styles.ig_btn}>Connect Instagram</div>
      </div>
    )
  },
]

function Steps_section() {
  return (
    <div className={styles.steps_section} id="features">
      <div className={styles.section_top}>
        <p className={styles.section_label}>How it works</p>
        <h2 className={styles.section_title}>Set up in minutes</h2>
        <p className={styles.section_sub}>Four simple steps from zero to a fully working AI chat agent.</p>
      </div>
      <div className={styles.steps_grid}>
        {steps.map(s => (
          <div key={s.num} className={styles.step_card}>
            <div className={styles.step_img} style={{ background: s.bg }}>
              <div className={styles.mock_wrapper}>{s.preview}</div>
            </div>
            <div className={styles.step_body}>
              <div className={styles.step_num_row}>
                <div className={styles.step_num}>{s.num}</div>
                <span className={s.pro ? styles.tag_pro : styles.tag_free}>
                  {s.pro ? <Crown size={10} /> : <Check size={10} />} {s.tag}
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const features = [
  { icon: FileText, title: "Doc training", desc: "Upload PDFs, CSVs, or markdown. Your agent knows your content." },
  { icon: UserPlus, title: "Instagram DMs", desc: "Auto-reply to Instagram messages with your trained agent." },
  { icon: UserPlus, title: "Lead capture", desc: "Detect and save leads from conversations automatically." },
  { icon: Calendar, title: "Appointments", desc: "Book slots directly into Google Calendar automatically." },
  { icon: Palette, title: "Custom branding", desc: "Logo, color, and name — make it look like yours." },
  { icon: Link2, title: "Shareable link", desc: "One link to share your agent with anyone." },
]

function Features_section() {
  return (
    <div className={styles.features_section}>
      <p className={styles.section_label}>Features</p>
      <h2 className={styles.section_title}>Everything you need</h2>
      <div className={styles.features_grid}>
        {features.map(f => {
          const Icon = f.icon
          return (
            <div key={f.title} className={styles.feat_card}>
              <div className={styles.feat_icon}><Icon size={18} /></div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CTA_section() {
  const navigate = useNavigate()
  return (
    <div className={styles.cta_section}>
      <h2>Ready to let your docs talk?</h2>
      <p>Start free, no credit card needed. Upgrade when you need more power.</p>
      <button className={styles.btn_primary} onClick={() => navigate('/auth')}>
        Get started for free <ArrowRight size={16} />
      </button>
    </div>
  )
}

function Footer() {
  const navigate = useNavigate()
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}><Send size={13} /> Lunaar</div>
      <p>© 2026 Lunaar. All rights reserved.</p>
      <div className={styles.footer_links}>
        <span onClick={() => navigate('/privacy-policy')}>Privacy</span>
        <span onClick={() => navigate('/pricing')}>Pricing</span>
      </div>
    </footer>
  )
}

export function Landing() {
  return (
    <div className={styles.landing_page_container}>
      <Navbar />
      <Hero_section />
      <Steps_section />
      <Features_section />
      <CTA_section />
      <Footer />
    </div>
  )
}