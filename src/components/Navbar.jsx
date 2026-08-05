import React from 'react'
import { Bell, Moon, User, LogOut, ChevronDown } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M2 14L8 26L14 14L20 26L26 14" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
             <defs>
               <linearGradient id="paint0_linear" x1="2" y1="14" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                 <stop stopColor="#FFC107"/>
                 <stop offset="0.5" stopColor="#FF6B00"/>
                 <stop offset="1" stopColor="#E53935"/>
               </linearGradient>
             </defs>
          </svg>
        </div>
      </div>
      
      <div className={styles.center}>
        <a href="#" className={styles.navLink}>FEATURES</a>
        <a href="#" className={styles.navLink}>ABOUT</a>
        <a href="#" className={styles.navLink}>SERVERS</a>
        <a href="#" className={styles.navLink}>PANEL</a>
        <a href="#" className={styles.navLink}>SKINS MARKET</a>
        <a href="#" className={styles.navLink}>WIKI</a>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn}><Bell size={16} /></button>
        <button className={styles.moonBtn}><Moon size={16} color="#FF6B00" /></button>
        
        <div className={styles.langSelector}>
          <img src="https://flagcdn.com/w20/gb.png" alt="English" className={styles.flag} />
          <ChevronDown size={14} color="#9ca3af" />
        </div>

        <button className={styles.userBadge}>
          <User size={14} /> IANNC.실루엣 | _
        </button>

        <button className={styles.squareBtn}><User size={16} /></button>
        <button className={styles.squareBtn}><LogOut size={16} /></button>
      </div>
    </nav>
  )
}
