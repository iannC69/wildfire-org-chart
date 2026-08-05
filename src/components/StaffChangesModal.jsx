import React from 'react'
import { createPortal } from 'react-dom'
import { X, History, User, Terminal, ArrowUp, ArrowDown, Shield, Trash2, Clock, ChevronRight } from 'lucide-react'
import styles from './StaffChangesModal.module.css'
import { useStore, flattenNodes } from '../store/useStore'

export default function StaffChangesModal({ onClose }) {
  const globalLog = useStore(s => s.globalLog || [])
  const roles = useStore(s => s.roles || [])
  const tree = useStore(s => s.tree)
  const [filter, setFilter] = React.useState('ALL')
  const [selectedLog, setSelectedLog] = React.useState(null)

  const allMembers = React.useMemo(() => {
    return tree ? flattenNodes(tree) : []
  }, [tree])

  const validLogs = globalLog.filter(log =>
    log.message.startsWith('Promoted') ||
    log.message.startsWith('Demoted') ||
    log.message.startsWith('Up') ||
    log.message.startsWith('Down') ||
    log.message.startsWith('Removed')
  )

  const filteredLogs = validLogs.filter(log => {
    if (filter === 'ALL') return true
    if (filter === 'PROMOTE') return log.message.startsWith('Promoted') || log.message.startsWith('Up')
    if (filter === 'DEMOTE') return log.message.startsWith('Demoted') || log.message.startsWith('Down')
    if (filter === 'REMOVE') return log.message.startsWith('Removed')
    return true
  })

  // Select first log by default when filter changes
  React.useEffect(() => {
    if (filteredLogs.length > 0 && !selectedLog) {
      setSelectedLog(filteredLogs[0])
    }
  }, [filteredLogs.length])

  React.useEffect(() => {
    if (filteredLogs.length > 0) {
      setSelectedLog(filteredLogs[0])
    } else {
      setSelectedLog(null)
    }
  }, [filter])

  const parseLog = (log) => {
    if (!log) return {}
    let actionText = log.message
    let reasonText = ''
    if (log.message.includes(' - Reason: ')) {
      const parts = log.message.split(' - Reason: ')
      actionText = parts[0]
      reasonText = parts.slice(1).join(' - Reason: ')
    }

    const isPromote = log.message.startsWith('Promoted')
    const isDemote = log.message.startsWith('Demoted')
    const isRemove = log.message.startsWith('Removed')

    // Resolve actor's avatar + role details
    let displayByAvatar = log.byAvatar
    let actorRole = ''
    let actorRoleColor = 'rgba(255,255,255,0.3)'
    let actorRoleRank = null
    const actorMember = allMembers.find(m => m.name && log.by && m.name.toLowerCase() === log.by.toLowerCase())
    if (actorMember) {
      if (!displayByAvatar) displayByAvatar = actorMember.avatarUrl
      const actorRoleDef = roles.find(r => r.id === actorMember.roleId)
      if (actorRoleDef) {
        actorRole = actorRoleDef.title
        actorRoleColor = actorRoleDef.color
        actorRoleRank = actorRoleDef.rank
      }
    }

    let displayTargetAvatar = log.targetAvatar
    let roleColor = null
    let targetName = null
    let roleName = null
    let fromRole = null
    let fromRoleColor = 'rgba(255,255,255,0.3)'
    let toRoleColor = null
    let toRoleRank = null
    let fromRoleRank = null
    let targetCurrentRole = ''
    let targetCurrentRoleColor = 'rgba(255,255,255,0.3)'

    // Pattern 1: "Promoted/Demoted member NAME to/from ROLE"
    const matchStandard = actionText.match(/(?:Promoted|Demoted) member (.*?) (?:to|from) (.*)/i)
    // Pattern 2: "Removed member NAME (ROLE)"
    const matchRemoved = actionText.match(/Removed member (.*?) \((.*?)\)/i)
    // Pattern 3: fallback "Removed member NAME from ROLE"
    const matchRemovedFrom = actionText.match(/Removed member (.*?) from (.*)/i)

    if (matchStandard && matchStandard[1]) {
      targetName = matchStandard[1].trim()
      if (matchStandard[2]) roleName = matchStandard[2].trim()
    } else if (matchRemoved && matchRemoved[1]) {
      targetName = matchRemoved[1].trim()
      if (matchRemoved[2]) roleName = matchRemoved[2].trim()
    } else if (matchRemovedFrom && matchRemovedFrom[1]) {
      targetName = matchRemovedFrom[1].trim()
      if (matchRemovedFrom[2]) roleName = matchRemovedFrom[2].trim()
    }

    if (targetName) {
      const foundTarget = allMembers.find(m => m.name && m.name.toLowerCase() === targetName.toLowerCase())
      if (foundTarget && !displayTargetAvatar) displayTargetAvatar = foundTarget.avatarUrl

      // Resolve target's current role
      if (foundTarget) {
        const targetRoleDef = roles.find(r => r.id === foundTarget.roleId)
        if (targetRoleDef) {
          targetCurrentRole = targetRoleDef.title
          targetCurrentRoleColor = targetRoleDef.color
        }
      }

      // Resolve to-role color + rank
      if (roleName) {
        const foundRole = roles.find(r => r.title.toLowerCase() === roleName.toLowerCase())
        if (foundRole) {
          roleColor = foundRole.color
          toRoleColor = foundRole.color
          toRoleRank = foundRole.rank
        }
      }

      // Try to find fromRole from the member's history
      const targetMember = allMembers.find(m => m.name && m.name.toLowerCase() === targetName.toLowerCase())
      if (targetMember?.history?.length) {
        const logDate = new Date(log.date).getTime()
        const histEntry = targetMember.history.find(h => Math.abs(new Date(h.date).getTime() - logDate) < 30000)
        if (histEntry) {
          fromRole = histEntry.fromRole
          const fromRoleDef = roles.find(r => r.title.toLowerCase() === histEntry.fromRole?.toLowerCase())
          if (fromRoleDef) {
            fromRoleColor = fromRoleDef.color
            fromRoleRank = fromRoleDef.rank
          }
        }
      }
    }

    // Remove always uses vivid red regardless of role
    if (isRemove) {
      roleColor = '#ef4444'
    } else if (!roleColor) {
      if (isPromote) roleColor = '#22c55e'
      else if (isDemote) roleColor = '#eab308'
      else roleColor = '#f97316'
    }

    // Build human-readable sentence
    const verb = isPromote ? 'promoted' : isDemote ? 'demoted' : isRemove ? 'removed' : 'changed'
    const actorLabel = log.by || 'Console'
    const prep = isRemove ? 'from' : 'to'
    let sentence = `${actorLabel} ${verb} ${targetName || ''}`
    if (roleName) sentence += ` ${prep} ${roleName}`

    return {
      actionText, reasonText, isPromote, isDemote, isRemove,
      displayByAvatar, displayTargetAvatar,
      roleColor, targetName, roleName, fromRole,
      actorRole, actorRoleColor, actorRoleRank,
      fromRoleColor, fromRoleRank,
      toRoleColor, toRoleRank,
      targetCurrentRole, targetCurrentRoleColor,
      sentence
    }
  }

  const getActionLabel = (log) => {
    if (log.message.startsWith('Promoted')) return 'PROMOTED'
    if (log.message.startsWith('Demoted')) return 'DEMOTED'
    if (log.message.startsWith('Removed')) return 'REMOVED'
    return 'CHANGED'
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const detail = selectedLog ? parseLog(selectedLog) : null

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── LEFT PANEL: Log list ── */}
        <div className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <div className={styles.headerIconWrap}>
              <History size={15} />
            </div>
            <div>
              <h2 className={styles.leftTitle}>Staff Changes</h2>
              <p className={styles.leftSub}>{validLogs.length} entries</p>
            </div>
            {useStore.getState().isEditMode && (
              <button
                className={styles.clearBtn}
                onClick={() => {
                  if (window.confirm('Clear all staff changes?')) {
                    useStore.setState({ globalLog: [] })
                    localStorage.setItem('wildfire_audit_log', '[]')
                  }
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div className={styles.filters}>
            {['ALL', 'PROMOTE', 'DEMOTE', 'REMOVE'].map(f => {
              const isActive = filter === f
              const baseColorClass = f !== 'ALL' && !isActive ? styles[`filterBtn${f}`] : ''
              const cls = `${styles.filterBtn} ${isActive ? styles[`filterBtnActive${f}`] : baseColorClass}`
              return (
                <button key={f} className={cls} onClick={() => setFilter(f)}>
                  {f}
                </button>
              )
            })}
          </div>

          <div className={styles.logList}>
            {filteredLogs.length === 0 ? (
              <div className={styles.emptyState}>No entries found.</div>
            ) : (
              filteredLogs.map(log => {
                const { displayByAvatar, displayTargetAvatar, roleColor, targetName } = parseLog(log)
                const isSelected = selectedLog?.id === log.id
                const { date, time } = formatDate(log.date)

                return (
                  <div
                    key={log.id}
                    className={`${styles.logRow} ${isSelected ? styles.logRowSelected : ''}`}
                    style={{ '--log-color': roleColor }}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className={styles.logRowAccent} style={{ background: roleColor }} />
                    <div className={styles.logRowAvatars}>
                      <div className={styles.miniAvatar}>
                        {displayByAvatar
                          ? <img src={displayByAvatar} className={styles.miniAvatarImg} alt="" onError={e => { e.target.style.display = 'none' }} />
                          : <div className={styles.miniAvatarFallback}>{log.by?.toUpperCase() === 'CONSOLE' ? <Terminal size={10} /> : <User size={10} />}</div>
                        }
                      </div>
                      <ChevronRight size={10} color="rgba(255,255,255,0.2)" />
                      <div className={styles.miniAvatar}>
                        {displayTargetAvatar
                          ? <img src={displayTargetAvatar} className={styles.miniAvatarImg} alt="" onError={e => { e.target.style.display = 'none' }} />
                          : <div className={styles.miniAvatarFallback}><User size={10} /></div>
                        }
                      </div>
                    </div>
                    <div className={styles.logRowInfo}>
                      <div className={styles.logRowMeta}>
                        <span className={styles.logRowLabel} style={{ color: roleColor }}>{getActionLabel(log)}</span>
                        <span className={styles.logRowTime}>{time}</span>
                      </div>
                      <div className={styles.logRowTarget}>{targetName || log.by}</div>
                      <div className={styles.logRowDate}>{date} · by {log.by}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Detail view ── */}
        <div className={styles.rightPanel}>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>

          {!selectedLog || !detail ? (
            <div className={styles.noSelection}>
              <History size={40} color="rgba(255,255,255,0.1)" />
              <p>Select an entry to view details</p>
            </div>
          ) : (
            <div className={styles.detailView} style={{ '--log-color': detail.roleColor }}>
              {/* Action type banner */}
              <div className={styles.detailBanner}>
                <div className={styles.detailBannerIcon} style={{ background: `${detail.roleColor}22`, border: `1px solid ${detail.roleColor}55` }}>
                  {detail.isPromote && <ArrowUp size={22} color={detail.roleColor} />}
                  {detail.isDemote && <ArrowDown size={22} color={detail.roleColor} />}
                  {detail.isRemove && <Trash2 size={22} color={detail.roleColor} />}
                  {!detail.isPromote && !detail.isDemote && !detail.isRemove && <ChevronRight size={22} color={detail.roleColor} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.detailSentence}>
                    <span className={styles.detailSentenceActor}>{selectedLog.by}</span>
                    {' '}
                    <span className={styles.detailSentenceVerb} style={{ color: detail.roleColor }}>
                      {detail.isPromote ? 'promoted' : detail.isDemote ? 'demoted' : detail.isRemove ? 'removed' : 'changed'}
                    </span>
                    {detail.targetName && <>{' '}<span className={styles.detailSentenceTarget}>{detail.targetName}</span></>}
                    {detail.roleName && (
                      <>{' '}<span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                        {detail.isRemove ? 'from' : 'to'}
                      </span>{' '}
                      <span style={{ color: detail.roleColor, fontWeight: 700 }}>{detail.roleName}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.detailTimestamp}>
                    <Clock size={11} />
                    {formatDate(selectedLog.date).date} at {formatDate(selectedLog.date).time}
                  </div>
                </div>
              </div>

              {/* Members row */}
              <div className={styles.membersRow}>
                {/* Admin who actioned */}
                <div className={styles.memberCard}>
                  <div className={styles.memberCardLabel}>AUTHORIZED BY</div>
                  <div className={styles.memberCardAvatar}>
                    {detail.displayByAvatar
                      ? <img src={detail.displayByAvatar} className={styles.memberCardImg} alt="" />
                      : <div className={styles.memberCardFallback}>
                          {selectedLog.by?.toUpperCase() === 'CONSOLE' ? <Terminal size={24} /> : <User size={24} />}
                        </div>
                    }
                    <div className={styles.memberCardBadge}><Shield size={10} /></div>
                  </div>
                  <div className={styles.memberCardName}>{selectedLog.by}</div>
                  {detail.actorRole ? (
                    <div className={styles.roleBadge} style={{ '--badge-color': detail.actorRoleColor }}>
                      {detail.actorRole}
                    </div>
                  ) : (
                    <div className={styles.memberCardRole}>Console</div>
                  )}
                </div>

                <div className={styles.arrowConnector} style={{ color: detail.roleColor }}>
                  {detail.isPromote && <ArrowUp size={20} />}
                  {detail.isDemote && <ArrowDown size={20} />}
                  {detail.isRemove && <Trash2 size={18} />}
                  {!detail.isPromote && !detail.isDemote && !detail.isRemove && <ChevronRight size={20} />}
                </div>

                {/* Target member */}
                <div className={styles.memberCard}>
                  <div className={styles.memberCardLabel}>TARGET MEMBER</div>
                  <div className={styles.memberCardAvatar} style={{ borderColor: `${detail.roleColor}66` }}>
                    {detail.displayTargetAvatar
                      ? <img src={detail.displayTargetAvatar} className={styles.memberCardImg} alt="" />
                      : <div className={styles.memberCardFallback}><User size={24} /></div>
                    }
                  </div>
                  <div className={styles.memberCardName}>{detail.targetName || '—'}</div>
                  {detail.fromRole && detail.roleName ? (
                    <div className={styles.roleTransition}>
                      <div className={styles.roleBadgeSmall} style={{ '--badge-color': detail.fromRoleColor }}>
                        {detail.fromRole}
                      </div>
                      <span style={{ color: detail.roleColor, fontSize: 14 }}>→</span>
                      <div className={styles.roleBadgeSmall} style={{ '--badge-color': detail.roleColor }}>
                        {detail.roleName}
                      </div>
                    </div>
                  ) : detail.roleName ? (
                    <div className={styles.roleBadge} style={{ '--badge-color': detail.roleColor }}>
                      {detail.roleName}
                    </div>
                  ) : (
                    <div className={styles.memberCardRole} style={{ color: detail.roleColor }}>
                      {detail.isRemove ? 'Removed' : '—'}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail info grid */}
              <div className={styles.detailGrid}>
                {detail.fromRole && (
                  <div className={styles.detailCard}>
                    <div className={styles.detailCardLabel}>From Role</div>
                    <div className={styles.detailCardValue} style={{ color: detail.fromRoleColor }}>{detail.fromRole}</div>
                  </div>
                )}
                {detail.roleName && (
                  <div className={styles.detailCard}>
                    <div className={styles.detailCardLabel}>To Role</div>
                    <div className={styles.detailCardValue} style={{ color: detail.roleColor }}>{detail.roleName}</div>
                  </div>
                )}
                <div className={styles.detailCard}>
                  <div className={styles.detailCardLabel}>Actioned By</div>
                  <div className={styles.detailCardValue}>{selectedLog.by}</div>
                  {detail.actorRole && <div className={styles.detailCardSub} style={{ color: detail.actorRoleColor }}>{detail.actorRole}</div>}
                </div>
                <div className={styles.detailCard}>
                  <div className={styles.detailCardLabel}>Date &amp; Time</div>
                  <div className={styles.detailCardValue}>{formatDate(selectedLog.date).date}</div>
                  <div className={styles.detailCardSub}>{formatDate(selectedLog.date).time}</div>
                </div>
                <div className={styles.detailCard}>
                  <div className={styles.detailCardLabel}>Action</div>
                  <div className={styles.detailCardValue} style={{ color: detail.roleColor }}>{getActionLabel(selectedLog)}</div>
                </div>
              </div>

              {detail.reasonText && (
                <div className={styles.reasonBlock}>
                  <div className={styles.reasonLabel}>Reason for Action</div>
                  <div className={styles.reasonText}>"{detail.reasonText}"</div>
                </div>
              )}

              {/* Target member history timeline */}
              {(() => {
                const targetMember = detail.targetName
                  ? allMembers.find(m => m.name && m.name.toLowerCase() === detail.targetName.toLowerCase())
                  : null
                const history = targetMember?.history?.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
                if (!history?.length) return null
                return (
                  <div className={styles.historySection}>
                    <div className={styles.historySectionLabel}>{detail.targetName}'s Recent History</div>
                    <div className={styles.historyList}>
                      {history.map((h, i) => {
                        const hRoleDef = roles.find(r => r.title.toLowerCase() === h.toRole?.toLowerCase())
                        const hColor = hRoleDef?.color || (h.action === 'Promoted' ? '#22c55e' : h.action === 'Demoted' ? '#eab308' : '#ef4444')
                        return (
                          <div key={i} className={styles.historyItem}>
                            <div className={styles.historyDot} style={{ background: hColor }} />
                            <div className={styles.historyItemContent}>
                              <span className={styles.historyAction} style={{ color: hColor }}>{h.action}</span>
                              {h.fromRole && <span className={styles.historyRoles}>{h.fromRole} → {h.toRole}</span>}
                              <span className={styles.historyBy}>by {h.by} · {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
