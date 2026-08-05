import React, { useState, useEffect, useMemo } from 'react'
import { X, PlusCircle, Trash2, Download } from 'lucide-react'
import { useStore, flattenNodes } from '../store/useStore'
import { getInitials } from '../data/staffData'
import styles from './MemberEditSidebar.module.css'

export default function MemberEditSidebar({ node, onClose }) {
  const { tree, roles, updateNodeDetails, setNodeRole, moveNode, addNode, kickNode } = useStore()
  
  // Find full node data just to be safe
  const allNodes = useMemo(() => flattenNodes(tree), [tree])
  const activeNode = allNodes.find(n => n.id === node.id) || node

  const role = roles.find(r => r.id === activeNode.roleId)
  const roleDetails = useStore(s => s.roleDetails)
  
  const [name, setName] = useState(activeNode.name || '')
  const [avatarUrl, setAvatarUrl] = useState(activeNode.avatarUrl || '')
  const [resps, setResps] = useState((activeNode.responsibilities || []).join('\n'))
  
  useEffect(() => {
    setName(activeNode.name || '')
    setAvatarUrl(activeNode.avatarUrl || '')
    setResps((activeNode.responsibilities || []).join('\n'))
  }, [activeNode])

  const subordinates = activeNode.children?.length || 0

  const handleSaveDetails = () => {
    const responsibilities = resps.split('\n').map(r => r.trim()).filter(Boolean)
    updateNodeDetails(activeNode.id, {
      name,
      avatarUrl,
      responsibilities
    })
  }

  const handleImportRoleResps = () => {
    const roleResps = roleDetails.find(r => r.id === role.id)?.responsibilities || []
    const textResps = roleResps.map(r => r.title || r).join('\n')
    // Combine existing and unique imported ones
    const existing = resps.split('\n').map(r => r.trim()).filter(Boolean)
    const toAdd = textResps.split('\n').map(r => r.trim()).filter(Boolean)
    const merged = Array.from(new Set([...existing, ...toAdd]))
    setResps(merged.join('\n'))
  }

  const handleRoleChange = (e) => {
    const newRoleId = e.target.value
    if (newRoleId !== activeNode.roleId) {
      setNodeRole(activeNode.id, newRoleId)
    }
  }

  const handleMoveChange = (e) => {
    const newParentId = e.target.value
    if (newParentId) {
      moveNode(activeNode.id, newParentId)
    }
  }

  const handleAddSubordinate = () => {
    const newId = `n-${Date.now()}`
    const newNode = {
      id: newId,
      name: 'New Member',
      roleId: activeNode.roleId, // default to same role, or lowest?
      vacant: true,
      children: []
    }
    addNode(activeNode.id, newNode)
  }

  const handleRemove = async () => {
    const result = await useStore.getState().requestPrompt("Remove Member", "Reason for removal (optional):", { isAction: true });
    if (result !== null) {
      const reasonText = typeof result === 'string' ? result : result.reason;
      const adminName = result.adminName;
      const date = result.date;
      kickNode(activeNode.id, reasonText, adminName, date)
      onClose()
    }
  }

  if (!role) return null

  return (
    <div className={styles.sidebar} style={{ '--role-color': role.color, '--role-glow': role.glow }}>
      <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
      
      <div className={styles.header}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{getInitials(name)}</div>
        )}
        <div className={styles.name}>{name}</div>
        <div className={styles.roleTitle}>{role.title}</div>
        <div className={styles.subCount}>{subordinates} subordonat{subordinates !== 1 ? 'i' : ''}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionBox}>
          <div className={styles.sectionTitle}>Name & Details</div>
          
          <input 
            type="text" 
            className={styles.input} 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Nume"
          />
          
          <input 
            type="text" 
            className={styles.input} 
            value={avatarUrl} 
            onChange={e => setAvatarUrl(e.target.value)} 
            placeholder="Avatar URL"
          />
          
          <textarea 
            className={`${styles.input} ${styles.textarea}`} 
            value={resps} 
            onChange={e => setResps(e.target.value)} 
            placeholder="Responsabilități (câte una pe linie)"
          />
          <button className={styles.syncBtn} onClick={handleImportRoleResps}>
            <Download size={14} /> Adaugă atribute din "Atribuții"
          </button>
          
          <button className={styles.saveBtn} onClick={handleSaveDetails}>
            Save Details
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionBox}>
          <div className={styles.sectionTitle}>Hierarchy</div>
          
          <select className={styles.select} value={activeNode.roleId} onChange={handleRoleChange}>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          
          <select className={styles.select} value="" onChange={handleMoveChange}>
            <option value="" disabled>Move to Manager...</option>
            {allNodes
              .filter(n => n.id !== activeNode.id && !n.vacant)
              .map(n => (
                <option key={n.id} value={n.id}>{n.name} ({roles.find(r => r.id === n.roleId)?.title})</option>
              ))
            }
          </select>
          
          <button className={styles.actionBtn} onClick={handleAddSubordinate}>
            <PlusCircle size={16} /> Add Subordinate
          </button>
          
          <button className={`${styles.actionBtn} ${styles.removeBtn}`} onClick={handleRemove}>
            <Trash2 size={16} /> Remove User
          </button>
        </div>
      </div>
    </div>
  )
}
