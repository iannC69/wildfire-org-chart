import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ROLES, INITIAL_ROLES_DATA, getRoleById, getInitials } from '../data/staffData'
import styles from './Home.module.css'

const STATS = [
  { value: '17', label: 'Staff activ', icon: '👥' },
  { value: '8',  label: 'Roluri',      icon: '🏆' },
  { value: '3',  label: 'Servere',     icon: '⚡' },
  { value: '24/7', label: 'Monitorizare', icon: '🛡️' },
]

const FEATURES = [
  {
    icon: '🔥',
    title: 'Comunitate activă',
    desc: 'Sute de jucători activi zilnic pe serverele noastre de CS2 profesionale.',
  },
  {
    icon: '🛡️',
    title: 'Staff dedicat',
    desc: 'O echipă de moderatori și administratori care veghează 24/7 la fair-play.',
  },
  {
    icon: '⚡',
    title: 'Servere premium',
    desc: 'Infrastructură de top cu latency scăzut și uptime 99.9% garantat.',
  },
  {
    icon: '🎯',
    title: 'Competiție serioasă',
    desc: 'Sisteme de ranking, turnee periodice și premii pentru cei mai buni.',
  },
]

function Avatar({ name, color, glow, size = 44 }) {
  const initials = getInitials(name)
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}30, #0d0d1a)`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 ${size / 3}px ${glow}, inset 0 0 ${size / 4}px ${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, fontWeight: 700, fontSize: size * 0.32,
        flexShrink: 0, userSelect: 'none',
      }}
    >
      {initials}
    </div>
  )
}

export default function Home() {
  const heroRef = useRef(null)

  // Parallax on hero
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const totalMembers = INITIAL_ROLES_DATA.reduce((a, r) => a + r.members.length, 0)

  return (
    <div className={styles.page}>
      <div className="grid-bg" />

      {/* ─── HERO ─── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} ref={heroRef} />
        <div className={styles.heroBadge}>🔥 CS2 Gaming Community</div>
        <h1 className={styles.heroTitle}>
          Bun venit pe{' '}
          <span className={styles.heroGradient}>Wildfire</span>
        </h1>
        <p className={styles.heroSub}>
          Comunitatea CS2 din România cu cel mai dedicat staff și cele mai competitive servere.
          Joacă, crește, cucerește.
        </p>
        <div className={styles.heroActions}>
          <a href="https://cs2.wildfire.ro" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            🎮 Joacă acum
          </a>
          <Link to="/dashboard" className={styles.btnSecondary}>
            👥 Cunoaște staff-ul
          </Link>
        </div>

        {/* Floating role pills */}
        <div className={styles.rolePills}>
          {ROLES.slice(0, 5).map((r, i) => (
            <div
              key={r.id}
              className={styles.rolePill}
              style={{
                '--pill-color': r.color,
                '--pill-glow': r.glow,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {r.icon} {r.title}
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>De ce Wildfire?</div>
          <h2 className={styles.sectionTitle}>Ceea ce ne face speciali</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM PREVIEW ─── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Echipa noastră</div>
          <h2 className={styles.sectionTitle}>Staff-ul Wildfire</h2>
          <p className={styles.sectionDesc}>
            {totalMembers} membri dedicați care fac comunitatea posibilă în fiecare zi.
          </p>
          <div className={styles.teamPreview}>
            {INITIAL_ROLES_DATA.filter(r => r.members.length > 0).map(rd => {
              const role = getRoleById(rd.id)
              if (!role) return null
              return (
                <div key={rd.id} className={styles.teamGroup}>
                  <div className={styles.teamGroupHeader} style={{ '--role-color': role.color }}>
                    <span>{role.icon}</span>
                    <span>{role.title}</span>
                    <span className={styles.teamCount}>{rd.members.length}</span>
                  </div>
                  <div className={styles.teamAvatars}>
                    {rd.members.map(m => (
                      <div key={m.id} title={m.name}>
                        <Avatar name={m.name} color={role.color} glow={role.glow} size={40} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.teamCTA}>
            <Link to="/dashboard" className={styles.btnPrimary}>
              📋 Vezi Dashboard-ul complet
            </Link>
            <Link to="/org-chart" className={styles.btnSecondary}>
              🗂️ Org Chart
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span>🔥</span>
            <span>Wildfire Community</span>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/org-chart">Org Chart</Link>
            <a href="https://cs2.wildfire.ro" target="_blank" rel="noopener noreferrer">Website</a>
          </div>
          <div className={styles.footerCopy}>
            © {new Date().getFullYear()} cs2.wildfire.ro · Toate drepturile rezervate
          </div>
        </div>
      </footer>
    </div>
  )
}
