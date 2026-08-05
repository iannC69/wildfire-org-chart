import React, { useState, useEffect, useMemo } from 'react'
import { X, PlusCircle, Trash2, Download, Shield, Save, AlertTriangle, ArrowRight } from 'lucide-react'
import { useStore, flattenNodes } from '../store/useStore'
import { getInitials } from '../data/staffData'
import styles from './EditMemberModal.module.css'

// Helper to find parent of a node in tree
function findParent(tree, targetId, parent = null) {
  if (tree.id === targetId) return parent
  for (const child of tree.children || []) {
    const found = findParent(child, targetId, tree)
    if (found !== undefined) return found
  }
  return undefined
}

export default function EditMemberModal({ node, onClose }) {
  const { tree, roles, updateNodeDetails, setNodeRole, moveNode, addNode, kickNode } = useStore()

  const allNodes = useMemo(() => flattenNodes(tree), [tree])
  const activeNode = allNodes.find(n => n.id === node.id) || node
  const roleDetails = useStore(s => s.roleDetails)

  const role = roles.find(r => r.id === activeNode.roleId)

  const [name, setName] = useState(activeNode.name || '')
  const [avatarUrl, setAvatarUrl] = useState(activeNode.avatarUrl || '')
  const [resps, setResps] = useState((activeNode.responsibilities || []).join('\n'))
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [saved, setSaved] = useState(false)
  const [moveToast, setMoveToast] = useState('')

  // Find current parent
  const currentParent = useMemo(() => {
    const parent = findParent(tree, activeNode.id)
    if (parent) return allNodes.find(n => n.id === parent.id) || parent
    return null
  }, [tree, activeNode.id, allNodes])

  // Controlled move-to select value — shows current parent by default
  const [moveToId, setMoveToId] = useState(currentParent?.id || '')

  // Sync move-to when parent changes after move
  useEffect(() => {
    setMoveToId(currentParent?.id || '')
  }, [currentParent?.id])

  useEffect(() => {
    setName(activeNode.name || '')
    setAvatarUrl(activeNode.avatarUrl || '')
    setResps((activeNode.responsibilities || []).join('\n'))
  }, [activeNode.id])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const subordinates = activeNode.children?.length || 0

  const handleSaveDetails = () => {
    const responsibilities = resps.split('\n').map(r => r.trim()).filter(Boolean)
    updateNodeDetails(activeNode.id, { name, avatarUrl, responsibilities })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImportRoleResps = () => {
    if (!role) return
    const roleResps = roleDetails.find(r => r.id === role.id)?.responsibilities || []
    const textResps = roleResps.map(r => r.title || r).join('\n')
    const existing = resps.split('\n').map(r => r.trim()).filter(Boolean)
    const toAdd = textResps.split('\n').map(r => r.trim()).filter(Boolean)
    const merged = Array.from(new Set([...existing, ...toAdd]))
    setResps(merged.join('\n'))
  }

  const handleRoleChange = (e) => {
    const newRoleId = e.target.value
    if (newRoleId !== activeNode.roleId) setNodeRole(activeNode.id, newRoleId)
  }

  const handleMoveApply = () => {
    if (!moveToId) return
    if (moveToId === activeNode.id) return
    if (currentParent && moveToId === currentParent.id) return

    // Find if target is a descendant (would create cycle)
    const targetNode = allNodes.find(n => n.id === moveToId)
    if (!targetNode) return

    moveNode(activeNode.id, moveToId)

    const targetName = targetNode.name || 'selected manager'
    setMoveToast(`Moved under ${targetName}`)
    setTimeout(() => setMoveToast(''), 2500)
    setMoveToId(targetNode.id)
  }

  const handleAddSubordinate = () => {
    addNode(activeNode.id, {
      id: `n-${Date.now()}`,
      name: 'New Member',
      roleId: activeNode.roleId,
      vacant: true,
      children: []
    })
  }

  const handleRemove = async () => {
    const reason = await useStore.getState().requestPrompt("Remove Member", "Reason for removal (optional):");
    if (reason !== null) {
      kickNode(activeNode.id, reason)
      onClose()
    }
  }

  if (!role) return null

  const roleColor = role.color || '#a855f7'

  // Nodes eligible to be a new manager: not self, not vacant, not own descendants
  const eligibleManagers = allNodes.filter(n => {
    if (n.id === activeNode.id) return false
    if (n.vacant) return false
    // exclude own children/descendants
    const found = flattenNodes(activeNode).find(d => d.id === n.id)
    return !found
  })

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ '--role-color': roleColor, '--role-glow': role.glow || 'rgba(168,85,247,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>
                {getInitials(name)}
              </div>
            )}
            <div className={styles.avatarGlow} />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.headerName}>{name || 'New Member'}</div>
            <div className={styles.headerRole}>
              <Shield size={10} />
              {role.title?.toUpperCase()}
            </div>
            {subordinates > 0 && (
              <div className={styles.headerSub}>
                {subordinates} subordinate{subordinates !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Section: Name & Details */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Name &amp; Details</div>
            <div className={styles.sectionCard}>
              <div className={styles.field}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Member name"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Avatar URL</label>
                <input
                  type="text"
                  className={styles.input}
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Responsibilities</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={resps}
                  onChange={e => setResps(e.target.value)}
                  placeholder="One responsibility per line"
                  rows={4}
                />
              </div>
              <button className={styles.syncBtn} onClick={handleImportRoleResps}>
                <Download size={13} />
                Import from role defaults
              </button>
              <button
                className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
                onClick={handleSaveDetails}
              >
                <Save size={14} />
                {saved ? 'Saved!' : 'Save Details'}
              </button>
            </div>
          </div>

          {/* Section: Hierarchy */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Hierarchy</div>
            <div className={styles.sectionCard}>
              <div className={styles.field}>
                <label className={styles.label}>Role</label>
                <select className={styles.select} value={activeNode.roleId || ''} onChange={handleRoleChange}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Move To Manager
                  {currentParent && (
                    <span className={styles.currentParentHint}>
                      {' '}· Current: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{currentParent.name}</strong>
                    </span>
                  )}
                </label>
                <div className={styles.moveRow}>
                  <select
                    className={styles.select}
                    value={moveToId}
                    onChange={e => setMoveToId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {!currentParent && <option value="">-- No Manager (Root) --</option>}
                    {eligibleManagers.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({roles.find(r => r.id === n.roleId)?.title || '?'})
                      </option>
                    ))}
                  </select>
                  <button
                    className={styles.moveApplyBtn}
                    onClick={handleMoveApply}
                    disabled={!moveToId || (currentParent && moveToId === currentParent.id)}
                    title="Apply move"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
                {moveToast && (
                  <div className={styles.moveToast}>
                    ✓ {moveToast}
                  </div>
                )}
              </div>

              <button className={styles.addSubBtn} onClick={handleAddSubordinate}>
                <PlusCircle size={15} />
                Add Subordinate (Vacant)
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className={styles.section}>
            {!confirmRemove ? (
              <button className={styles.removeBtn} onClick={() => setConfirmRemove(true)}>
                <Trash2 size={15} />
                Remove User
              </button>
            ) : (
              <div className={styles.confirmBox}>
                <AlertTriangle size={16} color="#f87171" />
                <span>Remove <strong>{name}</strong> from the org chart?</span>
                <div className={styles.confirmActions}>
                  <button className={styles.confirmCancel} onClick={() => setConfirmRemove(false)}>
                    Cancel
                  </button>
                  <button className={styles.confirmOk} onClick={handleRemove}>
                    Yes, Remove
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
