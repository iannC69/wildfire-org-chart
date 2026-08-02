import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, Users, Plus, ArrowUp, ArrowDown, Clock, Shield } from 'lucide-react'
import styles from './ProfileModal.module.css'
import { getInitials } from '../data/staffData'
import { useStore } from '../store/useStore'

export default function ProfileModal({ node, onClose }) {
  const [expandedResps, setExpandedResps] = useState({})
  const [activeTab, setActiveTab] = useState('atributes')
  const { roles, roleDetails } = useStore()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const toggleResp = (idx) => {
    setExpandedResps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  const roleDef = roles.find(r => r.id === node.roleId)
  const roleColor = roleDef?.color || '#a855f7'
  const roleGlow = roleDef?.glow || 'rgba(168, 85, 247, 0.55)'

  // Find detailed responsibilities
  const details = roleDetails.find(r => r.id === node.roleId)
  const responsibilities = node.responsibilities?.length > 0 ? node.responsibilities : (details?.responsibilities || [])

  const getStaffStats = (history, fallbackDate) => {
    if (!history || history.length === 0) {
      const start = new Date(fallbackDate)
      const now = new Date()
      return {
        days: Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24))),
        joinDate: start.toISOString().split('T')[0]
      }
    }

    let currentPeriodStart = null
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))

    sortedHistory.forEach(h => {
      if (h.action === 'Removed' || (h.action === 'Demoted' && h.toRole === 'Fără Grad')) {
        currentPeriodStart = null
      } else if (h.action === 'Promoted') {
        if (!currentPeriodStart) {
          currentPeriodStart = new Date(h.date)
        }
      }
    })

    if (currentPeriodStart) {
      return {
        days: Math.floor((new Date() - currentPeriodStart) / (1000 * 60 * 60 * 24)),
        joinDate: currentPeriodStart.toISOString().split('T')[0]
      }
    }

    return { days: 0, joinDate: '-' }
  }

  const { days: daysInStaff, joinDate: dynamicJoinDate } = getStaffStats(node.history, node.joinDate || '2023-01-15')

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        style={{ '--role-color': roleColor, '--role-glow': roleGlow }}
        onClick={e => e.stopPropagation()} // prevent overlay click closing it
      >
        <button className={styles.closeButton} onClick={onClose}>
          <X size={18} />
        </button>

        {/* Left Column: Profile Overview */}
        <div className={styles.profileSidebar}>
          <div className={styles.avatarWrapper}>
            {node.avatarUrl ? (
              <img src={node.avatarUrl} alt="avatar" className={styles.avatarImage} />
            ) : (
              <span className={styles.avatarInitials}>{getInitials(node.name)}</span>
            )}
          </div>

          <h2 className={styles.profileName}>{node.name}</h2>

          <div className={styles.roleBadge}>
            <Shield size={12} />
            {roleDef?.title?.toUpperCase().replace('_', ' ') || 'STAFF'}
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.infoIconBox} style={{ color: '#4ade80' }}>
                <Calendar size={18} />
              </div>
              <div className={styles.infoTextCol}>
                <span className={styles.infoLabel}>Joined</span>
                <span className={styles.infoValue}>{dynamicJoinDate}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIconBox} style={{ color: '#60a5fa' }}>
                <Clock size={18} />
              </div>
              <div className={styles.infoTextCol}>
                <span className={styles.infoLabel}>Days in Staff</span>
                <span className={styles.infoValue}>{daysInStaff}</span>
              </div>
            </div>

            {node.steamLink && (
              <a href={node.steamLink} target="_blank" rel="noreferrer" className={styles.infoItem} style={{ textDecoration: 'none' }}>
                <div className={styles.infoIconBox} style={{ color: '#ff6a00' }}>
                  <ExternalLink size={18} />
                </div>
                <div className={styles.infoTextCol}>
                  <span className={styles.infoLabel}>Steam</span>
                  <span className={styles.infoValue} style={{ color: '#ff6a00' }}>Profile</span>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Responsibilities & History */}
        <div className={styles.contentArea}>
          <div className={styles.tabsHeader}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'atributes' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('atributes')}
            >
              <Users size={18} /> Atribuții
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Calendar size={18} /> Istoric Promovări
            </button>
          </div>

          {activeTab === 'atributes' && (
            responsibilities.length > 0 ? (
              <div className={styles.respList}>
                {responsibilities.map((resp, idx) => {
                  const isExpanded = !!expandedResps[idx]
                  return (
                    <div
                      key={idx}
                      className={`${styles.respItem} ${isExpanded ? styles.respItemActive : ''}`}
                      onClick={() => toggleResp(idx)}
                    >
                      <div className={styles.respHeader}>
                        <div className={styles.respDot} />
                        <span className={styles.respText}>{resp.title || resp}</span>
                        <div className={styles.respIcon}>
                          {isExpanded ? <X size={14} /> : <Plus size={14} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={styles.respDetails}>
                          {resp.detail || "Detaliile complete și procedurile specifice pentru această responsabilitate vor fi adăugate aici."}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Nu are atribuții specifice setate.
              </div>
            )
          )}

          {activeTab === 'history' && (
            <div className={styles.historyList}>
              {node.history && node.history.length > 0 ? (
                [...node.history].sort((a, b) => new Date(b.date) - new Date(a.date)).map((h, i) => {
                  const targetRole = roles.find(r => r.title.toLowerCase() === h.toRole.toLowerCase())
                  let hColor = targetRole?.color || '#10B981'
                  if (h.action === 'Removed') hColor = '#EF4444' // Red for removed

                  return (
                    <div
                      key={i}
                      className={styles.historyItem}
                      style={{ '--item-color': hColor }}
                    >
                      <div className={styles.historyIconWrapper}>
                        {h.action === 'Promoted' ? <ArrowUp size={16} /> : h.action === 'Removed' ? <X size={16} /> : <ArrowDown size={16} />}
                      </div>
                      <div className={styles.historyContent}>
                        <div className={styles.historyTopRow}>
                          <span className={styles.historyAction}>
                            {h.action === 'Removed' ? 'Remove din ' : (h.action === 'Promoted' ? 'Up la ' : 'Down la ')}
                            <span className={styles.historyRole}>{h.action === 'Removed' ? 'Staff' : h.toRole}</span>
                          </span>
                          <span className={styles.historyDatePill}>{new Date(h.date).toLocaleDateString()}</span>
                          <span className={styles.historyStatusPill}>{h.action.toUpperCase()}</span>
                        </div>
                        <div className={styles.historyBottomRow}>
                          System record <Clock size={12} style={{ margin: '0 4px', display: 'inline' }}/> by Console | wildfire.ro
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className={styles.emptyState}>Nu există istoric de promovări înregistrat.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
