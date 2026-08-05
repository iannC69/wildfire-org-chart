import React, { useState, useMemo, useEffect } from 'react'
import { X, Save, Trash2, Plus, Users, Shield, Edit3, Search, Hexagon, Crown } from 'lucide-react'
import { useStore, flattenNodes } from '../store/useStore'
import MemberEditSidebar from './MemberEditSidebar'
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
  const adminName = useStore(s => s.adminName)
  const setAdminName = useStore(s => s.setAdminName)
  
  const [activeTab, setActiveTab] = useState('ADMINS')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRole, setEditingRole] = useState(null)
  const [editingAdmin, setEditingAdmin] = useState(null)
  
  // Edit form state for inline editing
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editRoleId, setEditRoleId] = useState('')
  const [editManagerId, setEditManagerId] = useState('')
  const [editResps, setEditResps] = useState('')
  const [editHistory, setEditHistory] = useState([])

  // Computed stats
  const allMembers = useMemo(() => {
    if (!tree) return []
    return flattenNodes(tree)
  }, [tree])
  
  const activeMembers = allMembers
    .filter(m => !m.vacant && m.id !== 'vacant')
    .sort((a, b) => {
      const roleA = roles.find(r => r.id === a.roleId);
      const roleB = roles.find(r => r.id === b.roleId);
      const rankA = roleA ? roleA.rank : 999;
      const rankB = roleB ? roleB.rank : 999;
      return rankA - rankB;
    });
  
  const supervizorRank = roles.find(r => r.id === 'supervizor')?.rank || 5
  const eligibleAdmins = activeMembers.filter(m => {
    const r = roles.find(role => role.id === m.roleId)
    return r && r.rank <= supervizorRank
  })

  const handleUpdateRole = (id, field, val) => {
    if (field === 'maxSlots') val = val === '' ? null : parseInt(val, 10)
    if (field === 'rank') val = parseInt(val, 10) || 0
    updateRole(id, { [field]: val })
  }

  const handleAddRole = () => {
    addRole({ title: 'New Group', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)', rank: roles.length + 1 })
  }

  const handleDeleteRole = (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteRole(id)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const TABS = [
    { id: 'ADMINS', label: 'ADMINS', icon: Users, count: activeMembers.length },
    { id: 'GROUPS', label: 'GROUPS', icon: Shield, count: roles.length }
  ]

  const filteredMembers = activeMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredRoles = roles.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dashboard} onClick={e => e.stopPropagation()}>
        
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
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabsBar}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const color = isActive ? (tab.id === 'ADMINS' ? '#FF6B00' : '#8B5CF6') : 'rgba(255,255,255,0.4)'
              
              return (
                <button 
                  key={tab.id} 
                  className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <span className={styles.tabBadge}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

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
            <button className={styles.addBtn}>
              <Plus size={16} strokeWidth={3} /> Add Admin
            </button>
          ) : (
            <button className={styles.addBtn} onClick={handleAddRole}>
              <Plus size={16} strokeWidth={3} /> New Group
            </button>
          )}
        </div>

        <div className={styles.scrollArea}>
          {activeTab === 'ADMINS' && (
            <div className={styles.adminList}>
              {filteredMembers.map(m => {
                const role = roles.find(r => r.id === m.roleId)
                const steamIdMatch = m.steamLink?.match(/\/profiles\/(\d+)/) || m.steamLink?.match(/\/id\/([^/]+)/)
                const steamId = steamIdMatch ? steamIdMatch[1] : '76561197966989956'
                const isEditingAdmin = editingAdmin === m.id

                return (
                  <div key={m.id} className={`${styles.adminRowWrapper} ${isEditingAdmin ? styles.adminRowExpanded : ''}`}>
                    <div className={styles.adminRow}>
                      <div className={styles.adminAvatar}>
                        {m.avatarUrl ? <img src={m.avatarUrl} alt=""/> : <span>{m.name.charAt(0)}</span>}
                      </div>
                      
                      <div className={styles.adminInfoCol}>
                        <div className={styles.adminNameRow}>
                          <span className={styles.adminName}>{m.name}</span>
                          <span className={styles.adminSteamId}>{steamId}</span>
                        </div>
                        <div className={styles.adminBadges}>
                          <div className={styles.roleBadge} style={{ 
                            color: role?.color || '#fff', 
                            borderColor: role?.color || 'rgba(255,255,255,0.2)' 
                          }}>
                            {role?.title || 'No Role'}
                          </div>
                        </div>
                      </div>

                      <div className={styles.rowActions}>
                        <button 
                          className={`${styles.actionBtn} ${isEditingAdmin ? styles.actionBtnActive : ''}`} 
                          onClick={() => {
                            if (isEditingAdmin) {
                              setEditingAdmin(null)
                            } else {
                              setEditingAdmin(m.id)
                              setEditName(m.name || '')
                              setEditAvatar(m.avatarUrl || '')
                              setEditRoleId(m.roleId || '')
                              setEditManagerId('') // Not directly on node, but we'll allow moving
                              let initialResps = m.responsibilities;
                              if (!initialResps || initialResps.length === 0) {
                                const defs = roleDetails.find(rd => rd.id === (m.roleId || ''))?.responsibilities || [];
                                initialResps = defs.map(rd => rd.title || rd);
                              }
                              setEditResps(initialResps.join('\n'))
                              setEditHistory(m.history || [])
                            }
                          }}
                        >
                          <Edit3 size={14} color={isEditingAdmin ? "#FF6B00" : "#3B82F6"} />
                        </button>
                        <button className={styles.actionBtn} onClick={() => kickNode(m.id)}>
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      </div>
                    </div>

                    {isEditingAdmin && (
                      <div className={styles.inlineEditPanel}>
                        <div className={styles.editRow}>
                          <div className={styles.editField}>
                            <label>USERNAME</label>
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={e => setEditName(e.target.value)} 
                            />
                          </div>
                          <div className={styles.editField}>
                            <label>AVATAR URL</label>
                            <input 
                              type="text" 
                              value={editAvatar} 
                              onChange={e => setEditAvatar(e.target.value)} 
                            />
                          </div>
                          <div className={styles.editField}>
                            <label>MANAGER (MOVE TO)</label>
                            <select 
                              value={editManagerId} 
                              onChange={e => setEditManagerId(e.target.value)}
                            >
                              <option value="">-- Keep Current Manager --</option>
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
                                  setEditRoleId(r.id);
                                  const defs = roleDetails.find(rd => rd.id === r.id)?.responsibilities || [];
                                  setEditResps(defs.map(rd => rd.title || rd).join('\n'));
                                }}
                              >
                                {r.title}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={styles.editFieldBlock}>
                          <label>ATTRIBUTES & RESPONSIBILITIES</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', background: '#141418', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {(() => {
                              const defaultResps = roleDetails.find(r => r.id === editRoleId)?.responsibilities || [];
                              const currentRespsArray = editResps ? editResps.split('\n').filter(r => r.trim() !== '') : [];
                              const customResps = currentRespsArray.filter(title => !defaultResps.some(r => r.title === title)).map(title => ({ title, isCustom: true }));
                              const allResps = [...defaultResps, ...customResps];
                              
                              if (allResps.length === 0) {
                                return <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Nu există atribuții pentru acest rol.</span>;
                              }

                              return allResps.map((resp, idx) => {
                                const isChecked = currentRespsArray.includes(resp.title);
                                return (
                                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: resp.isCustom ? '#f59e0b' : 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let newArray = [...currentRespsArray];
                                        if (e.target.checked) {
                                          if (!newArray.includes(resp.title)) newArray.push(resp.title);
                                        } else {
                                          newArray = newArray.filter(r => r !== resp.title);
                                        }
                                        setEditResps(newArray.join('\n'));
                                      }}
                                    />
                                    <span>{resp.title} {resp.isCustom && <span style={{ fontSize: '10px', opacity: 0.6 }}>(Custom)</span>}</span>
                                  </label>
                                )
                              });
                            })()}
                          </div>
                        </div>

                        <div className={styles.editFieldBlock}>
                          <label>MANAGE HISTORY LOGS</label>
                          <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                             {editHistory.length > 0 ? (
                               editHistory.map((h, i) => (
                                 <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '6px' }}>
                                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                                     <select 
                                       value={h.action}
                                       onChange={e => {
                                         const newHist = [...editHistory];
                                         newHist[i].action = e.target.value;
                                         setEditHistory(newHist);
                                       }}
                                       style={{ background: 'transparent', border: 'none', color: h.action === 'Promoted' ? '#EAB308' : h.action === 'Removed' ? '#EF4444' : '#10B981', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                                     >
                                       <option value="Promoted" style={{ color: '#000' }}>PROMOTED</option>
                                       <option value="Demoted" style={{ color: '#000' }}>DEMOTED</option>
                                       <option value="Removed" style={{ color: '#000' }}>REMOVED</option>
                                     </select>
                                     <span style={{ color: '#fff' }}>To:</span>
                                     <select
                                       value={h.toRole}
                                       onChange={e => {
                                         const newHist = [...editHistory];
                                         newHist[i].toRole = e.target.value;
                                         setEditHistory(newHist);
                                       }}
                                       style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer' }}
                                     >
                                        {roles.map(r => <option key={r.id} value={r.title} style={{ color: '#000' }}>{r.title}</option>)}
                                     </select>
                                     <input 
                                       type="date"
                                       value={h.date.split('T')[0]}
                                       onChange={e => {
                                         if (!e.target.value) return;
                                         const newHist = [...editHistory];
                                         newHist[i].date = new Date(e.target.value).toISOString();
                                         setEditHistory(newHist);
                                       }}
                                       style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', outline: 'none', width: '110px' }}
                                     />
                                     <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>by</span>
                                     <select 
                                       value={h.by || 'Console'}
                                       onChange={e => {
                                         const newHist = [...editHistory];
                                         newHist[i].by = e.target.value;
                                         setEditHistory(newHist);
                                       }}
                                       style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', outline: 'none', width: '90px', cursor: 'pointer' }}
                                     >
                                       <option value="Console" style={{ color: '#000' }}>Console</option>
                                       {eligibleAdmins.map(admin => (
                                         <option key={admin.id} value={admin.name} style={{ color: '#000' }}>{admin.name}</option>
                                       ))}
                                     </select>
                                     <button 
                                       onClick={() => setEditHistory(editHistory.filter((_, idx) => idx !== i))}
                                       style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                   </div>
                                   <input 
                                     type="text" 
                                     placeholder="Reason..." 
                                     value={h.reason || ''} 
                                     onChange={e => {
                                       const newHist = [...editHistory];
                                       newHist[i].reason = e.target.value;
                                       setEditHistory(newHist);
                                     }}
                                     style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: '4px', padding: '6px 8px', outline: 'none', fontSize: '12px' }}
                                   />
                                 </div>
                               ))
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px 0', textAlign: 'center' }}>No history logs found.</div>
                             )}
                            
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                               <div style={{ display: 'flex', gap: '8px' }}>
                                  <select id="newHistAction" style={{ flex: 1, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px', fontSize: '12px' }}>
                                    <option value="Promoted">Promoted</option>
                                    <option value="Demoted">Demoted</option>
                                    <option value="Removed">Removed</option>
                                  </select>
                                  <select id="newHistRole" style={{ flex: 1, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px', fontSize: '12px' }}>
                                    {roles.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                                  </select>
                                  <input type="date" id="newHistDate" defaultValue={new Date().toISOString().split('T')[0]} style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px', fontSize: '12px' }} />
                                  <select id="newHistBy" style={{ flex: 1, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px', fontSize: '12px' }}>
                                    <option value="Console">Console</option>
                                    {eligibleAdmins.map(admin => (
                                      <option key={admin.id} value={admin.name}>{admin.name}</option>
                                    ))}
                                  </select>
                               </div>
                               <div style={{ display: 'flex', gap: '8px' }}>
                                 <input type="text" id="newHistReason" placeholder="Motiv (opțional)..." style={{ flex: 1, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '6px 8px', fontSize: '12px', outline: 'none' }} />
                                 <button 
                                   style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                   onClick={() => {
                                     const action = document.getElementById('newHistAction').value;
                                     const role = document.getElementById('newHistRole').value;
                                     const dateStr = document.getElementById('newHistDate').value;
                                     const reason = document.getElementById('newHistReason').value;
                                     const byName = document.getElementById('newHistBy').value;
                                     if (!dateStr) return;
                                     const newLog = {
                                       action: action,
                                       fromRole: 'Unknown',
                                       toRole: role,
                                       date: new Date(dateStr).toISOString(),
                                       by: byName || 'Console',
                                       reason: reason || ''
                                     };
                                     setEditHistory([...editHistory, newLog]);
                                     document.getElementById('newHistReason').value = '';
                                   }}
                                 >
                                   <Plus size={12} /> Add
                                 </button>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className={styles.editFooter}>
                          <button className={styles.cancelBtn} onClick={() => setEditingAdmin(null)}>Cancel</button>
                          <button className={styles.updateBtn} onClick={() => {
                            useStore.getState().updateNodeDetails(m.id, {
                              name: editName,
                              avatarUrl: editAvatar,
                              roleId: editRoleId,
                              responsibilities: editResps
                                .split('\n')
                                .map(x => x.trim())
                                .filter(Boolean),
                              history: editHistory
                            })
                            if (editManagerId) {
                              useStore.getState().moveNode(m.id, editManagerId)
                            }
                            setEditingAdmin(null)
                          }}>
                            <Save size={14} /> Update
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'GROUPS' && (
            <div className={styles.rolesList}>
              {filteredRoles.sort((a,b) => a.rank - b.rank).map(role => {
                const roleMembers = activeMembers.filter(m => m.roleId === role.id)
                const isEditing = editingRole === role.id

                return (
                  <div key={role.id} className={styles.adminRow} style={{ alignItems: 'center' }}>
                    <div className={styles.roleShield} style={{ borderColor: role.color }}>
                      <Shield size={14} color={role.color} />
                    </div>
                    
                    {isEditing ? (
                       <div className={styles.editRowInline}>
                         <input type="text" value={role.title} onChange={e => handleUpdateRole(role.id, 'title', e.target.value)} className={styles.inlineInput} />
                         <input type="color" value={role.color} onChange={e => handleUpdateRole(role.id, 'color', e.target.value)} className={styles.inlineColor} />
                         <input type="number" value={role.rank} onChange={e => handleUpdateRole(role.id, 'rank', e.target.value)} placeholder="Rank" className={styles.inlineInputSmall} />
                         <input type="number" value={role.maxSlots === null ? '' : role.maxSlots} onChange={e => handleUpdateRole(role.id, 'maxSlots', e.target.value)} placeholder="Slots" className={styles.inlineInputSmall} />
                         <button onClick={() => setEditingRole(null)} className={styles.saveInlineBtn}><Save size={14}/></button>
                       </div>
                    ) : (
                      <div className={styles.groupInfoCol}>
                        <div className={styles.adminNameRow}>
                          <span className={styles.adminName} style={{ color: role.color }}>{role.title}</span>
                          <span className={styles.adminSteamId}>Rank: {role.rank}</span>
                        </div>
                        <div className={styles.adminBadges}>
                          <span className={styles.memberCountText}>{roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}

                    <div className={styles.rowActions}>
                      {!isEditing && (
                        <button className={styles.actionBtn} onClick={() => setEditingRole(role.id)}>
                          <Edit3 size={14} color="#3B82F6" />
                        </button>
                      )}
                      <button className={styles.actionBtn} onClick={() => handleDeleteRole(role.id)}>
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
