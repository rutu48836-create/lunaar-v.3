import { useState, useEffect } from 'react'
import { Navbar } from './Landing.jsx'
import {
  FileText, MessageSquare, Users, Zap, Shield, Globe,
  ArrowRight, ChevronRight, Sparkles, Bot, Phone, CalendarCheck
} from 'lucide-react'

const features = [
  {
    icon: <FileText size={22} />,
    tag: 'Knowledge',
    title: 'Train on anything',
    desc: 'Paste plain text, upload documents, or write a custom prompt. Lunaar turns your content into a smart, queryable brain in seconds.',
    accent: '#f97316',
  },
  {
    icon: <MessageSquare size={22} />,
    tag: 'Customer Care',
    title: 'Instant FAQ agent',
    desc: 'Your agent answers customer questions 24/7 — accurately, warmly, and only from what you have taught it. No hallucinations, no guesswork.',
    accent: '#3b82f6',
  },
  {
    icon: <Users size={22} />,
    tag: 'Lead Generation',
    title: 'Identify & capture leads',
    desc: 'The agent naturally collects name, phone, and interest from conversations. Detected leads are saved to your dashboard automatically.',
    accent: '#f97316',
  },
  {
    icon: <Bot size={22} />,
    tag: 'Personality',
    title: 'Custom agent persona',
    desc: 'Give your agent a name, logo, brand color, and personality. It feels like a human — not a robot — to every visitor.',
    accent: '#3b82f6',
  },
  {
    icon: <Globe size={22} />,
    tag: 'Sharing',
    title: 'Share with one link',
    desc: 'Every chatbot gets a unique public link. Embed it, share it, or hand it to customers — no login required on their end.',
    accent: '#f97316',
  },
  {
    icon: <Shield size={22} />,
    tag: 'Control',
    title: 'Stays on-topic',
    desc: 'The agent only answers from your knowledge base. If it doesn\'t know, it says so — keeping your brand safe and trustworthy.',
    accent: '#3b82f6',
  },
  {
    icon: <CalendarCheck size={22} />,
    tag: 'Appointment Booking',
    title: 'Book meetings via chat',
    desc: 'The agent collects name, contact details, preferred date and time — then schedules the appointment directly on your Google Calendar. No back-and-forth, no missed bookings.',
    accent: '#10b981',
  },
]

function BetaBanner() {
  return (
    <div style={{
      width: '100%',
      background: '#111',
      color: '#fff',
      textAlign: 'center',
      padding: '10px 1rem',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.01em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      position: 'fixed',
      top: '60px',
      left: 0,
      zIndex: 998,
      boxSizing: 'border-box',
    }}>
      <Sparkles size={14} color="#f97316" />
      Lunaar is currently in <strong style={{ color: '#f97316', marginLeft: 4 }}>public beta</strong>
      <span style={{ color: '#666', margin: '0 6px' }}>·</span>
      Some features may change. Feedback welcome.
    </div>
  )
}

function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fafafa' : '#fff',
        border: `1px solid ${hovered ? feature.accent + '44' : '#ebebeb'}`,
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'default',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 40px ${feature.accent}18` : '0 1px 4px rgba(0,0,0,0.04)',
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: feature.accent + '14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: feature.accent,
        transition: 'background 0.2s',
      }}>
        {feature.icon}
      </div>

      {/* Tag */}
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: feature.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {feature.tag}
      </span>

      {/* Title */}
      <h3 style={{
        fontSize: '17px',
        fontWeight: 650,
        color: '#111',
        margin: 0,
        lineHeight: '1.3',
        fontFamily: '"Playfair Display", serif',
      }}>
        {feature.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.65',
        margin: 0,
        flex: 1,
      }}>
        {feature.desc}
      </p>

      {/* Google Calendar badge — only on the booking card */}
      {feature.tag === 'Appointment Booking' && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#10b981',
          letterSpacing: '0.04em',
          alignSelf: 'flex-start',
          marginTop: '4px',
        }}>
          <CalendarCheck size={11} />
          Syncs with Google Calendar
        </div>
      )}
    </div>
  )
}

function HeroStrip() {
  return (
    <div style={{
      width: '100%',
      padding: '80px 2rem 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '16px',
      boxSizing: 'border-box',
    }}>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff7ed',
        border: '1px solid #fed7aa',
        borderRadius: '20px',
        padding: '5px 14px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#f97316',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        <Zap size={12} /> Everything included, free
      </div>

      <h1 style={{
        fontSize: 'clamp(34px, 5vw, 62px)',
        fontWeight: 400,
        color: '#111',
        fontFamily: '"Playfair Display", serif',
        margin: 0,
        lineHeight: 1.15,
        maxWidth: '700px',
      }}>
        One platform.<br />
        <em style={{ color: '#f97316', fontStyle: 'italic' }}>Every conversation.</em>
      </h1>

      <p style={{
        fontSize: '16px',
        color: '#666',
        maxWidth: '500px',
        lineHeight: 1.7,
        margin: 0,
      }}>
        Turn documents and plain text into AI chat agents that handle support,
        capture leads, and represent your brand — in minutes.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button style={{
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          Start for free <ArrowRight size={16} />
        </button>
        <button style={{
          background: '#fff',
          color: '#111',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          See demo
        </button>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', label: 'Add your content', sub: 'Paste text or write a prompt about your business' },
    { num: '02', label: 'Pick agent type', sub: 'FAQ support or Lead generation — or both' },
    { num: '03', label: 'Share the link', sub: 'Your agent is live, branded, and ready to chat' },
  ]

  return (
    <div style={{
      width: '100%',
      padding: '60px 2rem',
      boxSizing: 'border-box',
      background: '#fafafa',
      borderTop: '1px solid #f0f0f0',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <p style={{
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#aaa',
        marginBottom: '40px',
      }}>
        How it works
      </p>
      <div style={{
        display: 'flex',
        gap: '0',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '860px',
        margin: '0 auto',
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            flex: '1',
            minWidth: '220px',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '0 24px',
              flex: 1,
            }}>
              <span style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#f0f0f0',
                fontFamily: '"Playfair Display", serif',
                lineHeight: 1,
              }}>{s.num}</span>
              <span style={{ fontSize: '15px', fontWeight: 650, color: '#111' }}>{s.label}</span>
              <span style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{s.sub}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={18} color="#ddd" style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Features() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <Navbar />
        <BetaBanner />

        {/* offset for fixed nav + banner */}
        <div style={{ paddingTop: '102px' }}>

          <HeroStrip />
          <HowItWorks />

          {/* Features grid */}
          <div style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '70px 2rem',
          }}>
            <p style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#aaa',
              marginBottom: '48px',
            }}>
              What Lunaar can do
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {features.map((f, i) => (
                <FeatureCard key={i} feature={f} index={i} />
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{
            width: '100%',
            padding: '70px 2rem',
            background: '#111',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f97316',
            }}>
              Beta — free while we grow
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 400,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
              margin: 0,
              maxWidth: '560px',
              lineHeight: 1.2,
            }}>
              Your first agent is ready in under 2 minutes.
            </h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
              No credit card. No setup. Just paste your content and go.
            </p>
            <button style={{
              marginTop: '12px',
              background: '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              Create your agent <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}