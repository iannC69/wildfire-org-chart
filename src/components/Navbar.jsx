import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/',           label: 'Home',       icon: '🏠' },
  { to: '/dashboard',  label: 'Dashboard',  icon: '📋' },
  { to: '/org-chart',  label: 'Org Chart',  icon: '🗂️' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoIcon}>🔥</div>
          <div>
            <div className={styles.logoText}>WILDFIRE.RO</div>
            <div className={styles.logoSub}>cs2 community</div>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div className={styles.links}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.linkIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://cs2.wildfire.ro"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          Joacă acum →
        </a>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`
              }
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
