import React, { useState } from 'react'
import {
  Bell, ChevronDown, Flame, Shield,
  Network, ClipboardList,
  ZoomOut, ZoomIn, Maximize, Download, Edit3, Lock,
  Undo2, Redo2, RotateCcw, Upload, List, Search, Settings, EyeOff
} from 'lucide-react'
import styles from './Navbar.module.css'
import { useStore } from '../store/useStore'

export default function Navbar({
  // Settings
  onOpenSettings,
  // View
  view,
  setView,
  // Zoom
  zoomDisplay,
  onZoomIn,
  onZoomOut,
  onFit,
  // Export / Import
  onExportPng,
  onExportJson,
  onImportJson,
  // Edit
  onToggleEditMode,
  onUndo,
  onRedo,
  onReset,
  historyIndex,
  historyStack,
  // Legend
  showLegend,
  onToggleLegend,
  // Search
  searchQuery,
  onSearchChange,
  // Cinematic
  isHidden,
  onToggleNav,
}) {
  const isEditMode = useStore(s => s.isEditMode)
  const globalLog = useStore(s => s.globalLog || [])
  const [changelogOpen, setChangelogOpen] = useState(false)

  return (
    <nav className={`${styles.nav} ${isHidden ? styles.navHidden : ''}`}>
      {/* ── LEFT: Brand ── */}
      <div className={styles.left}>
        <img src="https://wildfire.ro/logo.png" alt="Wildfire Logo" className={styles.logoImage} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>WILDFIRE</span>
          <span className={styles.brandSub}>Organization Chart</span>
        </div>
      </div>

      {/* ── CENTER: Tabs + Tools ── */}
      <div className={styles.center}>
        {/* View tabs */}
        <div className={styles.tabGroup}>
          <button
            className={`${styles.tab} ${view === 'chart' ? styles.tabActive : ''}`}
            onClick={() => setView('chart')}
          >
            <Network size={14} />
            Org Chart
          </button>
          <button
            className={`${styles.tab} ${view === 'attributions' ? styles.tabActive : ''}`}
            onClick={() => setView('attributions')}
          >
            <ClipboardList size={14} />
            Atributii
          </button>
        </div>

        {/* Divider */}
        {view === 'chart' && <div className={styles.vDivider} />}

        {/* Chart-only tools */}
        {view === 'chart' && (
          <>
            {/* Zoom */}
            <div className={styles.zoomGroup}>
              <button className={styles.toolBtn} onClick={onZoomOut} title="Zoom out">
                <ZoomOut size={14} />
              </button>
              <span className={styles.zoomVal}>{zoomDisplay}%</span>
              <button className={styles.toolBtn} onClick={onZoomIn} title="Zoom in">
                <ZoomIn size={14} />
              </button>
            </div>

            <div className={styles.vDivider} />

            <button className={styles.toolBtn} onClick={onFit} title="Fit to screen">
              <Maximize size={14} />
              <span>Fit</span>
            </button>
            <button className={styles.toolBtn} onClick={onExportPng} title="Export PNG">
              <Download size={14} />
              <span>Export PNG</span>
            </button>

            <div className={styles.vDivider} />

            {/* Edit / Lock */}
            <button
              className={`${styles.toolBtn} ${isEditMode ? styles.toolBtnEdit : ''}`}
              onClick={onToggleEditMode}
              title={isEditMode ? 'Lock editing' : 'Enable editing'}
            >
              {isEditMode ? <><Lock size={14} /><span>Lock</span></> : <><Edit3 size={14} /><span>Edit</span></>}
            </button>

            {/* Undo / Redo / Reset — only in edit mode */}
            {isEditMode && (
              <>
                <div className={styles.vDivider} />
                <button
                  className={styles.toolBtn}
                  onClick={onUndo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  className={styles.toolBtn}
                  onClick={onRedo}
                  disabled={historyIndex >= (historyStack || []).length - 1}
                  title="Redo"
                >
                  <Redo2 size={14} />
                </button>
                <button
                  className={styles.toolBtn}
                  onClick={onReset}
                  title="Reset to defaults"
                >
                  <RotateCcw size={14} />
                </button>

                <div className={styles.vDivider} />

                <button className={styles.toolBtn} onClick={onExportJson} title="Export JSON">
                  <Download size={14} />
                  <span>JSON</span>
                </button>
                <label className={`${styles.toolBtn} ${styles.toolBtnLabel}`} title="Import JSON">
                  <Upload size={14} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={onImportJson}
                  />
                </label>
              </>
            )}

            <div className={styles.vDivider} />

            {/* Legend toggle */}
            <button
              className={`${styles.toolBtn} ${showLegend ? styles.toolBtnLegend : ''}`}
              onClick={onToggleLegend}
              title="Toggle legend"
            >
              <List size={14} />
              <span>Legend</span>
            </button>

            <div className={styles.vDivider} />

            {/* Search */}
            <div className={styles.searchWrap}>
              <Search size={13} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search member..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Status + Settings + User ── */}
      <div className={styles.right}>
        {/* Live + Edit Mode badges */}
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

        <div className={styles.divider} />

        {/* Changelog */}
        <div className={styles.changelogWrapper}>
          <button
            className={`${styles.iconBtn} ${changelogOpen ? styles.iconBtnActive : ''}`}
            onClick={() => setChangelogOpen(v => !v)}
            title="Changelog"
            aria-label="Changelog"
          >
            <Bell size={15} />
            <span className={styles.unreadDot} />
          </button>

          {changelogOpen && (
            <div className={styles.changelogDropdown}>
              <div className={styles.changelogHeader}>
                <h4>Changelog</h4>
                <span className={styles.versionBadge}>v1.2.0</span>
              </div>
              <div className={styles.changelogBody}>
                {globalLog.length === 0 ? (
                  <div className={styles.changelogDesc} style={{ textAlign: 'center', padding: '20px 0' }}>No recent activity.</div>
                ) : (
                  globalLog.slice(0, 50).map(log => (
                    <div className={styles.changelogItem} key={log.id}>
                      <div className={styles.changelogDate}>
                        {new Date(log.date).toLocaleString()} • by {log.by}
                      </div>
                      <div className={styles.changelogTitle}>{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          className={`${styles.settingsBtn} ${isEditMode ? styles.settingsBtnActive : ''}`}
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={15} />
        </button>

        <div className={styles.divider} />

        {/* User chip */}
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            <Shield size={12} color="rgba(255,255,255,0.6)" />
          </div>
          <span className={styles.userName}>IANNC</span>
          <ChevronDown size={11} className={styles.userChevron} />
        </div>

        {/* Cinematic hide button */}
        <div className={styles.divider} />
        <button
          className={styles.hideNavBtn}
          onClick={onToggleNav}
          title="Hide navigation (`)" 
          aria-label="Toggle cinematic mode"
        >
          <EyeOff size={14} />
        </button>
      </div>
    </nav>
  )
}
