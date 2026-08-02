import React, { useState, useRef, useEffect } from 'react'
import styles from './AddMemberModal.module.css'

export default function AddMemberModal({ role, onClose, onAdd }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(role.id, name.trim())
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.topBar} style={{ '--role-color': role.color }} />
        <div className={styles.body}>
          <div className={styles.roleHeader}>
            <div className={styles.roleIcon} style={{ '--role-color': role.color }}>
              {role.icon}
            </div>
            <div>
              <h3 className={styles.title}>Adaugă Membru</h3>
              <div className={styles.roleLabel} style={{ color: role.color }}>{role.title}</div>
            </div>
          </div>

          <input
            ref={inputRef}
            className={styles.input}
            style={{ '--role-color': role.color }}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Numele membrului..."
          />

          <div className={styles.actions}>
            <button className={styles.cancel} onClick={onClose}>Anulează</button>
            <button
              className={styles.confirm}
              style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}bb)`, boxShadow: `0 4px 18px ${role.glow}` }}
              onClick={handleAdd}
            >
              ✓ Confirmă
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
