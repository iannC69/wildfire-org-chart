import React, { useState, useMemo, useEffect, useRef } from 'react'
import { X, Save, Trash2, Plus, Users, Shield, Edit3, Search, Hexagon, Crown, AlertTriangle } from 'lucide-react'
import { useStore, flattenNodes } from '../store/useStore'
import styles from './SettingsModal.module.css'

export default function SettingsModal({ onClose }) {
  const roles = useStore(s => s.roles)
  const roleDetails = useStore(s => s.roleDetails)
  const tree = useStore(s => s.tree)
  const updateRole = useStore(s => s.updateRole)
  const addRole = useStore(s => s.addRole)
  const deleteRole = useStore(s => s.deleteRole)
  const updateNodeDetails = useStore(s => s.updateNodeDetails)
  const kickNode = useStore(s => s.kickNode)

  const [activeTab, setActiveTab] = useState('ADMINS')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRole, setEditingRole] = useState(null)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Edit form state — fully React-controlled (no document.getElementById)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editRoleId, setEditRoleId] = useState('')
  const [editManagerId, setEditManagerId] = useState('')
  const [editResps, setEditResps] = useState('')
  const [editHistory, setEditHistory] = useState([])

  // New history log form state — React controlled
  const [newHistAction, setNewHistAction] = useState('Promoted')
  const [newHistRole, setNewHistRole] = useState('')
  const [newHistDate, setNewHistDate] = useState(() => new Date().toISOString().split('T')[0])
  const adminName = useStore(s => s.adminName)
  const [newHistBy, setNewHistBy] = useState(adminName || 'Console')
  const [newHistReason, setNewHistReason] = useState('')

  // Keep newHistBy synced if adminName changes globally while modal is open
  useEffect(() => {
    setNewHistBy(adminName || 'Console')
  }, [adminName])

  // New Group state
  const [newRoleTitle, setNewRoleTitle] = useState('New Group')
  const [newRoleColor, setNewRoleColor] = useState('#8b5cf6')
  const [newRoleRank, setNewRoleRank] = useState(10)
  const [newRoleSlots, setNewRoleSlots] = useState('')

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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Initialize newHistRole when roles change
  useEffect(() => {
    if (roles.length > 0 && !newHistRole) {
      setNewHistRole(roles[0].title)
    }
  }, [roles])

  const TABS = [
    { id: 'ADMINS', label: 'ADMINS', icon: Users, count: activeMembers.length },
    { id: 'GROUPS', label: 'GROUPS', icon: Shield, count: roles.length }
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
    setActiveTab('GROUPS')
  }

  const handleAddAdmin = () => {
    const helperRole = roles.find(r => r.id === 'helper') || roles[roles.length - 1]
    
    setEditingAdmin('NEW')
    setEditName('')
    setEditAvatar('')
    setEditRoleId(helperRole?.id || '')
    setEditManagerId('')
    
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
    setEditRoleId(m.roleId || '')
    setEditManagerId('')
    let initialResps = m.responsibilities
    if (!initialResps || initialResps.length === 0) {
      const defs = roleDetails.find(rd => rd.id === (m.roleId || ''))?.responsibilities || []
      initialResps = defs.map(rd => rd.title || rd)
    }
    setEditResps(initialResps.join('\n'))
    setEditHistory(m.history ? [...m.history] : [])
  }

  const handleAddHistoryEntry = () => {
    if (!newHistDate) return
    const newLog = {
      action: newHistAction,
      fromRole: 'Unknown',
      toRole: newHistRole || roles[0]?.title || '',
      date: new Date(newHistDate).toISOString(),
      by: newHistBy || 'Console',
      reason: newHistReason || ''
    }
    setEditHistory(prev => [...prev, newLog])
    setNewHistReason('')
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

  const handleSaveAdmin = (m) => {
    if (m.id === 'NEW') {
      const newId = `node-${Date.now()}`
      const newAdmin = {
        id: newId,
        name: editName || 'New Admin',
        roleId: editRoleId,
        role: roles.find(r => r.id === editRoleId)?.title || 'No Role',
        avatarUrl: editAvatar,
        vacant: false,
        responsibilities: editResps.split('\n').map(x => x.trim()).filter(Boolean),
        history: editHistory,
        children: []
      }
      useStore.getState().addNode(editManagerId || tree.id, newAdmin)
    } else {
      useStore.getState().updateNodeDetails(m.id, {
        name: editName,
        avatarUrl: editAvatar,
        roleId: editRoleId,
        responsibilities: editResps.split('\n').map(x => x.trim()).filter(Boolean),
        history: editHistory
      })
      if (editManagerId) {
        useStore.getState().moveNode(m.id, editManagerId)
      }
    }
    setEditingAdmin(null)
  }

  const handleKickAdmin = (id) => {
    kickNode(id)
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
          <div className={styles.statCard} style={{ '--card-color': '#EAB308' }}>
            <div className={styles.statIcon}><Crown size={18} /></div>
            <div className={styles.statNum}>{roles.filter(r => r.rank <= 2).length > 0 ? activeMembers.filter(m => roles.find(r => r.id === m.roleId)?.rank <= 2).length : 0}</div>
            <div className={styles.statLabel}>ACTIVE VIPS</div>
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
              {(() => {
                const displayMembers = editingAdmin === 'NEW'
                  ? [{ id: 'NEW', name: editName || 'New Admin', roleId: editRoleId, avatarUrl: editAvatar, history: editHistory }, ...filteredMembers]
                  : filteredMembers;

                return displayMembers.map(m => {
                  const role = roles.find(r => r.id === m.roleId)
                const steamIdMatch = m.steamLink?.match(/\/profiles\/(\d+)/) || m.steamLink?.match(/\/id\/([^/]+)/)
                const steamId = steamIdMatch ? steamIdMatch[1] : null
                const isEditingAdmin = editingAdmin === m.id

                return (
                  <div key={m.id} className={`${styles.adminRowWrapper} ${isEditingAdmin ? styles.adminRowExpanded : ''}`}>
                    <div className={styles.adminRow}>
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
                            <label>MANAGER (MOVE TO)</label>
                            <select value={editManagerId} onChange={e => setEditManagerId(e.target.value)}>
                              <option value="">-- {m.id === 'NEW' ? 'Default Manager (Root)' : 'Keep Current Manager'} --</option>
                              {activeMembers.filter(n => n.id !== m.id).map(n => (
                                <option key={n.id} value={n.id}>{n.name}</option>
                              ))}
                            </select>
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

                        {/* History Logs — fully React state controlled */}
                        <div className={styles.editFieldBlock}>
                          <label>HISTORY LOGS</label>
                          <div className={styles.historyBox}>
                            {editHistory.length > 0 ? (
                              editHistory.map((h, i) => (
                                <div key={i} className={styles.histEntry}>
                                  <div className={styles.histEntryRow}>
                                    <select
                                      value={h.action}
                                      onChange={e => handleUpdateHistEntry(i, 'action', e.target.value)}
                                      className={`${styles.histSelect} ${
                                        h.action === 'Promoted' ? styles.colorGreen :
                                        h.action === 'Removed' ? styles.colorRed : styles.colorYellow
                                      }`}
                                    >
                                      <option value="Promoted">PROMOTED</option>
                                      <option value="Demoted">DEMOTED</option>
                                      <option value="Removed">REMOVED</option>
                                    </select>
                                    <span className={styles.histTo}>To:</span>
                                    <select
                                      value={h.toRole}
                                      onChange={e => handleUpdateHistEntry(i, 'toRole', e.target.value)}
                                      className={styles.histSelectNeutral}
                                    >
                                      {roles.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                                    </select>
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
                                    <select
                                      value={h.by || 'Console'}
                                      onChange={e => handleUpdateHistEntry(i, 'by', e.target.value)}
                                      className={styles.histSelectNeutral}
                                    >
                                      <option value="Console">Console</option>
                                      {eligibleAdmins.map(admin => (
                                        <option key={admin.id} value={admin.name}>{admin.name}</option>
                                      ))}
                                    </select>
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

                            {/* New log row — React state controlled */}
                            <div className={styles.addHistRow}>
                              <div className={styles.addHistInputs}>
                                <select value={newHistAction} onChange={e => setNewHistAction(e.target.value)} className={styles.histInputSm}>
                                  <option value="Promoted">Promoted</option>
                                  <option value="Demoted">Demoted</option>
                                  <option value="Removed">Removed</option>
                                </select>
                                <select value={newHistRole} onChange={e => setNewHistRole(e.target.value)} className={styles.histInputSm}>
                                  {roles.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                                </select>
                                <input
                                  type="date"
                                  value={newHistDate}
                                  onChange={e => setNewHistDate(e.target.value)}
                                  className={styles.histInputSm}
                                />
                                <select value={newHistBy} onChange={e => setNewHistBy(e.target.value)} className={styles.histInputSm}>
                                  <option value="Console">Console</option>
                                  {eligibleAdmins.map(admin => (
                                    <option key={admin.id} value={admin.name}>{admin.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className={styles.addHistReasonRow}>
                                <input
                                  type="text"
                                  placeholder="Reason (optional)..."
                                  value={newHistReason}
                                  onChange={e => setNewHistReason(e.target.value)}
                                  className={styles.histReasonInput}
                                />
                                <button className={styles.addHistBtn} onClick={handleAddHistoryEntry}>
                                  <Plus size={13} /> Add
                                </button>
                              </div>
                            </div>
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
        </div>
      </div>
    </div>
  )
}
