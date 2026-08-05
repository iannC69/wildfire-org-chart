import React, { useState } from 'react'
import { Bell, Settings, ChevronDown, Flame, Shield } from 'lucide-react'
import styles from './Navbar.module.css'
import { useStore } from '../store/useStore'

export default function Navbar({ onOpenSettings }) {
  const isEditMode = useStore(s => s.isEditMode)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      {/* Left: Brand */}
      <div className={styles.left}>
        <div className={styles.logoMark}>
          <Flame size={18} color="#FF6B00" />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>WILDFIRE</span>
          <span className={styles.brandSub}>Organization Chart</span>
        </div>
      </div>

      {/* Center: Status indicator */}
      <div className={styles.center}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>LIVE</span>
        </div>
        {isEditMode && (
          <div className={styles.editBadge}>
            <span className={styles.editDot} />
            EDIT MODE
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={() => setNotifOpen(v => !v)}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <div className={styles.divider} />

        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            <Shield size={12} color="#FF6B00" />
          </div>
          <span className={styles.userName}>IANNC</span>
          <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
        </div>

        <button
          className={`${styles.settingsBtn} ${isEditMode ? styles.settingsBtnActive : ''}`}
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </nav>
  )
}
