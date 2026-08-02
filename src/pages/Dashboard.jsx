import React, { useState, useCallback, useMemo } from 'react'
import { ROLES, INITIAL_ROLES_DATA, getRoleById, genId } from '../data/staffData'
import Avatar from '../components/Avatar'
import MemberModal from '../components/MemberModal'
import AddMemberModal from '../components/AddMemberModal'
import styles from './Dashboard.module.css'

// ─── STAFF CARD ───────────────────────────────────────────────────────────────
function StaffCard({ member, role, editMode, onClick, onDelete, onEdit }) {
  return (
    <div
      className={`${styles.card} ${editMode ? styles.cardEdit : ''}`}
      onClick={() => !editMode && onClick()}
      style={{ '--role-color': role.color, '--role-glow': role.glow, '--role-soft': role.glowSoft }}
    >
      {editMode && (
        <div className={styles.cardActions}>
          <button className={styles.editCardBtn} onClick={e => { e.stopPropagation(); onEdit() }} title="Edit">✏️</button>
          <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete() }} title="Delete">✕</button>
        </div>
      )}
      <div className={styles.cardInner}>
        <Avatar name={member.name} color={role.color} glow={role.glow} size={52} />
        <div className={styles.cardName}>{member.name}</div>
        <div className={styles.cardTasks}>
          {member.responsibilities.length} {member.responsibilities.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>
    </div>
  )
}

// ─── VACANT CARD ─────────────────────────────────────────────────────────────
function VacantCard({ role }) {
  return (
    <div className={styles.vacantCard} style={{ '--role-color': role.color }}>
      <div className={styles.vacantAvatar}>?</div>
      <div className={styles.vacantName}>Poziție vacantă</div>
      <div className={styles.vacantSub}>Recrutăm</div>
    </div>
  )
}

