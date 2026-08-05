import React from 'react'
import { createPortal } from 'react-dom'
import { X, History } from 'lucide-react'
import styles from './StaffChangesModal.module.css'
import { useStore } from '../store/useStore'

export default function StaffChangesModal({ onClose }) {
  const globalLog = useStore(s => s.globalLog || [])
  const [filter, setFilter] = React.useState('ALL')

  const validLogs = globalLog.filter(log => 
    log.message.startsWith('Promoted') || 
    log.message.startsWith('Demoted') || 
    log.message.startsWith('Removed')
  );

  const filteredLogs = validLogs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'PROMOTE') return log.message.startsWith('Promoted');
    if (filter === 'DEMOTE') return log.message.startsWith('Demoted');
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
              if (log.message.startsWith('Removed')) itemClass = `${styles.logItem} ${styles.logItemREMOVE}`

              return (
                <div key={log.id} className={itemClass} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px' }}>
                  {log.targetAvatar ? (
                    <img src={log.targetAvatar} alt="" style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className={styles.logDate}>
                      {new Date(log.date).toLocaleString()} • BY{' '}
                      {log.byAvatar && <img src={log.byAvatar} alt="" style={{ width: 14, height: 14, borderRadius: '50%', display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />}
                      {log.by.toUpperCase()}
                    </div>
                    <div className={styles.logMessage}>
                      {log.message}
                    </div>
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
