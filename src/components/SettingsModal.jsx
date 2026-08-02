import React from 'react'
import { X, Save, Trash2, PlusCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import styles from './SettingsModal.module.css'

export default function SettingsModal({ onClose }) {
  const roles = useStore(s => s.roles)
  const updateRole = useStore(s => s.updateRole)

  // Quick helper to safely parse maxSlots
  const handleUpdate = (id, field, val) => {
    if (field === 'maxSlots') {
      val = val === '' ? null : parseInt(val, 10)
    }
    if (field === 'rank') {
      val = parseInt(val, 10) || 0
    }
    updateRole(id, { [field]: val })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Setări Proiect & Roluri</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.subtitle}>Configurează ierarhia și culorile rolurilor.</p>
          
          <div className={styles.rolesList}>
            {roles.map(role => (
              <div key={role.id} className={styles.roleRow}>
                <div className={styles.roleColorPreview} style={{ background: role.color, boxShadow: `0 0 10px ${role.glow}` }} />
                
                <div className={styles.roleInputs}>
                  <div className={styles.inputGroup}>
                    <label>Titlu</label>
                    <input type="text" value={role.title} onChange={e => handleUpdate(role.id, 'title', e.target.value)} />
                  </div>
                  
                  <div className={styles.inputGroup} style={{ width: 80 }}>
                    <label>Culoare</label>
                    <input type="color" value={role.color} onChange={e => handleUpdate(role.id, 'color', e.target.value)} style={{ padding: 0 }} />
                  </div>

                  <div className={styles.inputGroup} style={{ width: 80 }}>
                    <label>Rank (0=Top)</label>
                    <input type="number" value={role.rank} onChange={e => handleUpdate(role.id, 'rank', e.target.value)} />
                  </div>

                  <div className={styles.inputGroup} style={{ width: 80 }}>
                    <label>Slots Max</label>
                    <input type="number" value={role.maxSlots === null ? '' : role.maxSlots} placeholder="∞" onChange={e => handleUpdate(role.id, 'maxSlots', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.saveBtn} onClick={onClose}>
            <Save size={16} /> Salvează modificările
          </button>
        </div>
      </div>
    </div>
  )
}
