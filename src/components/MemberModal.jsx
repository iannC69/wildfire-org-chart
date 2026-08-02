import React, { useState } from 'react'
import Avatar from './Avatar'
import styles from './MemberModal.module.css'

export default function MemberModal({ member, role, onClose, onSave }) {
  const [editing, setEditing] = useState(false)
  const [resps, setResps] = useState([...member.responsibilities])
  const [newResp, setNewResp] = useState('')

  const handleSave = () => {
    onSave(role.id, member.id, resps)
    setEditing(false)
  }

  const removeResp = (i) => setResps(r => r.filter((_, idx) => idx !== i))
  const addResp = () => {
    if (newResp.trim()) {
      setResps(r => [...r, newResp.trim()])
      setNewResp('')
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top accent */}
        <div className={styles.topBar} style={{ '--role-color': role.color }} />

        <div className={styles.body}>
          {/* Header */}
          <div className={styles.header}>
            <Avatar name={member.name} color={role.color} glow={role.glow} size={64} />
            <div className={styles.info}>
              <h2 className={styles.name}>{member.name}</h2>
              <div className={styles.roleBadge} style={{ '--role-color': role.color, '--role-glow': role.glowSoft }}>
                <span>{role.icon}</span>
                <span>{role.title}</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Responsibilities */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Responsabilități</span>
              <button
                className={`${styles.editBtn} ${editing ? styles.editBtnActive : ''}`}
                style={{ '--role-color': role.color }}
                onClick={() => editing ? handleSave() : setEditing(true)}
              >
                {editing ? '💾 Salvează' : '✏️ Editează'}
              </button>
            </div>

            <div className={styles.respList}>
              {resps.length === 0 && (
                <div className={styles.empty}>Nicio responsabilitate adăugată</div>
              )}
              {resps.map((r, i) => (
                <div key={i} className={styles.respItem} style={{ '--role-color': role.color, '--role-glow': role.glow }}>
                  <div className={styles.respDot} />
                  <span className={styles.respText}>{r}</span>
                  {editing && (
                    <button className={styles.respRemove} onClick={() => removeResp(i)}>✕</button>
                  )}
                </div>
              ))}

              {editing && (
                <div className={styles.addRow}>
                  <input
                    className={styles.addInput}
                    style={{ '--role-color': role.color }}
                    value={newResp}
                    onChange={e => setNewResp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addResp()}
                    placeholder="Adaugă responsabilitate..."
                    autoFocus
                  />
                  <button
                    className={styles.addConfirm}
                    style={{ background: role.color }}
                    onClick={addResp}
                  >+</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