// ─── TIER ROW ────────────────────────────────────────────────────────────────
function TierRow({ roleData, filteredMembers, editMode, onCardClick, onDelete, onEdit, onAddMember, delay }) {
  const role = getRoleById(roleData.id)
  if (!role) return null
  const showVacant = roleData.members.length === 0 && !editMode

  return (
    <div className={styles.tier} style={{ '--role-color': role.color, '--role-glow': role.glow, animationDelay: `${delay}ms` }}>
      {/* Top accent line */}
      <div className={styles.tierAccent} />

      <div className={styles.tierBody}>
        {/* Tier header */}
        <div className={styles.tierHeader}>
          <div className={styles.tierIconWrap}>
            <span className={styles.tierIcon}>{role.icon}</span>
          </div>
          <div className={styles.tierInfo}>
            <div className={styles.tierTitle}>{role.title}</div>
            <div className={styles.tierMeta}>
              {roleData.members.length} {roleData.members.length === 1 ? 'member' : 'members'}
              {filteredMembers.length !== roleData.members.length && (
                <span className={styles.tierFiltered}> · {filteredMembers.length} vizibili</span>
              )}
            </div>
          </div>
          <div className={styles.tierDot} />
        </div>

        {/* Cards row */}
        <div className={styles.cardsRow}>
          {filteredMembers.map((member, i) => (
            <StaffCard
              key={member.id}
              member={member}
              role={role}
              editMode={editMode}
              onClick={() => onCardClick(member, role)}
              onDelete={() => onDelete(roleData.id, member.id)}
              onEdit={() => onEdit(member, role)}
            />
          ))}
          {showVacant && <VacantCard role={role} />}
          {editMode && (
            <button className={styles.addCard} onClick={() => onAddMember(role)}>
              <span className={styles.addCardPlus}>+</span>
              <span className={styles.addCardLabel}>Adaugă</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [rolesData, setRolesData] = useState(() =>
    ROLES.map(r => ({
      ...r,
      members: INITIAL_ROLES_DATA.find(d => d.id === r.id)?.members ?? [],
    }))
  )
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [addToRole, setAddToRole] = useState(null)

  const totalMembers = useMemo(() => rolesData.reduce((a, r) => a + r.members.length, 0), [rolesData])
  const activeRoles = useMemo(() => rolesData.filter(r => r.members.length > 0).length, [rolesData])

  const lowerSearch = search.toLowerCase()

  const filteredRoles = useMemo(() => {
    if (!lowerSearch) return rolesData.map(r => ({ roleData: r, members: r.members }))
    return rolesData
      .map(r => ({
        roleData: r,
        members: r.members.filter(m => m.name.toLowerCase().includes(lowerSearch)),
      }))
      .filter(r => r.members.length > 0 || r.roleData.title.toLowerCase().includes(lowerSearch))
  }, [rolesData, lowerSearch])

  const handleCardClick = useCallback((member, role) => {
    setSelectedMember(member)
    setSelectedRole(role)
  }, [])

  const handleDelete = useCallback((roleId, memberId) => {
    setRolesData(prev => prev.map(r =>
      r.id === roleId ? { ...r, members: r.members.filter(m => m.id !== memberId) } : r
    ))
  }, [])

  const handleSave = useCallback((roleId, memberId, resps) => {
    setRolesData(prev => prev.map(r =>
      r.id === roleId
        ? { ...r, members: r.members.map(m => m.id === memberId ? { ...m, responsibilities: resps } : m) }
        : r
    ))
    setSelectedMember(prev => prev?.id === memberId ? { ...prev, responsibilities: resps } : prev)
  }, [])

  const handleAddMember = useCallback((roleId, name) => {
    const newMember = { id: genId(), name, responsibilities: [] }
    setRolesData(prev => prev.map(r =>
      r.id === roleId ? { ...r, members: [...r.members, newMember] } : r
    ))
  }, [])

  const closeModal = useCallback(() => {
    setSelectedMember(null)
    setSelectedRole(null)
  }, [])

  const hasResults = filteredRoles.length > 0

  return (
    <div className={styles.page}>
      <div className="grid-bg" />

      {/* ─── STICKY SUB-HEADER ─── */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderInner}>
          {/* Title area */}
          <div className={styles.subHeaderLeft}>
            <h1 className={styles.pageTitle}>Staff Dashboard</h1>
            <div className={styles.pageSub}>cs2.wildfire.ro</div>
          </div>

          {/* Stats */}
          <div className={styles.statPills}>
            <div className={styles.statPill}>
              <div className={styles.statDot} style={{ background: '#2ECC71', boxShadow: '0 0 8px #2ECC71' }} />
              <span>{totalMembers} Membri</span>
            </div>
            <div className={styles.statPill} style={{ background: 'rgba(255,215,0,0.08)', borderColor: 'rgba(255,215,0,0.2)' }}>
              <span>🏆</span>
              <span>{activeRoles} Roluri active</span>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Caută după nume..."
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Edit toggle */}
          <button
            className={`${styles.editToggle} ${editMode ? styles.editToggleActive : ''}`}
            onClick={() => setEditMode(v => !v)}
          >
            {editMode ? '✓ Exit Edit' : '⚙️ Edit Mode'}
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className={styles.main}>
        {!hasResults && search ? (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔥</div>
            <div className={styles.noResultsTitle}>Niciun rezultat pentru "{search}"</div>
            <div className={styles.noResultsSub}>Încearcă un alt termen de căutare</div>
          </div>
        ) : (
          <div className={styles.tiers}>
            {filteredRoles.map(({ roleData, members }, i) => (
              <TierRow
                key={roleData.id}
                roleData={roleData}
                filteredMembers={members}
                editMode={editMode}
                onCardClick={handleCardClick}
                onDelete={handleDelete}
                onEdit={handleCardClick}
                onAddMember={setAddToRole}
                delay={i * 55}
              />
            ))}
          </div>
        )}
      </main>

      {/* ─── MODALS ─── */}
      {selectedMember && selectedRole && (
        <MemberModal
          member={selectedMember}
          role={selectedRole}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {addToRole && (
        <AddMemberModal
          role={addToRole}
          onClose={() => setAddToRole(null)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  )
}
