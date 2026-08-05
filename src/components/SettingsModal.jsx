import React, { useState, useMemo, useEffect, useRef } from 'react'
import { X, Save, Trash2, Plus, Users, Shield, Edit3, Search, Hexagon, Crown, AlertTriangle, Archive, RefreshCw, Settings, PlusCircle, Zap, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useStore, flattenNodes } from '../store/useStore'
import styles from './SettingsModal.module.css'

// Helper to find parent of a node in tree
function findParent(tree, targetId, parent = null) {
  if (tree.id === targetId) return parent
  for (const child of tree.children || []) {
    const found = findParent(child, targetId, tree)
    if (found !== undefined) return found
  }
  return undefined
}

const ActionDropdown = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const options = [
    { value: '', label: 'SELECT ACTION', color: 'rgba(255,255,255,0.4)' },
    { value: 'Promoted', label: 'PROMOTED', color: '#22c55e', icon: ArrowUp },
    { value: 'Demoted', label: 'DEMOTED', color: '#eab308', icon: ArrowDown }
  ];

  const currentOption = options.find(o => o.value === value) || 
    (value === 'Removed' ? { value: 'Removed', label: 'REMOVED', color: '#ef4444', icon: Trash2 } : options[0]);

  return (
    <div 
      className={className} 
      style={{ position: 'relative', cursor: 'pointer', userSelect: 'none', outline: 'none', display: 'inline-block' }}
      tabIndex={0}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={() => setTimeout(() => setIsOpen(false), 150)}
    >
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', background: `linear-gradient(135deg, ${currentOption.color}15, rgba(0,0,0,0.6))`, borderRadius: '8px', border: `1px solid ${currentOption.color}50`, color: currentOption.color, fontWeight: '800', fontSize: '11px', minWidth: '120px', boxShadow: `0 4px 12px ${currentOption.color}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {currentOption.icon && <currentOption.icon size={14} />}
            {currentOption.label}
          </div>
          <ChevronDown size={14} color={currentOption.color} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.7 }} />
       </div>
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: '#111115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', zIndex: 100, width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
            {options.map(opt => {
              const Icon = opt.icon;
              return (
                <div 
                  key={opt.value} 
                  onClick={() => onChange(opt.value)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', fontSize: '11px', fontWeight: '800', color: opt.color, background: value === opt.value ? 'rgba(255,255,255,0.06)' : 'transparent', transition: 'all 0.2s' }} 
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.paddingLeft = '16px'; }} 
                  onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? 'rgba(255,255,255,0.06)' : 'transparent'; e.currentTarget.style.paddingLeft = '12px'; }}
                >
                  {Icon && <Icon size={14} />}
                  {opt.label}
                </div>
              )
            })}
         </div>
       )}
    </div>
  )
}

const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const displayValue = options.find(o => o.value === value)?.label || value || placeholder;

  return (
    <div 
      className={className} 
      style={{ position: 'relative', cursor: 'pointer', userSelect: 'none', outline: 'none', display: 'inline-block', minWidth: '130px' }}
      tabIndex={0}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={() => setTimeout(() => setIsOpen(false), 150)}
    >
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
          <span>{displayValue}</span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
       </div>
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: '#111115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflowY: 'auto', maxHeight: '180px', zIndex: 100, width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            {options.map(opt => (
              <div 
                key={opt.value} 
                onClick={() => onChange(opt.value)} 
                style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '500', color: '#fff', background: value === opt.value ? 'rgba(255,255,255,0.06)' : 'transparent', transition: 'all 0.2s' }} 
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.paddingLeft = '16px'; }} 
                onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? 'rgba(255,255,255,0.06)' : 'transparent'; e.currentTarget.style.paddingLeft = '12px'; }}
              >
                {opt.label}
              </div>
            ))}
         </div>
       )}
    </div>
  )
}

