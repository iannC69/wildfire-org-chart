import React, { useState, useMemo } from 'react'
import {
  Bell, ChevronDown, Flame, Shield,
  Network, ClipboardList, User, Terminal,
  ZoomOut, ZoomIn, Maximize, Download, Edit3, Lock,
  Undo2, Redo2, RotateCcw, Upload, List, Search, Settings, EyeOff, Maximize2, LayoutGrid,
  ArrowUp, ArrowDown, Trash2
} from 'lucide-react'
import styles from './Navbar.module.css'
import { useStore, flattenNodes } from '../store/useStore'
import StaffChangesModal from './StaffChangesModal'

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
  const roles = useStore(s => s.roles || [])
  const tree = useStore(s => s.tree)
  const allMembers = useMemo(() => tree ? flattenNodes(tree) : [], [tree])

  const validLogs = globalLog.filter(log =>
    log.message.startsWith('Promoted') ||
    log.message.startsWith('Demoted') ||
    log.message.startsWith('Removed')
  );
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [staffChangesModalOpen, setStaffChangesModalOpen] = useState(false)
  const [lastSeenLogCount, setLastSeenLogCount] = useState(() => {
    try { return parseInt(localStorage.getItem('wildfire_last_seen_logs')) || 0 } catch { return 0 }
  })

  const hasUnreadLogs = globalLog.length > lastSeenLogCount;

  // Parse a log entry to extract colors, avatars, names
  const parseWidgetLog = (log) => {
    let actionText = log.message
    let reasonText = ''
    if (log.message.includes(' - Reason: ')) {
      const parts = log.message.split(' - Reason: ')
      actionText = parts[0]
      reasonText = parts.slice(1).join(' - Reason: ')
    }
    const isPromote = actionText.startsWith('Promoted')
    const isDemote = actionText.startsWith('Demoted')
    const isRemove = actionText.startsWith('Removed')

    let targetName = null
    let roleName = null
    let roleColor = null

    const matchStd = actionText.match(/(?:Promoted|Demoted) member (.*?) (?:to|from) (.*)/i)
    const matchRem = actionText.match(/Removed member (.*?) \((.*?)\)/i)
    if (matchStd) { targetName = matchStd[1]?.trim(); roleName = matchStd[2]?.trim() }
    else if (matchRem) { targetName = matchRem[1]?.trim(); roleName = matchRem[2]?.trim() }

    if (roleName) {
      const foundRole = roles.find(r => r.title.toLowerCase() === roleName.toLowerCase())
      if (foundRole) roleColor = foundRole.color
    }
    if (isRemove) {
      roleColor = '#ef4444'
    } else if (!roleColor) {
      roleColor = isPromote ? '#22c55e' : isDemote ? '#eab308' : '#f97316'
    }

    let byAvatar = log.byAvatar
    let targetAvatar = log.targetAvatar
    if (!byAvatar && log.by) {
      const m = allMembers.find(m => m.name?.toLowerCase() === log.by.toLowerCase())
      if (m) byAvatar = m.avatarUrl
    }
    if (!targetAvatar && targetName) {
      const m = allMembers.find(m => m.name?.toLowerCase() === targetName.toLowerCase())
      if (m) targetAvatar = m.avatarUrl
    }

    const label = isPromote ? 'PROMOTED' : isDemote ? 'DEMOTED' : 'REMOVED'
    return { isPromote, isDemote, isRemove, targetName, roleName, roleColor, byAvatar, targetAvatar, label, reasonText }
  }

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
            onClick={() => {
              const nextState = !changelogOpen;
              setChangelogOpen(nextState);
              if (nextState) {
                setLastSeenLogCount(globalLog.length);
                localStorage.setItem('wildfire_last_seen_logs', globalLog.length.toString());
              }
            }}
            title="Staff Changes"
            aria-label="Staff Changes"
          >
            <Bell size={15} />
            {hasUnreadLogs && <span className={styles.unreadDot} />}
          </button>

          {changelogOpen && (
            <div className={styles.changelogDropdown}>
              <div className={styles.changelogHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>Staff Changes</h4>
                  <button
                    className={styles.expandBtn}
                    onClick={() => {
                      setChangelogOpen(false)
                      setStaffChangesModalOpen(true)
                      setLastSeenLogCount(globalLog.length)
                      localStorage.setItem('wildfire_last_seen_logs', globalLog.length.toString())
                    }}
                    title="Expand to full view"
                    aria-label="Expand Staff Changes"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
                {isEditMode && (
                  <button
                    className={styles.clearLogsBtn}
                    onClick={() => {
                      if (window.confirm('Clear all staff changes?')) {
                        useStore.setState({ globalLog: [] })
                        localStorage.setItem('wildfire_audit_log', '[]')
                      }
                    }}
                  >
                    Clear Logs
                  </button>
                )}
              </div>
              <div className={styles.changelogBody}>
                {validLogs.length === 0 ? (
                  <div className={styles.changelogDesc} style={{ textAlign: 'center', padding: '20px 0' }}>No staff changes recorded yet.</div>
                ) : (
                validLogs.slice(0, 30).map(log => {
                    const { isPromote, isDemote, isRemove, targetName, roleName, roleColor, byAvatar, targetAvatar, label, reasonText } = parseWidgetLog(log)
                    const { date, time } = (() => {
                      const d = new Date(log.date)
                      return {
                        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      }
                    })()
                    return (
                      <div className={styles.changelogItem} key={log.id} style={{ '--item-color': roleColor }}>
                        <div className={styles.changelogItemAccent} style={{ background: roleColor }} />
                        <div className={styles.changelogItemAvatars}>
                          <div className={styles.changelogMiniAvatar}>
                            {byAvatar
                              ? <img src={byAvatar} className={styles.changelogMiniImg} alt="" onError={e => e.target.style.display = 'none'} />
                              : <div className={styles.changelogMiniIcon}>{log.by?.toUpperCase() === 'CONSOLE' ? <Terminal size={9} /> : <User size={9} />}</div>
                            }
                          </div>
                          <div className={styles.changelogMiniArrow} style={{ color: roleColor }}>
                            {isPromote && <ArrowUp size={9} />}
                            {isDemote && <ArrowDown size={9} />}
                            {isRemove && <Trash2 size={9} />}
                          </div>
                          <div className={styles.changelogMiniAvatar}>
                            {targetAvatar
                              ? <img src={targetAvatar} className={styles.changelogMiniImg} alt="" onError={e => e.target.style.display = 'none'} />
                              : <div className={styles.changelogMiniIcon}><User size={9} /></div>
                            }
                          </div>
                        </div>
                        <div className={styles.changelogItemBody}>
                          <div className={styles.changelogItemMeta}>
                            <span className={styles.changelogItemLabel} style={{ color: roleColor }}>{label}</span>
                            <span className={styles.changelogItemTime}>{date} {time}</span>
                          </div>
                          <div className={styles.changelogItemName}>
                            {targetName || log.by}
                            {roleName && <span className={styles.changelogItemRole} style={{ color: roleColor }}> → {roleName}</span>}
                          </div>
                          <div className={styles.changelogItemBy}>by {log.by}</div>
                          {reasonText && <div className={styles.changelogItemReason}>"{reasonText}"</div>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit & Settings Group */}
        <div className={styles.editSettingsGroup}>
          <button
            className={`${styles.groupEditBtn} ${isEditMode ? styles.groupEditBtnActive : ''}`}
            onClick={onToggleEditMode}
            title={isEditMode ? 'Lock editing' : 'Enable editing'}
          >
            {isEditMode ? <Lock size={14} /> : <Edit3 size={14} />}
            <span>{isEditMode ? 'Lock' : 'Edit'}</span>
          </button>
          <div className={styles.groupDivider} />
          <button
            className={`${styles.groupSettingsBtn} ${isEditMode ? styles.groupSettingsBtnActive : ''}`}
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Open settings"
          >
            <LayoutGrid size={15} />
          </button>
        </div>

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

      {staffChangesModalOpen && (
        <StaffChangesModal onClose={() => setStaffChangesModalOpen(false)} />
      )}
    </nav>
  )
}
