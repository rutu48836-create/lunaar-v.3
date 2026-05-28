
export function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.7', color: '#1a1a1a' }}>

      {/* Hero */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f5e9', color: '#2e7d32', fontSize: '12px', padding: '4px 10px', borderRadius: '8px', marginBottom: '1rem' }}>
          ✅ Google OAuth verified
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>Privacy policy</h1>
        <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>Last updated: May 23, 2026 · Lunaar</p>
      </div>

      {/* Info banner */}
      <div style={{ background: '#e3f2fd', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '14px', color: '#1565c0', margin: '0' }}>
          ℹ️ &nbsp;This policy explains how Lunaar uses Google account data obtained through OAuth 2.0 — specifically Google Calendar access — to power appointment scheduling chatbots.
        </p>
      </div>

      {/* Who we are */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>🏢 Who we are</h2>
        <p style={{ fontSize: '14px', color: '#555', margin: '0 0 8px' }}>Lunaar is a chatbot builder platform that lets businesses create AI-powered assistants for lead capture, FAQ answering, and appointment scheduling. We are the data controller for all information collected through this platform.</p>
        <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>Contact: <strong>lunaaroffical@gmail.com</strong> · Website: <strong>lunaar.app</strong></p>
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid #e0e0e0', margin: '1.75rem 0' }} />

      {/* Google OAuth card */}
      <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔗</span> Google OAuth &amp; Calendar access
        </h2>
        {[
          "We request access to your Google Calendar solely to create appointment events on behalf of your chatbot.",
          "We use the calendar.events scope — the minimum required to insert and manage events you book.",
          "We never read, scan, or share your existing calendar events or any other Google account data.",
          "Your OAuth tokens (access token + refresh token) are stored encrypted in our database and used only to create appointment events.",
          "You can revoke access at any time via Google Account Permissions or by deleting your chatbot from the dashboard.",
        ].map((text, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i === 4 ? 0 : '10px' }}>
            <span style={{ color: '#2e7d32', flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: '14px', color: '#555' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Limited use disclosure */}
      <div style={{ background: '#fff8e1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.75rem', border: '0.5px solid #ffe082' }}>
        <p style={{ fontSize: '14px', color: '#f57f17', margin: '0 0 4px', fontWeight: '500' }}>⚠️ Limited use disclosure (required by Google)</p>
        <p style={{ fontSize: '14px', color: '#7a5800', margin: '0' }}>
          Lunaar's use of Google user data obtained via OAuth is limited to providing the appointment scheduling feature. We do not use this data for any other purpose, and we do not transfer it to third parties except as necessary to operate the service.
        </p>
      </div>

      {/* What data we collect */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>🗄️ What data we collect</h2>
        <p style={{ fontSize: '14px', color: '#555', margin: '0 0 10px' }}>We collect only what is necessary to run the platform:</p>
        {[
          { icon: '👤', label: 'Account data', desc: 'your email and user ID from Supabase Auth when you sign up.' },
          { icon: '🤖', label: 'Chatbot data', desc: 'names, prompts, colors, and settings you configure for your chatbots.' },
          { icon: '📅', label: 'Appointment data', desc: 'name, email, date, and time provided by end users booking through your chatbot.' },
          { icon: '📋', label: 'Lead data', desc: 'name, phone, and stated interest collected by lead-capture chatbots.' },
          { icon: '🔑', label: 'Google OAuth tokens', desc: 'access and refresh tokens stored securely to maintain your calendar connection.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: '14px', color: '#555' }}><strong>{item.label}</strong> — {item.desc}</span>
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid #e0e0e0', margin: '1.75rem 0' }} />

      {/* How we use data */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>👁️ How we use your data</h2>
        {[
          "To operate your chatbots and deliver responses to end users.",
          "To create Google Calendar events when an appointment is booked through your chatbot.",
          "To display leads and appointments in your dashboard.",
          "To enforce message limits and manage your account.",
        ].map((text, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <span style={{ flexShrink: 0, color: '#555' }}>→</span>
            <span style={{ fontSize: '14px', color: '#555' }}>{text}</span>
          </div>
        ))}
        <p style={{ fontSize: '14px', color: '#555', margin: '8px 0 0' }}>We do <strong>not</strong> sell, rent, or share your data or your end users' data with any third party for advertising or marketing purposes.</p>
      </div>

      {/* Data sharing */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>🔗 Data sharing</h2>
        <p style={{ fontSize: '14px', color: '#555', margin: '0 0 10px' }}>We share data only with the following services, strictly to operate the platform:</p>
        {[
          { icon: '🟩', label: 'Supabase', desc: 'database and authentication provider. Data is stored in their infrastructure.' },
          { icon: '🔵', label: 'Google Calendar API', desc: 'appointment event data (name, email, date, time) is sent to Google solely to create calendar events.' },
          { icon: '⚡', label: 'Groq API', desc: 'chat messages are sent to Groq to generate AI responses. No personal data is stored by Groq beyond their standard retention policy.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: '14px', color: '#555' }}><strong>{item.label}</strong> — {item.desc}</span>
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid #e0e0e0', margin: '1.75rem 0' }} />

      {/* Remaining sections */}
      {[
        {
          icon: '🔒', title: 'Data security',
          text: 'OAuth tokens are stored in a secured Supabase table protected by row-level security policies. Only the authenticated owner of a chatbot can access their own tokens. We use HTTPS for all data transmission and never log sensitive tokens to application logs.'
        },
        {
          icon: '🕐', title: 'Data retention',
          text: 'Your data is retained for as long as your account is active. Deleting a chatbot permanently removes all associated tokens, leads, and appointments. You may request full account deletion by contacting us at lunaaroffical@gmail.com.'
        },
        {
          icon: '👥', title: 'End user data',
          text: "When visitors chat with your chatbot, their messages and collected details (name, phone, email, appointment info) are stored and attributed to your chatbot. As the chatbot owner, you are responsible for informing your users about data collection in line with applicable laws."
        },
        {
          icon: '✊', title: 'Your rights',
          text: 'You have the right to access, correct, or delete any data we hold about you. To exercise these rights, contact us at lunaaroffical@gmail.com. You may also revoke Google Calendar access at any time without deleting your account.'
        },
        {
          icon: '🔄', title: 'Changes to this policy',
          text: 'We may update this policy as the platform evolves. Significant changes will be communicated via email or a dashboard notice. Continued use of Lunaar after changes constitutes acceptance of the updated policy.'
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>{section.icon} {section.title}</h2>
          <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>{section.text}</p>
        </div>
      ))}

      <hr style={{ border: 'none', borderTop: '0.5px solid #e0e0e0', margin: '1.75rem 0' }} />

      {/* Contact */}
      <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '14px', color: '#555' }}>
        <strong style={{ color: '#1a1a1a' }}>Contact us</strong><br />
        For privacy questions or data requests: <a href="mailto:lunaaroffical@gmail.com" style={{ color: '#1565c0', textDecoration: 'none' }}>lunaaroffical@gmail.com</a><br />
        Lunaar · India
      </div>

    </div>
  )
}