export default function SettingsModal({ onClose }) {
  const roles = useStore(s => s.roles)
  const roleDetails = useStore(s => s.roleDetails)
  const tree = useStore(s => s.tree)
  const updateRole = useStore(s => s.updateRole)
  const addRole = useStore(s => s.addRole)
  const deleteRole = useStore(s => s.deleteRole)
  const updateRoleDetails = useStore(s => s.updateRoleDetails)
  const updateNodeDetails = useStore(s => s.updateNodeDetails)
  const kickNode = useStore(s => s.kickNode)
  const restoreNode = useStore(s => s.restoreNode)
  const archivedAdmins = useStore(s => s.archivedAdmins || [])
  const moveMultipleNodes = useStore(s => s.moveMultipleNodes)
  const vacantName = useStore(s => s.vacantName)
  const vacantAvatar = useStore(s => s.vacantAvatar)
  const setVacantPrefs = useStore(s => s.setVacantPrefs)
  const recoverLostAdmins = useStore(s => s.recoverLostAdmins)
  const loadPreset = useStore(s => s.loadPreset)

  const [presets, setPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wildfire_presets')) || [] } catch { return [] }
  })
  const [newPresetName, setNewPresetName] = useState('')

  const [activeTab, setActiveTab] = useState('ADMINS')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRole, setEditingRole] = useState(null)
  const [editRoleResps, setEditRoleResps] = useState('')
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Edit form state — fully React-controlled (no document.getElementById)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editRoleId, setEditRoleId] = useState('')
  const [editManagerId, setEditManagerId] = useState('')
  const [editResps, setEditResps] = useState('')
  const [editHistory, setEditHistory] = useState([])
  const [selectedAdmins, setSelectedAdmins] = useState([])
  const [bulkManagerId, setBulkManagerId] = useState('')

  // New history log form state — React controlled
  const [newHistAction, setNewHistAction] = useState('Promoted')
  const [newHistRole, setNewHistRole] = useState('')
  const [newHistDate, setNewHistDate] = useState(() => new Date().toISOString().split('T')[0])
  const globalLog = useStore(s => s.globalLog || [])
  
  // Find the last real admin who made an action in the global log
  const lastRealAdmin = React.useMemo(() => {
    const log = globalLog.find(l => l.by && l.by.toUpperCase() !== 'CONSOLE')
    return log ? log.by : null
  }, [globalLog])

  const adminName = useStore(s => s.adminName)
  const [newHistBy, setNewHistBy] = useState(() => {
    try {
      const saved = localStorage.getItem('wildfire_last_admin_by')
      if (saved) return saved
    } catch {}
    return lastRealAdmin || (adminName !== 'Console' ? adminName : null) || 'Console'
  })
  const [newHistReason, setNewHistReason] = useState('')



  // New Group state
  const [newRoleTitle, setNewRoleTitle] = useState('New Group')
  const [newRoleColor, setNewRoleColor] = useState('#8b5cf6')
  const [newRoleRank, setNewRoleRank] = useState(10)
  const [newRoleSlots, setNewRoleSlots] = useState('')
  const [newRoleResps, setNewRoleResps] = useState('')
  
  // Responsibilities Panel State
  const [respSelectedRole, setRespSelectedRole] = useState('')
  const [newRespInput, setNewRespInput] = useState('')
  const [newRespDetailInput, setNewRespDetailInput] = useState('')

  // Sync default respSelectedRole
  useEffect(() => {
    if (roles.length > 0 && !respSelectedRole) {
      setRespSelectedRole(roles[0].id)
    }
  }, [roles, respSelectedRole])

  // Preferences State
  const [prefVacantName, setPrefVacantName] = useState(vacantName || 'Poziție Liberă')
  const [prefVacantAvatar, setPrefVacantAvatar] = useState(vacantAvatar || '')
  const [assigningVacantId, setAssigningVacantId] = useState(null)
  const [assignPickSteam, setAssignPickSteam] = useState('')
  const [assignPickName, setAssignPickName] = useState('')
  const [assignPickAvatar, setAssignPickAvatar] = useState('')
  const [assignPickExistingId, setAssignPickExistingId] = useState('')
  const [autoVacantEnabled, setAutoVacantEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wildfire_auto_vacant') || 'false') } catch { return false }
  })

  // Computed stats
  const allMembers = useMemo(() => {
    if (!tree) return []
    return flattenNodes(tree)
  }, [tree])

  const activeMembers = allMembers
    .filter(m => !m.vacant && m.id !== 'vacant')
    .sort((a, b) => {
      const rankA = roles.find(r => r.id === a.roleId)?.rank ?? 999
      const rankB = roles.find(r => r.id === b.roleId)?.rank ?? 999
      return rankA - rankB
    })

  const vacantCount = allMembers.filter(m => m.vacant).length

  const supervizorRank = roles.find(r => r.id === 'supervizor')?.rank || 5
  const eligibleAdmins = activeMembers.filter(m => {
    const r = roles.find(role => role.id === m.roleId)
    return r && r.rank <= supervizorRank
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wildfire_last_admin_by')
      if (saved) {
        setNewHistBy(saved)
      } else if (lastRealAdmin) {
        setNewHistBy(lastRealAdmin)
      } else if (adminName && adminName !== 'Console') {
        setNewHistBy(adminName)
      } else if (eligibleAdmins.length > 0) {
        setNewHistBy(eligibleAdmins[0].name)
      }
    } catch {}
  }, [adminName, lastRealAdmin, eligibleAdmins])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Initialize newHistRole when roles change
  useEffect(() => {
    if (roles.length > 0 && !newHistRole) {
      const helperRole = roles.find(r => r.id === 'helper' || r.title === 'Helper')
      setNewHistRole(helperRole ? helperRole.title : roles[0].title)
    }
  }, [roles, newHistRole])

  const validLogs = globalLog.filter(log => 
    log.message.startsWith('Promoted') || 
    log.message.startsWith('Demoted') || 
    log.message.startsWith('Removed')
  );

  const TABS = [
    { id: 'ADMINS', label: 'ADMINS', icon: Users, count: activeMembers.length },
    { id: 'GROUPS', label: 'GROUPS', icon: Shield, count: roles.length },
    { id: 'RESPONSIBILITIES', label: 'ATRIBUȚII', icon: Edit3, count: roleDetails.reduce((acc, r) => acc + (r.responsibilities?.length || 0), 0) },
    { id: 'ARCHIVE', label: 'ARHIVĂ', icon: Archive, count: archivedAdmins.length },
    { id: 'PREFS', label: 'PREFERINȚE', icon: Settings, count: 0 },
    { id: 'BACKUPS', label: 'BACKUPS', icon: Save, count: presets.length },
    { id: 'LOGS', label: 'GLOBAL LOGS', icon: AlertTriangle, count: validLogs.length }
  ]

  const filteredMembers = activeMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredRoles = roles.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateRole = (id, field, val) => {
    if (field === 'maxSlots') val = val === '' ? null : parseInt(val, 10)
    if (field === 'rank') val = parseInt(val, 10) || 0
    updateRole(id, { [field]: val })
  }

  const handleAddRole = () => {
    setEditingRole('NEW')
    setNewRoleTitle('New Group')
    setNewRoleColor('#8b5cf6')
    setNewRoleRank(roles.length + 1)
    setNewRoleSlots('')
    setNewRoleResps('')
    setActiveTab('GROUPS')
  }

  const handleAddAdmin = () => {
    const helperRole = roles.find(r => r.id === 'helper') || roles[roles.length - 1]
    
    setEditingAdmin('NEW')
    setEditName('')
    setEditAvatar('')
    setEditRoleId(helperRole?.id || '')
    
    const moderators = activeMembers.filter(m => m.roleId === 'moderator' && !m.vacant)
    let randomManagerId = ''
    if (moderators.length > 0) {
      randomManagerId = moderators[Math.floor(Math.random() * moderators.length)].id
    }
    setEditManagerId(randomManagerId)
    
    const initialResps = roleDetails.find(rd => rd.id === (helperRole?.id || ''))?.responsibilities || []
    setEditResps(initialResps.map(rd => rd.title || rd).join('\n'))
    setEditHistory([])
    setActiveTab('ADMINS')
  }

  const handleDeleteRole = (id) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteRole(confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const openEditAdmin = (m) => {
    setEditingAdmin(m.id)
    setEditName(m.name || '')
    setEditAvatar(m.avatarUrl || '')
    
    // Default to NO ACTION to prevent accidental promotions
    setNewHistAction('')
    setNewHistRole('')
    setEditRoleId(m.roleId || '')
    
    let initialResps = m.responsibilities
    if (!initialResps || initialResps.length === 0) {
      const defs = roleDetails.find(rd => rd.id === (m.roleId || ''))?.responsibilities || []
      initialResps = defs.map(rd => rd.title || rd)
    }
    setEditResps(initialResps.join('\n'))
    
    // Pre-select current parent
    const parentNode = findParent(useStore.getState().tree, m.id)
    setEditManagerId(parentNode ? parentNode.id : '')
    setEditHistory(m.history ? [...m.history] : [])
  }

  const handleApplyAndSave = (m) => {
    if (!newHistDate) return
    
    const fromRoleName = roles.find(r => r.id === m.roleId)?.title || 'Unknown'
    const newLog = {
      action: newHistAction,
      fromRole: fromRoleName,
      toRole: newHistRole || roles[0]?.title || '',
      date: new Date(newHistDate).toISOString(),
      by: newHistBy || 'Console',
      reason: newHistReason.trim(),
      _isNew: true
    }
    
    const updatedHistory = [...editHistory, newLog]
    setEditHistory(updatedHistory)
    
    let nextRoleId = editRoleId
    let nextResps = editResps
    
    if (newHistAction === 'Promoted' || newHistAction === 'Demoted') {
      const matchedRole = roles.find(r => r.title === newHistRole)
      if (matchedRole) {
        nextRoleId = matchedRole.id
        setEditRoleId(nextRoleId)
        
        const defs = roleDetails.find(rd => rd.id === matchedRole.id)?.responsibilities || []
        nextResps = defs.map(rd => rd.title || rd).join('\n')
        setEditResps(nextResps)
      }
    }
    
    setNewHistReason('')
    handleSaveAdmin(m, { history: updatedHistory, roleId: nextRoleId, resps: nextResps })
  }

  const handleUpdateHistEntry = (i, field, val) => {
    setEditHistory(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: val }
      return next
    })
  }

  const handleRemoveHistEntry = (i) => {
    setEditHistory(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSaveAdmin = (m, overrides = {}) => {
    let currentEditHistory = overrides.history ? [...overrides.history] : [...editHistory]
    let finalRoleId = overrides.roleId !== undefined ? overrides.roleId : editRoleId
    let finalResps = overrides.resps !== undefined ? overrides.resps : editResps

    // Auto-commit pending history if user forgot to click '+ Add' but typed a reason
    if (!overrides.history && newHistReason.trim() !== '') {
      const fromRoleName = roles.find(r => r.id === m.roleId)?.title || 'Unknown'
      currentEditHistory.push({
        action: newHistAction,
        fromRole: fromRoleName,
        toRole: newHistRole || roles[0]?.title || '',
        date: new Date(newHistDate).toISOString(),
        by: newHistBy || 'Console',
        reason: newHistReason.trim(),
        _isNew: true
      })
    }

    // Auto-generate initial history log for new admins if none provided
    if (m.id === 'NEW' && currentEditHistory.length === 0) {
      currentEditHistory.push({
        action: 'Promoted',
        fromRole: 'Player',
        toRole: roles.find(r => r.id === finalRoleId)?.title || 'Staff',
        date: new Date().toISOString(),
        by: newHistBy || 'Console',
        reason: 'Initial staff assignment',
        _isNew: true
      })
    }

    // Strip _isNew from the history entries we save to the node
    const finalHistory = currentEditHistory.map(h => {
      const { _isNew, ...rest } = h
      return rest
    })

    if (m.id === 'NEW') {
      const newId = `node-${Date.now()}`
      const newAdmin = {
        id: newId,
        name: editName || 'New Admin',
        roleId: finalRoleId,
        role: roles.find(r => r.id === finalRoleId)?.title || 'No Role',
        avatarUrl: editAvatar,
        vacant: false,
        responsibilities: finalResps.split('\n').map(x => x.trim()).filter(Boolean),
        history: finalHistory,
        children: []
      }
      const targetVacant = allMembers.find(v => v.vacant && v.id === editManagerId)
      if (targetVacant) {
        // Replace the vacant node directly, inheriting its children
        const inheritedChildren = [...(targetVacant.children || []), ...newAdmin.children]
        const finalNode = { ...newAdmin, children: inheritedChildren }
        function replaceVacant(node) {
          if (node.id === targetVacant.id) return finalNode
          if (!node.children) return node
          return { ...node, children: node.children.map(replaceVacant) }
        }
        useStore.setState({ tree: replaceVacant(useStore.getState().tree) })
      } else {
        useStore.getState().addNode(editManagerId || tree.id, newAdmin)
      }
    } else {
      useStore.getState().updateNodeDetails(m.id, {
        name: editName,
        avatarUrl: editAvatar,
        roleId: finalRoleId,
        responsibilities: finalResps.split('\n').map(x => x.trim()).filter(Boolean),
        history: finalHistory
      })

      const currentParent = findParent(tree, m.id)
      if (editManagerId && (!currentParent || currentParent.id !== editManagerId)) {
        useStore.getState().moveNode(m.id, editManagerId)
      }
    }

    // Sync newly added history entries to the global log
    const newlyAdded = currentEditHistory.filter(h => h._isNew)
    newlyAdded.forEach(h => {
      const msg = `${h.action} member ${editName || 'New Admin'} to ${h.toRole}${h.reason ? ` - Reason: ${h.reason}` : ''}`
      useStore.getState().addGlobalLog(msg, editAvatar, h.by)
    })

    setEditingAdmin(null)
  }

  const handleKickAdmin = async (id) => {
    const result = await useStore.getState().requestPrompt("Remove Member", "Reason for removal (optional):", { isAction: true });
    if (result !== null) {
      const reasonText = typeof result === 'string' ? result : result.reason;
      const adminName = result.adminName;
      const date = result.date;
      kickNode(id, reasonText, adminName, date);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dashboard} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <div className={styles.panelHeaderIcon}><Hexagon size={16} /></div>
            <div>
              <h2>Server Management</h2>
              <p>OWNER CONTROL PANEL</p>
            </div>
          </div>
          <button className={styles.ownerBtn}>
            <Crown size={12} color="#FF6B00" /> Owner
          </button>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        {/* Stat Cards */}
        <div className={styles.statCards}>
          <div className={styles.statCard} style={{ '--card-color': '#FF6B00' }}>
            <div className={styles.statIcon}><Users size={18} /></div>
            <div className={styles.statNum}>{activeMembers.length}</div>
            <div className={styles.statLabel}>ADMINS</div>
          </div>
          <div className={styles.statCard} style={{ '--card-color': '#8B5CF6' }}>
            <div className={styles.statIcon}><Shield size={18} /></div>
            <div className={styles.statNum}>{roles.length}</div>
            <div className={styles.statLabel}>GROUPS</div>
          </div>

          <div className={styles.statCard} style={{ '--card-color': '#EF4444' }}>
            <div className={styles.statIcon}><AlertTriangle size={18} /></div>
            <div className={styles.statNum}>{vacantCount}</div>
            <div className={styles.statLabel}>VACANT SLOTS</div>
          </div>
          <div className={styles.statCard} style={{ '--card-color': '#10B981' }}>
            <div className={styles.statIcon}><Hexagon size={18} /></div>
            <div className={styles.statNum}>1</div>
            <div className={styles.statLabel}>SERVERS</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsBar}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <span className={styles.tabBadge}>{tab.count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} color="rgba(255,255,255,0.2)" />
            <input
              type="text"
              placeholder="Search by name or Steam ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === 'ADMINS' ? (
            <button className={styles.addBtn} onClick={handleAddAdmin}>
              <Plus size={16} strokeWidth={3} /> Add Admin
            </button>
          ) : (
            <button className={styles.addBtn} onClick={handleAddRole}>
              <Plus size={16} strokeWidth={3} /> New Group
            </button>
          )}
        </div>

        {/* Confirm Delete Modal */}
        {confirmDeleteId && (
          <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
            <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
              <AlertTriangle size={28} color="#f87171" />
              <div className={styles.confirmTitle}>Delete Group?</div>
              <div className={styles.confirmDesc}>
                This will permanently delete the group and all its configuration.
                Members will remain but lose their group association.
              </div>
              <div className={styles.confirmBtns}>
                <button className={styles.confirmCancel} onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </button>
                <button className={styles.confirmDelete} onClick={confirmDelete}>
                  <Trash2 size={14} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scroll Area */}
        <div className={styles.scrollArea}>

          {/* ADMINS TAB */}
          {activeTab === 'ADMINS' && (
            <div className={styles.adminList}>
              
              {/* BULK MOVE UI */}
              {selectedAdmins.length > 0 && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{selectedAdmins.length} selected</span>
                    <button 
                      onClick={() => setSelectedAdmins([])}
                      style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                    >Clear</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={bulkManagerId} 
                      onChange={e => setBulkManagerId(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px 8px', fontSize: '13px' }}
                    >
                      <option value="">-- Select Manager --</option>
                      {activeMembers.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (!bulkManagerId) return alert('Select a manager first!');
                        moveMultipleNodes(selectedAdmins, bulkManagerId);
                        setSelectedAdmins([]);
                        setBulkManagerId('');
                        alert('Members successfully moved!');
                      }}
                      style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >Move to Manager</button>
                  </div>
                </div>
              )}

              {(() => {
                const displayMembers = editingAdmin === 'NEW'
                  ? [{ id: 'NEW', name: editName || 'New Admin', roleId: editRoleId, avatarUrl: editAvatar, history: editHistory }, ...filteredMembers]
                  : filteredMembers;

                return displayMembers.map(m => {
                  const isEditingAdmin = editingAdmin === m.id
                  const role = roles.find(r => r.id === (isEditingAdmin ? editRoleId : m.roleId))
                const steamIdMatch = m.steamLink?.match(/\/profiles\/(\d+)/) || m.steamLink?.match(/\/id\/([^/]+)/)
                const steamId = steamIdMatch ? steamIdMatch[1] : null

                return (
                  <div key={m.id} className={`${styles.adminRowWrapper} ${isEditingAdmin ? styles.adminRowExpanded : ''}`}>
                    <div className={styles.adminRow}>
                      
                      {m.id !== 'NEW' && (
                        <input 
                          type="checkbox" 
                          checked={selectedAdmins.includes(m.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedAdmins(prev => [...prev, m.id]);
                            else setSelectedAdmins(prev => prev.filter(id => id !== m.id));
                          }}
                          style={{ marginRight: '12px', cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      )}

                      <div className={styles.adminAvatar}>
                        {m.avatarUrl
                          ? <img src={m.avatarUrl} alt={m.name} />
                          : <span>{m.name.charAt(0)}</span>
                        }
                      </div>

                      <div className={styles.adminInfoCol}>
                        <div className={styles.adminNameRow}>
                          <span className={styles.adminName}>{m.name}</span>
                          {steamId && <span className={styles.adminSteamId}>{steamId}</span>}
                        </div>
                        <div className={styles.adminBadges}>
                          <div
                            className={styles.roleBadge}
                            style={{ color: role?.color || '#fff', borderColor: role?.color || 'rgba(255,255,255,0.2)' }}
                          >
                            {role?.title || 'No Role'}
                          </div>
                        </div>
                      </div>

                      <div className={styles.rowActions}>
                        {m.id !== 'NEW' && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${isEditingAdmin ? styles.actionBtnActive : ''}`}
                              onClick={() => isEditingAdmin ? setEditingAdmin(null) : openEditAdmin(m)}
                              title="Edit member"
                            >
                              <Edit3 size={14} color={isEditingAdmin ? '#FF6B00' : '#3B82F6'} />
                            </button>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleKickAdmin(m.id)}
                              title="Remove member"
                            >
                              <Trash2 size={14} color="#EF4444" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditingAdmin && (
                      <div className={styles.inlineEditPanel}>
                        <div className={styles.editRow}>
                          <div className={styles.editField}>
                            <label>USERNAME</label>
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                          </div>
                          <div className={styles.editField}>
                            <label>AVATAR URL</label>
                            <input type="text" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} />
                          </div>
                          <div className={styles.editField}>
                            <label>MANAGER / VACANT SLOT</label>
                            <select value={editManagerId} onChange={e => setEditManagerId(e.target.value)}>
                              {m.id === 'NEW' && <option value="">-- Default (Root) --</option>}
                              <optgroup label="── Staff Members ──">
                                {activeMembers.filter(n => n.id !== m.id && flattenNodes(m).every(desc => desc.id !== n.id)).map(n => {
                                  const nRole = roles.find(r => r.id === n.roleId);
                                  return <option key={n.id} value={n.id}>{n.name} ({nRole?.title || n.roleId})</option>
                                })}
                              </optgroup>
                              {allMembers.filter(v => v.vacant).length > 0 && (
                                <optgroup label="── Vacant Positions (will replace) ──">
                                  {allMembers.filter(v => v.vacant).map(v => {
                                    const vRole = roles.find(r => r.id === v.roleId);
                                    const childCount = (v.children || []).length;
                                    return (
                                      <option key={v.id} value={v.id}>
                                        {v.name} [{vRole?.title || v.roleId}]{childCount > 0 ? ` · ${childCount} subordinates` : ''}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              )}
                            </select>
                            {editManagerId && allMembers.find(v => v.vacant && v.id === editManagerId) && (
                              <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '4px', fontSize: '11px', color: '#A5B4FC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={14} color="#A5B4FC" />
                                <span>This admin will <strong>replace</strong> the vacant slot and inherit its {(allMembers.find(v => v.id === editManagerId)?.children || []).length} subordinates.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={styles.editFieldBlock}>
                          <label>GROUPS</label>
                          <div className={styles.groupsList}>
                            {roles.map(r => (
                              <button
                                key={r.id}
                                className={`${styles.groupPill} ${editRoleId === r.id ? styles.groupPillActive : ''}`}
                                style={editRoleId === r.id ? { borderColor: r.color, color: r.color } : {}}
                                onClick={() => {
                                  const oldRoleObj = roles.find(r => r.id === editRoleId);
                                  const newRoleObj = r;
                                  if (oldRoleObj && newRoleObj && oldRoleObj.id !== newRoleObj.id) {
                                    const oldRank = oldRoleObj.rank || 999;
                                    const newRank = newRoleObj.rank || 999;
                                    const sortedUniqueRanks = [...new Set(roles.map(r => r.rank))].sort((a, b) => b - a); // 10, 8, 5, 1
                                    const oldIndex = sortedUniqueRanks.indexOf(oldRank);
                                    const newIndex = sortedUniqueRanks.indexOf(newRank);
                                    
                                    if (newIndex > oldIndex) {
                                      setNewHistAction('Promoted');
                                    } else if (newIndex < oldIndex) {
                                      setNewHistAction('Demoted');
                                    } else {
                                      setNewHistAction('Promoted'); // fallback
                                    }
                                    
                                    setNewHistRole(newRoleObj.title);
                                  }
                                  
                                  setEditRoleId(r.id)
                                  const defs = roleDetails.find(rd => rd.id === r.id)?.responsibilities || []
                                  setEditResps(defs.map(rd => rd.title || rd).join('\n'))
                                }}
                              >
                                {r.title}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={styles.editFieldBlock}>
                          <label>ATTRIBUTES &amp; RESPONSIBILITIES</label>
                          <div className={styles.respsBox}>
                            {(() => {
                              const defaultResps = roleDetails.find(r => r.id === editRoleId)?.responsibilities || []
                              const currentRespsArray = editResps ? editResps.split('\n').filter(r => r.trim() !== '') : []
                              const customResps = currentRespsArray
                                .filter(title => !defaultResps.some(r => r.title === title))
                                .map(title => ({ title, isCustom: true }))
                              const allResps = [...defaultResps, ...customResps]

                              if (allResps.length === 0) {
                                return <span className={styles.emptyResps}>No responsibilities for this role.</span>
                              }
                              return allResps.map((resp, idx) => {
                                const isChecked = currentRespsArray.includes(resp.title)
                                return (
                                  <label key={idx} className={`${styles.respCheck} ${resp.isCustom ? styles.respCheckCustom : ''}`}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let newArr = [...currentRespsArray]
                                        if (e.target.checked) {
                                          if (!newArr.includes(resp.title)) newArr.push(resp.title)
                                        } else {
                                          newArr = newArr.filter(r => r !== resp.title)
                                        }
                                        setEditResps(newArr.join('\n'))
                                      }}
                                    />
                                    <span>{resp.title}{resp.isCustom && <em className={styles.customTag}> custom</em>}</span>
                                  </label>
                                )
                              })
                            })()}
                          </div>
                        </div>

                        {/* PROMOTE / DEMOTE ACTION */}
                        <div className={styles.editFieldBlock} style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(0,0,0,0.5))', padding: '16px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.1)' }}>
                          <label style={{ color: '#22c55e', fontSize: '11px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowUp size={14} /> PROMOTE / DEMOTE MEMBER
                          </label>
                          <div className={styles.addHistRow} style={{ borderTop: 'none', paddingTop: 0 }}>
                            <div className={styles.addHistInputs}>
                              <ActionDropdown 
                                value={newHistAction} 
                                onChange={val => {
                                  setNewHistAction(val)
                                  if (val === 'Promoted' || val === 'Demoted') {
                                    const sortedRoles = [...roles].sort((a, b) => a.rank - b.rank);
                                    const currentIndex = sortedRoles.findIndex(r => r.id === (m.roleId || editRoleId));
                                    if (currentIndex !== -1) {
                                      let targetIndex = val === 'Promoted' ? currentIndex - 1 : currentIndex + 1;
                                      if (targetIndex < 0) targetIndex = 0;
                                      if (targetIndex >= sortedRoles.length) targetIndex = sortedRoles.length - 1;
                                      const targetRole = sortedRoles[targetIndex];
                                      if (targetRole) {
                                        setNewHistRole(targetRole.title);
                                        setEditRoleId(targetRole.id);
                                        const defs = roleDetails.find(rd => rd.id === targetRole.id)?.responsibilities || [];
                                        setEditResps(defs.map(rd => rd.title || rd).join('\n'));
                                      }
                                    }
                                  }
                                }} 
                              />
                              <CustomSelect 
                                value={newHistRole} 
                                onChange={val => {
                                  setNewHistRole(val);
                                  if (['Promoted', 'Demoted'].includes(newHistAction)) {
                                    const matchedRole = roles.find(r => r.title === val);
                                    if (matchedRole) {
                                      setEditRoleId(matchedRole.id);
                                      const defs = roleDetails.find(rd => rd.id === matchedRole.id)?.responsibilities || [];
                                      setEditResps(defs.map(rd => rd.title || rd).join('\n'));
                                    }
                                  }
                                }} 
                                options={roles.map(r => ({ value: r.title, label: r.title }))}
                              />
                              <input
                                type="date"
                                value={newHistDate}
                                onChange={e => setNewHistDate(e.target.value)}
                                className={styles.histInputSm}
                              />
                              <CustomSelect 
                                value={newHistBy} 
                                onChange={val => {
                                  setNewHistBy(val)
                                  try { localStorage.setItem('wildfire_last_admin_by', val) } catch {}
                                }} 
                                options={[{ value: 'Console', label: 'Console' }, ...eligibleAdmins.map(admin => ({ value: admin.name, label: admin.name }))]}
                              />
                            </div>
                            <div className={styles.addHistReasonRow} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Reason for change (optional)..."
                                value={newHistReason}
                                onChange={e => setNewHistReason(e.target.value)}
                                className={styles.histReasonInput}
                                style={{ flex: 1, padding: '8px 12px' }}
                              />
                              <button 
                                className={styles.addHistBtn} 
                                onClick={() => handleApplyAndSave(m)} 
                                disabled={!newHistAction}
                                style={{ 
                                  background: '#22c55e', 
                                  color: '#000', 
                                  fontWeight: 'bold', 
                                  border: 'none', 
                                  padding: '8px 16px', 
                                  borderRadius: '6px',
                                  opacity: !newHistAction ? 0.4 : 1,
                                  cursor: !newHistAction ? 'not-allowed' : 'pointer',
                                  filter: !newHistAction ? 'grayscale(1)' : 'none'
                                }}
                              >
                                <Plus size={14} /> Apply & Save
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* History Logs — fully React state controlled */}
                        <div className={styles.editFieldBlock}>
                          <label>PAST HISTORY LOGS</label>
                          <div className={styles.historyBox}>
                            {editHistory.length > 0 ? (
                              editHistory.map((h, i) => (
                                <div key={i} className={styles.histEntry}>
                                  <div className={styles.histEntryRow}>
                                    <ActionDropdown 
                                      value={h.action}
                                      onChange={val => handleUpdateHistEntry(i, 'action', val)}
                                    />
                                    <span className={styles.histTo}>To:</span>
                                    <CustomSelect
                                      value={h.toRole}
                                      onChange={val => handleUpdateHistEntry(i, 'toRole', val)}
                                      options={roles.map(r => ({ value: r.title, label: r.title }))}
                                    />
                                    <input
                                      type="date"
                                      value={h.date ? h.date.split('T')[0] : ''}
                                      onChange={e => {
                                        if (!e.target.value) return
                                        handleUpdateHistEntry(i, 'date', new Date(e.target.value).toISOString())
                                      }}
                                      className={styles.histDate}
                                    />
                                    <span className={styles.histBy}>by</span>
                                    <CustomSelect
                                      value={h.by || 'Console'}
                                      onChange={val => handleUpdateHistEntry(i, 'by', val)}
                                      options={[{ value: 'Console', label: 'Console' }, ...eligibleAdmins.map(admin => ({ value: admin.name, label: admin.name }))]}
                                    />
                                    <button
                                      className={styles.histDeleteBtn}
                                      onClick={() => handleRemoveHistEntry(i)}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Reason..."
                                    value={h.reason || ''}
                                    onChange={e => handleUpdateHistEntry(i, 'reason', e.target.value)}
                                    className={styles.histReasonInput}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className={styles.noHistory}>No history logs found.</div>
                            )}
                          </div>
                        </div>

                        <div className={styles.editFooter}>
                          <button className={styles.cancelBtn} onClick={() => setEditingAdmin(null)}>Cancel</button>
                          <button className={styles.updateBtn} onClick={() => handleSaveAdmin(m)}>
                            <Save size={14} /> {m.id === 'NEW' ? 'Create' : 'Update'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })})()}
            </div>
          )}

          {/* GROUPS TAB */}
          {activeTab === 'GROUPS' && (
            <div className={styles.rolesList}>
              {(() => {
                const sortedRoles = [...filteredRoles].sort((a, b) => a.rank - b.rank)
                const displayRoles = editingRole === 'NEW'
                  ? [{ id: 'NEW', title: newRoleTitle, color: newRoleColor, rank: newRoleRank, maxSlots: newRoleSlots === '' ? null : parseInt(newRoleSlots, 10) }, ...sortedRoles]
                  : sortedRoles;

                return displayRoles.map(role => {
                  const roleMembers = activeMembers.filter(m => m.roleId === role.id)
                  const isEditing = editingRole === role.id

                return (
                  <div key={role.id} className={styles.adminRow} style={{ alignItems: 'center' }}>
                    <div className={styles.roleShield} style={{ borderColor: role.color }}>
                      <Shield size={14} color={role.color} />
                    </div>

                    {isEditing ? (
                      <div className={styles.editRowInline}>
                        <input
                          type="text"
                          value={role.title}
                          onChange={e => role.id === 'NEW' ? setNewRoleTitle(e.target.value) : handleUpdateRole(role.id, 'title', e.target.value)}
                          className={styles.inlineInput}
                        />
                        <input
                          type="color"
                          value={role.color}
                          onChange={e => role.id === 'NEW' ? setNewRoleColor(e.target.value) : handleUpdateRole(role.id, 'color', e.target.value)}
                          className={styles.inlineColor}
                          title="Role color"
                        />
                        <input
                          type="number"
                          value={role.rank}
                          onChange={e => role.id === 'NEW' ? setNewRoleRank(e.target.value) : handleUpdateRole(role.id, 'rank', e.target.value)}
                          placeholder="Rank"
                          className={styles.inlineInputSmall}
                        />
                        <input
                          type="number"
                          value={role.maxSlots === null ? '' : role.maxSlots}
                          onChange={e => role.id === 'NEW' ? setNewRoleSlots(e.target.value) : handleUpdateRole(role.id, 'maxSlots', e.target.value)}
                          placeholder="Slots"
                          className={styles.inlineInputSmall}
                        />
                        <button onClick={() => {
                          if (role.id === 'NEW') {
                            addRole({ title: newRoleTitle, color: newRoleColor, glow: `${newRoleColor}80`, rank: parseInt(newRoleRank, 10) || 10, maxSlots: newRoleSlots === '' ? null : parseInt(newRoleSlots, 10) })
                          }
                          setEditingRole(null)
                        }} className={styles.saveInlineBtn}>
                          <Save size={14} />
                        </button>
                        {role.id === 'NEW' && (
                          <button onClick={() => setEditingRole(null)} className={styles.saveInlineBtn} style={{ background: 'rgba(255, 255, 255, 0.1)', marginLeft: '4px' }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className={styles.groupInfoCol}>
                        <div className={styles.adminNameRow}>
                          <span className={styles.adminName} style={{ color: role.color }}>{role.title}</span>
                          <span className={styles.adminSteamId}>Rank: {role.rank}</span>
                        </div>
                        <div className={styles.adminBadges}>
                          <span className={styles.memberCountText}>
                            {roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={styles.rowActions}>
                      {!isEditing && role.id !== 'NEW' && (
                        <button className={styles.actionBtn} onClick={() => setEditingRole(role.id)} title="Edit group">
                          <Edit3 size={14} color="#3B82F6" />
                        </button>
                      )}
                      {!isEditing && role.id !== 'NEW' && (
                        <button className={styles.actionBtn} onClick={() => handleDeleteRole(role.id)} title="Delete group">
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })})()}
            </div>
          )}

          {/* RESPONSIBILITIES TAB */}
          {activeTab === 'RESPONSIBILITIES' && (
            <div className={styles.rolesList}>
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 'bold' }}>SELECT GROUP:</label>
                  <select
                    value={respSelectedRole}
                    onChange={e => setRespSelectedRole(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      flex: 1
                    }}
                  >
                    {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>

                {(() => {
                  const currentRoleDetails = roleDetails.find(r => r.id === respSelectedRole)
                  const currentResps = currentRoleDetails?.responsibilities || []
                  
                  return (
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ marginBottom: '16px', fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>
                        Default Responsibilities ({currentResps.length})
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentResps.length === 0 ? (
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', padding: '8px 0' }}>No responsibilities assigned to this group yet.</div>
                        ) : (
                          currentResps.map((resp, idx) => {
                            const title = typeof resp === 'string' ? resp : resp.title
                            const detail = typeof resp === 'object' ? resp.detail : null
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, fontSize: '13px', color: '#ddd', fontWeight: 'bold' }}>{title}</div>
                                  <button
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.8 }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                                    onClick={() => {
                                      const next = currentResps.filter((_, i) => i !== idx)
                                      updateRoleDetails(respSelectedRole, { responsibilities: next })
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                {detail && (
                                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', paddingLeft: '4px' }}>
                                    {detail}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <label style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>ADD NEW RESPONSIBILITY</label>
                        <input
                          type="text"
                          value={newRespInput}
                          onChange={e => setNewRespInput(e.target.value)}
                          placeholder="Title (e.g. Manage Staff)..."
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            width: '100%',
                            fontSize: '13px'
                          }}
                        />
                        <textarea
                          value={newRespDetailInput}
                          onChange={e => setNewRespDetailInput(e.target.value)}
                          placeholder="Details/Description (Optional)..."
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            width: '100%',
                            fontSize: '13px',
                            minHeight: '60px',
                            resize: 'vertical'
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newRespInput.trim()) {
                              updateRoleDetails(respSelectedRole, { 
                                responsibilities: [...currentResps, { title: newRespInput.trim(), detail: newRespDetailInput.trim() || null }] 
                              })
                              setNewRespInput('')
                              setNewRespDetailInput('')
                            }
                          }}
                          style={{
                            background: '#3B82F6',
                            border: 'none',
                            color: '#fff',
                            padding: '10px 16px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '4px'
                          }}
                        >
                          <Plus size={14} /> Add Responsibility
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* ARCHIVE TAB */}
          {activeTab === 'ARCHIVE' && (
            <div className={styles.rolesList}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px 16px' }}>
                <button
                  style={{
                    background: 'rgba(255, 50, 50, 0.1)',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                    color: 'rgba(255, 100, 100, 0.9)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete all archived admins?')) {
                      useStore.getState().clearArchive()
                    }
                  }}
                >
                  CLEAR ALL
                </button>
              </div>
              {archivedAdmins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  No archived admins.
                </div>
              ) : (
                archivedAdmins.map(admin => (
                  <div key={admin.id} className={styles.adminRow} style={{ alignItems: 'center', gap: '16px' }}>
                    {admin.avatarUrl ? (
                      <img src={admin.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                        {admin.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={styles.groupInfoCol}>
                      <div className={styles.adminNameRow}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{admin.name}</span>
                        <span className={styles.adminSteamId}>Deleted on {new Date(admin.archivedAt).toLocaleString()}</span>
                      </div>
                      <div className={styles.adminBadges}>
                        <span className={styles.memberCountText} style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Last Role: {admin.role}
                        </span>
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      <button 
                        className={styles.actionBtn} 
                        style={{ color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', width: 'auto', height: 'auto', gap: '6px' }}
                        onClick={() => {
                          if (window.confirm(`Restore ${admin.name} to the active staff tree?`)) {
                            restoreNode(admin.id)
                          }
                        }}
                      >
                        <RefreshCw size={14} /> Restore
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        style={{ color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', width: 'auto', height: 'auto', gap: '6px' }}
                        onClick={() => {
                          if (window.confirm(`Permanently delete ${admin.name} from the archive?`)) {
                            useStore.getState().deleteArchivedAdmin(admin.id)
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BACKUPS TAB */}
          {activeTab === 'BACKUPS' && (
            <div className={styles.rolesList} style={{ padding: '24px' }}>

              {/* ── EXPORT / IMPORT JSON ── */}
              <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ color: '#A5B4FC', fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Export / Import JSON
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '16px' }}>
                  Export your entire org chart as a JSON file. Import it anytime to perfectly restore everything — including histories, immunities, and Steam links.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    style={{
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: '#A5B4FC',
                      padding: '9px 18px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => {
                      const s = useStore.getState();
                      const exportData = {
                        exportedAt: new Date().toISOString(),
                        tree: s.tree,
                        roles: s.roles,
                        roleDetails: s.roleDetails,
                        archivedAdmins: s.archivedAdmins || [],
                        globalLog: s.globalLog || []
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `wildfire-org-chart-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Save size={14} /> Export JSON
                  </button>

                  <label style={{
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#6EE7B7',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <RefreshCw size={14} /> Import JSON
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const data = JSON.parse(ev.target.result);
                            if (!data.tree) { alert('Invalid file — missing tree data.'); return; }
                            if (window.confirm(`Import "${file.name}"? This will replace your current org chart.`)) {
                              useStore.getState().loadPreset(data);
                              alert('Import successful! Your org chart has been restored.');
                            }
                          } catch {
                            alert('Failed to parse JSON file. Make sure it was exported from this app.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ color: '#FCA5A5', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Data Recovery
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
                  If you lost administrators due to an old bug, use this tool to scan the original database and recover missing personnel. They will be spawned at the top of the tree.
                </p>
                <button
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    if (window.confirm('Click OK to recover all missing admins from the original database!')) {
                      recoverLostAdmins();
                      alert('Recovery complete! Check the top of the tree.');
                    }
                  }}
                >
                  <AlertTriangle size={14} /> Recover Missing Admins
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Save New Preset
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={e => setNewPresetName(e.target.value)}
                    placeholder="Preset Name (e.g. Backup Before Major Changes)"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      flex: 1
                    }}
                  />
                  <button
                    style={{
                      background: '#3B82F6',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (!newPresetName.trim()) return;
                      const s = useStore.getState();
                      const newPreset = {
                        id: Date.now().toString(),
                        name: newPresetName.trim(),
                        date: new Date().toISOString(),
                        tree: s.tree,
                        roles: s.roles,
                        roleDetails: s.roleDetails,
                        archivedAdmins: s.archivedAdmins,
                        globalLog: s.globalLog
                      };
                      const updated = [newPreset, ...presets];
                      setPresets(updated);
                      localStorage.setItem('wildfire_presets', JSON.stringify(updated));
                      setNewPresetName('');
                      alert('Preset saved!');
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '16px' }}>Saved Presets</h3>
              {presets.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginBottom: '24px' }}>No saved presets.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {presets.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{p.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                          Saved on {new Date(p.date).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: '#60A5FA',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to load preset "${p.name}"? This will overwrite your current active organization chart.`)) {
                              loadPreset(p);
                              alert('Preset loaded successfully!');
                            }
                          }}
                        >
                          Load
                        </button>
                        <button
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (window.confirm(`Delete preset "${p.name}" forever?`)) {
                              const updated = presets.filter(x => x.id !== p.id);
                              setPresets(updated);
                              localStorage.setItem('wildfire_presets', JSON.stringify(updated));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: '#FCA5A5', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Factory Reset
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
                  This will completely wipe your current configuration and restore the default database. Make sure to save a preset first!
                </p>
                <button
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={async () => {
                    if (window.confirm('WARNING: Are you absolutely sure you want to reset everything to default? All unsaved custom changes will be lost forever.')) {
                      await useStore.getState().reset();
                      alert('Tree reset to default successfully!');
                    }
                  }}
                >
                  <RefreshCw size={14} /> Reset Tree to Default
                </button>

                <button
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6EE7B7',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                  onClick={() => {
                    const MODS_AND_HELPERS = [
                      {
                        id: 'm12', name: 'r3ally', role: 'Moderator', roleId: 'moderator',
                        avatarUrl: 'https://avatars.fastly.steamstatic.com/1358a6f462ce93511842f9c3d067ec0e7662aab7_full.jpg',
                        steamLink: 'https://steamcommunity.com/profiles/76561199439185612',
                        joinDate: '2023-01-15', status: 'offline', immunity: 0, responsibilities: [],
                        history: [{ date: '2026-05-26T12:00:00Z', action: 'Promoted', toRole: 'Helper' }, { date: '2026-08-01T12:00:00Z', action: 'Promoted', toRole: 'Moderator' }],
                        children: []
                      },
                      {
                        id: 'm13', name: 'bounty', role: 'Moderator', roleId: 'moderator',
                        avatarUrl: 'https://avatars.fastly.steamstatic.com/d768ab6b9bdd99e15b6ac4ea0b6d7774b7fbf9be_full.jpg',
                        steamLink: 'https://steamcommunity.com/id/hennessyx1/',
                        joinDate: '2023-01-15', status: 'online', immunity: 0, responsibilities: [],
                        history: [{ date: '2026-07-01T12:00:00Z', action: 'Promoted', toRole: 'Helper' }, { date: '2026-08-01T12:00:00Z', action: 'Promoted', toRole: 'Moderator' }],
                        children: []
                      },
                      {
                        id: 'm11', name: 'LEGALE', role: 'Moderator', roleId: 'moderator',
                        avatarUrl: 'https://avatars.fastly.steamstatic.com/83961e4642c3e472cd20da37d1056664844db409_full.jpg',
                        steamLink: 'https://steamcommunity.com/id/LEGALEV2/',
                        joinDate: '2023-01-15', status: 'online', immunity: 0, responsibilities: [],
                        history: [{ date: '2026-06-12T12:00:00Z', action: 'Promoted', toRole: 'Helper' }, { date: '2026-07-01T12:00:00Z', action: 'Promoted', toRole: 'Moderator' }],
                        children: []
                      },
                      {
                        id: 'm14', name: 'V1ccX', role: 'Moderator', roleId: 'moderator',
                        avatarUrl: 'https://avatars.fastly.steamstatic.com/4963bca91b1b3edf88de548e459b2092a35312e7_full.jpg',
                        steamLink: 'https://steamcommunity.com/profiles/76561199698821208',
                        joinDate: '2023-01-15', status: 'offline', immunity: 0, responsibilities: [],
                        history: [{ date: '2026-06-30T12:00:00Z', action: 'Promoted', toRole: 'Helper' }, { date: '2026-08-01T12:00:00Z', action: 'Promoted', toRole: 'Moderator' }],
                        children: [
                          {
                            id: 'm17', name: 'dropYA-', role: 'Helper', roleId: 'helper',
                            avatarUrl: 'https://avatars.fastly.steamstatic.com/53a234baae33c23f1326d23d0699039d7cccfddf_full.jpg',
                            steamLink: 'https://steamcommunity.com/id/dropYA/',
                            joinDate: '2023-01-15', status: 'online', immunity: 0, responsibilities: [],
                            history: [{ date: '2026-07-31T12:00:00Z', action: 'Promoted', toRole: 'Helper' }],
                            children: []
                          },
                          {
                            id: 'm16', name: 'LcNneb', role: 'Helper', roleId: 'helper',
                            avatarUrl: 'https://avatars.fastly.steamstatic.com/c78e87c68a89fcdd6c895f2b6b13474085a9c5ab_full.jpg',
                            steamLink: 'https://steamcommunity.com/profiles/76561198711973791/',
                            joinDate: '2023-01-15', status: 'online', immunity: 0, responsibilities: [],
                            history: [{ date: '2026-06-07T12:00:00Z', action: 'Promoted', toRole: 'Helper' }],
                            children: []
                          },
                          {
                            id: 'm15', name: 'n3lutzU', role: 'Helper', roleId: 'helper',
                            avatarUrl: 'https://avatars.fastly.steamstatic.com/59e75dc27ff9c6a73ef242ac14dc4c3fc7001827_full.jpg',
                            steamLink: 'https://steamcommunity.com/profiles/76561199070188905',
                            joinDate: '2023-01-15', status: 'online', immunity: 0, responsibilities: [],
                            history: [{ date: '2026-06-28T12:00:00Z', action: 'Promoted', toRole: 'Helper' }],
                            children: []
                          }
                        ]
                      }
                    ];

                    // Find vacant admin node and inject all mods as its children
                    function injectIntoNode(node, targetId, newChildren) {
                      if (node.id === targetId || (node.vacant && node.roleId === 'administrator')) {
                        return { ...node, children: newChildren };
                      }
                      if (!node.children) return node;
                      return { ...node, children: node.children.map(c => injectIntoNode(c, targetId, newChildren)) };
                    }

                    const currentTree = useStore.getState().tree;
                    const newTree = injectIntoNode(currentTree, 'vacant-1785945580214', MODS_AND_HELPERS);
                    useStore.setState({ tree: newTree });
                    alert('Moderators & Helpers injected successfully!');
                  }}
                >
                  <Users size={14} /> Inject Mods &amp; Helpers Now
                </button>
              </div>
            </div>
          )}

          {/* PREFS TAB */}
          {activeTab === 'PREFS' && (
            <div className={`${styles.rolesList} ${styles.inlineEditPanel}`} style={{ padding: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '24px', fontSize: '14px' }}>Global Preferences</h3>
              
              <div className={styles.editFieldBlock}>
                <label>VACANT POSITION TEXT</label>
                <input
                  type="text"
                  value={prefVacantName}
                  onChange={e => setPrefVacantName(e.target.value)}
                  placeholder="e.g. Poziție Liberă"
                />
              </div>

              <div className={styles.editFieldBlock} style={{ marginTop: '20px' }}>
                <label>VACANT POSITION AVATAR URL (OPTIONAL)</label>
                <input
                  type="text"
                  value={prefVacantAvatar}
                  onChange={e => setPrefVacantAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                <button
                  className={styles.updateBtn}
                  onClick={() => {
                    setVacantPrefs(prefVacantName, prefVacantAvatar);
                    alert('Preferences saved successfully!');
                  }}
                >
                  <Save size={14} /> Save Preferences
                </button>
              </div>

              <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Active Vacant Positions <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{allMembers.filter(m => m.vacant).length}</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allMembers.filter(m => m.vacant).length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic' }}>No vacant positions active in the tree.</div>
                  ) : (
                    allMembers.filter(m => m.vacant).map(vacantNode => {
                      const roleTitle = roles.find(r => r.id === vacantNode.roleId)?.title || 'No Role'
                      const isAssigning = assigningVacantId === vacantNode.id
                      return (
                        <div key={vacantNode.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${isAssigning ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'}`, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {vacantNode.avatarUrl ? (
                                <img src={vacantNode.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Users size={16} color="rgba(255,255,255,0.5)" />
                                </div>
                              )}
                              <div>
                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{vacantNode.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{roleTitle.toUpperCase()} · {(vacantNode.children||[]).length} subordinates</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                style={{ background: isAssigning ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  if (isAssigning) { setAssigningVacantId(null); setAssignPickName(''); setAssignPickSteam(''); setAssignPickAvatar(''); }
                                  else { setAssigningVacantId(vacantNode.id); setAssignPickName(''); setAssignPickSteam(''); setAssignPickAvatar(''); }
                                }}
                              >
                                <Shield size={12} /> {isAssigning ? 'Cancel' : 'Assign Admin'}
                              </button>
                              <button
                                style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => { if (window.confirm(`Delete vacant ${roleTitle} position? Its ${(vacantNode.children||[]).length} subordinates will be hoisted up.`)) kickNode(vacantNode.id) }}
                                title="Delete Vacant Position"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Assign Admin Panel */}
                          {isAssigning && (
                            <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '10px' }}>Fill this position with a real person. Their subordinates will be inherited.</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select
                                  value={assignPickExistingId || ''}
                                  onChange={e => {
                                    setAssignPickExistingId(e.target.value);
                                    if (e.target.value) {
                                      setAssignPickName(''); setAssignPickSteam(''); setAssignPickAvatar('');
                                    }
                                  }}
                                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 10px', borderRadius: '4px', fontSize: '12px' }}
                                >
                                  <option value="">-- Create New Admin --</option>
                                  <optgroup label="Select Existing Admin (will be moved here)">
                                    {activeMembers.map(a => {
                                      const aRole = roles.find(r => r.id === a.roleId);
                                      return <option key={a.id} value={a.id}>{a.name} (Current: {aRole?.title || 'Unknown'})</option>
                                    })}
                                  </optgroup>
                                </select>

                                {!assignPickExistingId && (
                                  <>
                                    <input
                                      type="text" placeholder="Name *"
                                      value={assignPickName}
                                      onChange={e => setAssignPickName(e.target.value)}
                                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 10px', borderRadius: '4px', fontSize: '12px' }}
                                    />
                                    <input
                                      type="text" placeholder="Steam URL or ID"
                                      value={assignPickSteam}
                                      onChange={e => setAssignPickSteam(e.target.value)}
                                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 10px', borderRadius: '4px', fontSize: '12px' }}
                                    />
                                    <input
                                      type="text" placeholder="Avatar URL (optional)"
                                      value={assignPickAvatar}
                                      onChange={e => setAssignPickAvatar(e.target.value)}
                                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 10px', borderRadius: '4px', fontSize: '12px' }}
                                    />
                                  </>
                                )}

                                <button
                                  style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)', color: '#A5B4FC', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', marginTop: '4px' }}
                                  onClick={() => {
                                    const s = useStore.getState();
                                    let newTree = s.tree;
                                    let finalNode;

                                    if (assignPickExistingId) {
                                      const allM = flattenNodes(newTree);
                                      const existing = allM.find(a => a.id === assignPickExistingId);
                                      if (!existing) return alert('Admin not found!');

                                      // Remove existing from old location and hoist its children
                                      function removeAndHoist(tree, idToRemove) {
                                        if (!tree.children) return tree;
                                        const targetIdx = tree.children.findIndex(c => c.id === idToRemove);
                                        if (targetIdx !== -1) {
                                          const target = tree.children[targetIdx];
                                          const nextChildren = [
                                            ...tree.children.slice(0, targetIdx),
                                            ...tree.children.slice(targetIdx + 1),
                                            ...(target.children || [])
                                          ];
                                          return { ...tree, children: nextChildren };
                                        }
                                        return { ...tree, children: tree.children.map(c => removeAndHoist(c, idToRemove)) };
                                      }
                                      newTree = removeAndHoist(newTree, existing.id);

                                      finalNode = {
                                        ...existing,
                                        role: roleTitle,
                                        roleId: vacantNode.roleId,
                                        history: [...(existing.history||[]), { date: new Date().toISOString(), action: 'Promoted', toRole: roleTitle }],
                                        children: [...(vacantNode.children || [])]
                                      };
                                    } else {
                                      if (!assignPickName.trim()) { alert('Please enter a name.'); return; }
                                      finalNode = {
                                        id: `m${Date.now()}`,
                                        name: assignPickName.trim(),
                                        role: roleTitle,
                                        roleId: vacantNode.roleId,
                                        steamLink: assignPickSteam.trim() || null,
                                        avatarUrl: assignPickAvatar.trim() || null,
                                        joinDate: new Date().toISOString().split('T')[0],
                                        status: 'online',
                                        immunity: 0,
                                        responsibilities: [],
                                        history: [{ date: new Date().toISOString(), action: 'Promoted', toRole: roleTitle }],
                                        children: [...(vacantNode.children || [])]
                                      };
                                    }

                                    // Replace the vacant node in tree directly
                                    function replaceNode(node) {
                                      if (node.id === vacantNode.id) return finalNode;
                                      if (!node.children) return node;
                                      return { ...node, children: node.children.map(replaceNode) };
                                    }
                                    
                                    newTree = replaceNode(newTree);
                                    useStore.setState({ tree: newTree });
                                    
                                    // Add to logs and reset UI
                                    const actionText = assignPickExistingId ? `Moved ${finalNode.name} to` : `Created ${finalNode.name} in`;
                                    s.addGlobalLog(`${actionText} vacant ${roleTitle} position.`);
                                    
                                    setAssigningVacantId(null); setAssignPickName(''); setAssignPickSteam(''); setAssignPickAvatar(''); setAssignPickExistingId('');
                                    alert(`${finalNode.name} has been assigned as ${roleTitle}!`);
                                  }}
                                >
                                  <Shield size={12} /> Assign & Fill Position
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {/* AUTO-FILL VACANT SLOTS */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '13px', margin: 0 }}>Auto-fill Vacant Slots</h4>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '3px 0 0' }}>Show vacant placeholders for all unfilled role slots</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !autoVacantEnabled;
                        setAutoVacantEnabled(next);
                        localStorage.setItem('wildfire_auto_vacant', JSON.stringify(next));
                      }}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                        background: autoVacantEnabled ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        left: autoVacantEnabled ? '23px' : '3px', transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>

                  {/* Per-role slot table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {roles.filter(r => r.maxSlots !== null && r.maxSlots > 0).map(r => {
                      const filled = allMembers.filter(m => !m.vacant && m.roleId === r.id).length;
                      const vacants = allMembers.filter(m => m.vacant && m.roleId === r.id).length;
                      const empty = Math.max(0, r.maxSlots - filled - vacants);
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{r.title}</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{filled}/{r.maxSlots} filled · {vacants} vacant · {empty} empty</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {empty > 0 && (
                              <button
                                title={`Spawn ${empty} vacant slot(s)`}
                                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  for (let i = 0; i < empty; i++) {
                                    useStore.getState().addNode(useStore.getState().tree.id, {
                                      id: `vacant-${Date.now()}-${i}`,
                                      name: vacantName || 'Poziție Liberă',
                                      roleId: r.id,
                                      vacant: true,
                                      avatarUrl: vacantAvatar || null,
                                      children: []
                                    });
                                  }
                                }}
                              >
                                <PlusCircle size={10} /> +{empty}
                              </button>
                            )}
                            {vacants > 0 && (
                              <button
                                title="Remove all vacant slots for this role"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  const toRemove = allMembers.filter(m => m.vacant && m.roleId === r.id);
                                  toRemove.forEach(v => kickNode(v.id));
                                }}
                              >
                                <Trash2 size={10} /> -{vacants}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'LOGS' && (
            <div className={styles.rolesList}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px 16px' }}>
                <button
                  style={{
                    background: 'rgba(255, 50, 50, 0.1)',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                    color: 'rgba(255, 100, 100, 0.9)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL staff changes?')) {
                      useStore.setState({ globalLog: [] })
                      localStorage.setItem('wildfire_audit_log', '[]')
                    }
                  }}
                >
                  DELETE ALL STAFF CHANGES
                </button>
              </div>
              {validLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  No staff changes recorded yet.
                </div>
              ) : (
                validLogs.map(log => (
                  <div key={log.id} className={styles.adminRow} style={{ alignItems: 'center', gap: '16px' }}>
                    {log.targetAvatar ? (
                      <img src={log.targetAvatar} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="rgba(255,255,255,0.5)" />
                      </div>
                    )}
                    <div className={styles.groupInfoCol}>
                      <div className={styles.adminNameRow}>
                        <span className={styles.adminSteamId}>
                          {new Date(log.date).toLocaleString()} • BY{' '}
                          {log.byAvatar && <img src={log.byAvatar} alt="" style={{ width: 14, height: 14, borderRadius: '50%', display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />}
                          {log.by.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.adminBadges}>
                        <span className={styles.memberCountText} style={{ color: '#fff' }}>
                          {log.message}
                        </span>
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => {
                          if (window.confirm('Delete this log entry?')) {
                            const updated = globalLog.filter(l => l.id !== log.id)
                            useStore.setState({ globalLog: updated })
                            localStorage.setItem('wildfire_audit_log', JSON.stringify(updated))
                          }
                        }}
                        title="Delete log"
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
