import React from 'react'
import { createPortal } from 'react-dom'
import { X, History, User, Terminal, ArrowUp, ArrowDown, ChevronRight, Shield, Trash2 } from 'lucide-react'
import styles from './StaffChangesModal.module.css'
import { useStore } from '../store/useStore'

export default function StaffChangesModal({ onClose }) {
  const globalLog = useStore(s => s.globalLog || [])
  const tree = useStore(s => s.tree)
  
  // Flatten tree to look up avatars for older logs that might not have them saved
  const allMembers = React.useMemo(() => {
    function flatten(node) {
      if (!node) return []
      let res = [node]
      if (node.children) {
        node.children.forEach(c => { res = res.concat(flatten(c)) })
      }
      return res
    }
    return flatten(tree)
  }, [tree])

  const [filter, setFilter] = React.useState('ALL')

  const validLogs = globalLog.filter(log => 
    log.message.startsWith('Promoted') || 
    log.message.startsWith('Demoted') || 
    log.message.startsWith('Up') || 
    log.message.startsWith('Down') || 
    log.message.startsWith('Removed')
  );

  const filteredLogs = validLogs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'PROMOTE') return log.message.startsWith('Promoted') || log.message.startsWith('Up');
    if (filter === 'DEMOTE') return log.message.startsWith('Demoted') || log.message.startsWith('Down');
    if (filter === 'REMOVE') return log.message.startsWith('Removed');
    return true;
  });

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <History size={16} />
            </div>
            <h2>Staff Changes Log</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {useStore.getState().isEditMode && (
              <button
                style={{
                  background: 'rgba(255, 50, 50, 0.1)',
                  border: '1px solid rgba(255, 50, 50, 0.2)',
                  color: 'rgba(255, 100, 100, 0.9)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
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
            <button className={styles.closeBtn} onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          {['ALL', 'PROMOTE', 'DEMOTE', 'REMOVE'].map(f => {
            const isActive = filter === f;
            const activeClass = isActive ? styles[`filterBtnActive${f}`] : '';
            return (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeClass}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            )
          })}
        </div>
        
        <div className={styles.body}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyState}>No staff changes recorded yet for this filter.</div>
          ) : (
            filteredLogs.map(log => {
              let itemClass = styles.logItem
              if (log.message.startsWith('Promoted')) itemClass = `${styles.logItem} ${styles.logItemPROMOTE}`
              if (log.message.startsWith('Demoted')) itemClass = `${styles.logItem} ${styles.logItemDEMOTE}`
              if (log.message.startsWith('Up')) itemClass = `${styles.logItem} ${styles.logItemUP}`
              if (log.message.startsWith('Down')) itemClass = `${styles.logItem} ${styles.logItemDOWN}`
              if (log.message.startsWith('Removed')) itemClass = `${styles.logItem} ${styles.logItemREMOVE}`

              let actionText = log.message;
              let reasonText = "";
              if (log.message.includes(" - Reason: ")) {
                const parts = log.message.split(" - Reason: ");
                actionText = parts[0];
                reasonText = parts.slice(1).join(" - Reason: ");
              }

              const isPromote = log.message.startsWith('Promoted');
              const isDemote = log.message.startsWith('Demoted');
              const isRemove = log.message.startsWith('Removed');

              // Dynamically resolve avatars for older logs
              let displayByAvatar = log.byAvatar
              if (!displayByAvatar && log.by && log.by.toUpperCase() !== 'CONSOLE') {
                const foundBy = allMembers.find(m => m.name && m.name.toLowerCase() === log.by.toLowerCase())
                if (foundBy) displayByAvatar = foundBy.avatarUrl
              }

              let displayTargetAvatar = log.targetAvatar
              if (!displayTargetAvatar) {
                // Extract target name from action text e.g. "Promoted member TEST2 to Helper" -> "TEST2"
                const match = actionText.match(/(?:Promoted|Demoted|Removed) member (.*?) (?:to|from)/i)
                if (match && match[1]) {
                  const targetName = match[1].trim()
                  const foundTarget = allMembers.find(m => m.name && m.name.toLowerCase() === targetName.toLowerCase())
                  if (foundTarget) displayTargetAvatar = foundTarget.avatarUrl
                }
              }

              return (
                <div key={log.id} className={itemClass}>
                  <div className={styles.logAvatars}>
                    {/* Admin who did the action */}
                    <div className={styles.avatarWrap} title={`Action by ${log.by}`}>
                      {displayByAvatar ? (
                        <img 
                          src={displayByAvatar} 
                          className={styles.logAvatar} 
                          alt="" 
                          onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"; e.target.style.padding = '10px'; e.target.style.boxSizing = 'border-box'; }}
                        />
                      ) : (
                        <div className={styles.logAvatarFallback}>
                           {log.by?.toUpperCase() === 'CONSOLE' ? <Terminal size={20} /> : <User size={20} />}
                        </div>
                      )}
                      <div className={styles.avatarBadgeBy}><Shield size={10} /></div>
                    </div>
                    
                    {/* Directional Icon */}
                    <div className={styles.logDirection}>
                      {isPromote && <ArrowUp size={14} color="#22c55e" />}
                      {isDemote && <ArrowDown size={14} color="#eab308" />}
                      {isRemove && <Trash2 size={14} color="#ef4444" />}
                      {(!isPromote && !isDemote && !isRemove) && <ChevronRight size={14} color="rgba(255,255,255,0.4)" />}
                    </div>

                    {/* Target of the action */}
                    <div className={styles.avatarWrap} title="Target member">
                      {displayTargetAvatar ? (
                        <img 
                          src={displayTargetAvatar} 
                          className={styles.logAvatar} 
                          alt="" 
                          onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"; e.target.style.padding = '10px'; e.target.style.boxSizing = 'border-box'; }}
                        />
                      ) : (
                        <div className={styles.logAvatarFallback}><User size={20} /></div>
                      )}
                    </div>
                  </div>

                  <div className={styles.logContent}>
                    <div className={styles.logDate}>
                      {new Date(log.date).toLocaleString()} • BY {log.by.toUpperCase()}
                    </div>
                    <div className={styles.logActionText}>
                      {actionText}
                    </div>
                    {reasonText && (
                      <div className={styles.logReason}>
                        <span className={styles.reasonLabel}>Reason:</span> {reasonText}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
