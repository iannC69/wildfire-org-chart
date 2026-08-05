import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { INITIAL_ROLES_DATA, getInitials } from '../data/staffData'
import { toPng } from 'html-to-image'
import * as d3 from 'd3-selection'
import { drag } from 'd3-drag'
import ProfileModal from '../components/ProfileModal'
import SettingsModal from '../components/SettingsModal'
import EditMemberModal from '../components/EditMemberModal'
import Navbar from '../components/Navbar'
import { useStore } from '../store/useStore'
import styles from './OrgChart.module.css'
import { Gamepad2, Pencil, Trash2, PlusCircle, Search, X, ArrowUp, ArrowDown, ZoomIn, ZoomOut, Maximize, Download, Upload, Lock, Unlock, Edit3, List, Network, ClipboardList, History, Settings, User, Copy, Shield, Undo2, Redo2, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { userHistories } from '../utils/patchHistory'

// ─── NODE DIMENSIONS ─────────────────────────────────────────────────────────
const NODE_W = 160
const NODE_H = 110
const H_GAP = 32   // horizontal gap between siblings
const V_GAP = 72   // vertical gap between levels

// ─── NODE SHAPE SYSTEM ───────────────────────────────────────────────────────
// All roles use ROUNDED (rx=10) for a consistent, clean look.
const ROLE_SHAPES = {
  founder: 'DIAMOND',
  community_manager: 'ROUNDED',
  server_manager: 'ROUNDED',
  supervisor: 'ROUNDED',
  community_advisor: 'SHARP',
  administrator: 'SHARP',
  moderator: 'ROUNDED',
  helper: 'ROUNDED',
  developer: 'ROUNDED',
}

function getShapeForNode(node) {
  if (node.vacant) return 'PILL'
  return ROLE_SHAPES[node.roleId] ?? 'ROUNDED'
}

// Returns the top and bottom anchor points for a laid-out node in ABSOLUTE SVG space.
// The node group is translated by (node.x, node.y), so absolute = node.x/y + local offset.
// The card rect is drawn at local (0,0) with size NODE_W × NODE_H.
function getNodeAnchors(node) {
  const cx = node.x + NODE_W / 2
  const hasChildren = (node.children?.length > 0) || node.hasRealChildren
  const bottomY = node.y + NODE_H + (hasChildren ? 12 : 0)
  return {
    top: { x: cx, y: node.y },
    bottom: { x: cx, y: bottomY },
  }
}

// ─── LAYOUT ENGINE ────────────────────────────────────────────────────────────
function computeLayout(node, roles, depth = 0, offsetX = 0) {
  const role = roles.find(r => r.id === node.roleId)
  const _originalHasChildren = (node.children || []).length > 0;
  const visibleChildren = node.collapsed ? [] : (node.children || [])

  let subtreeW
  if (visibleChildren.length === 0) {
    subtreeW = NODE_W
    return {
      ...node,
      role,
      x: offsetX,
      y: depth * (NODE_H + V_GAP),
      w: NODE_W,
      subtreeW,
      hasRealChildren: _originalHasChildren,
      children: [],
    }
  }

  // Layout children first
  let cx = offsetX
  const layoutedChildren = visibleChildren.map(child => {
    const laid = computeLayout(child, roles, depth + 1, cx)
    cx += laid.subtreeW + H_GAP
    return laid
  })

  // Center parent over children
  subtreeW = cx - offsetX - H_GAP
  const firstChild = layoutedChildren[0]
  const lastChild = layoutedChildren[layoutedChildren.length - 1]
  const centerX = (firstChild.x + lastChild.x + NODE_W) / 2 - NODE_W / 2

  return {
    ...node,
    role,
    x: centerX,
    y: depth * (NODE_H + V_GAP),
    w: NODE_W,
    subtreeW,
    hasRealChildren: _originalHasChildren,
    children: layoutedChildren,
  }
}

function flattenNodes(node) {
  const nodes = [node]
  for (const child of node.children || []) {
    nodes.push(...flattenNodes(child))
  }
  return nodes
}

function flattenEdges(node) {
  const edges = []
  for (const child of node.children || []) {
    edges.push({ from: node, to: child })
    edges.push(...flattenEdges(child))
  }
  return edges
}

function getBounds(nodes) {
  if (!nodes.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  const xs = nodes.map(n => n.x)
  const ys = nodes.map(n => n.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs) + NODE_W,
    minY: Math.min(...ys),
    maxY: Math.max(...ys) + NODE_H,
  }
}

// ─── SHAPE RENDERER ──────────────────────────────────────────────────────────
// Renders only the outline of the card. Interior content (avatar, name, badge) is
// overlaid on top. All coordinates are in local node space (0,0 = top-left of card).
function NodeShape({ node, isMatch, isVacant, nodeColor }) {
  const shape = getShapeForNode(node)

  if (isVacant) {
    return (
      <rect
        className={styles.nodeRectVacant}
        x={0} y={0}
        width={NODE_W} height={NODE_H}
        rx={12} ry={12}
      />
    )
  }

  const rx = shape === 'SHARP' ? 0 : 12
  const c = 20 // corner length

  return (
    <g style={{ '--node-color': nodeColor, '--node-glow': nodeColor }}>
      <rect
        className={isMatch ? styles.nodeRectMatch : (node.selected ? styles.nodeRectSelected : styles.nodeRect)}
        x={0} y={0}
        width={NODE_W} height={NODE_H}
        rx={rx} ry={rx}
      />
      {/* Top Left */}
      <path className={styles.nodeCorner} d={`M 0 ${c} L 0 ${rx} Q 0 0 ${rx} 0 L ${c} 0`} fill="none" />
      {/* Top Right */}
      <path className={styles.nodeCorner} d={`M ${NODE_W - c} 0 L ${NODE_W - rx} 0 Q ${NODE_W} 0 ${NODE_W} ${rx} L ${NODE_W} ${c}`} fill="none" />
      {/* Bottom Right */}
      <path className={styles.nodeCorner} d={`M ${NODE_W} ${NODE_H - c} L ${NODE_W} ${NODE_H - rx} Q ${NODE_W} ${NODE_H} ${NODE_W - rx} ${NODE_H} L ${NODE_W - c} ${NODE_H}`} fill="none" />
      {/* Bottom Left */}
      <path className={styles.nodeCorner} d={`M ${c} ${NODE_H} L ${rx} ${NODE_H} Q 0 ${NODE_H} 0 ${NODE_H - rx} L 0 ${NODE_H - c}`} fill="none" />
    </g>
  )
}

// ─── ORG NODE ────────────────────────────────────────────────────────────────
function OrgNode({ node, onCollapse, onSelect, selected, searchQuery, onVacantClick, isEditMode, moveNode, promoteNode, demoteNode, kickNode }) {
  const roleDetailsStore = useStore(s => s.roleDetails)
  const role = node.role
  const roleDetails = roleDetailsStore.find(r => r.id === role?.id)
  const hasChildren = node.hasRealChildren || (node.children || []).length > 0
  const isVacant = node.vacant
  const initials = getInitials(node.name)
  const isSelected = selected === node.id

  const isMatch = searchQuery && !isVacant && node.name.toLowerCase().includes(searchQuery.toLowerCase())
  const isDimmed = searchQuery && !isMatch

  const nodeColor = role?.color || '#666'

  const gRef = useRef(null)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [isDraggingMe, setIsDraggingMe] = useState(false)

  // Listen for drop-target highlight events broadcast from other dragging nodes
  useEffect(() => {
    const onDragOver = (e) => {
      setIsDropTarget(e.detail.hoverId === node.id && e.detail.dragId !== node.id)
    }
    const onDragEnd = () => { setIsDropTarget(false) }
    window.addEventListener('orgchart-drag-hover', onDragOver)
    window.addEventListener('orgchart-drag-end', onDragEnd)
    return () => {
      window.removeEventListener('orgchart-drag-hover', onDragOver)
      window.removeEventListener('orgchart-drag-end', onDragEnd)
    }
  }, [node.id])

  useEffect(() => {
    if (!isEditMode || isVacant || !gRef.current) return;

    let currentX = 0;
    let currentY = 0;
    let lastHoverId = null;
    let lastHoverTime = 0;

    const dragHandler = drag()
      .on('start', function (event) {
        d3.select(this).raise();
        currentX = node.x;
        currentY = node.y;
        setIsDraggingMe(true)
        document.body.style.cursor = 'grabbing'
        lastHoverId = null;
      })
      .on('drag', function (event) {
        currentX += event.dx;
        currentY += event.dy;
        d3.select(this).attr('transform', `translate(${currentX}, ${currentY})`);

        // Throttle drop-zone detection to avoid layout thrashing (50ms)
        const now = performance.now();
        if (now - lastHoverTime > 50) {
          lastHoverTime = now;
          this.style.pointerEvents = 'none'
          const target = document.elementFromPoint(event.sourceEvent.clientX, event.sourceEvent.clientY)
          const targetNodeGroup = target ? target.closest('[data-node-id]') : null
          this.style.pointerEvents = 'auto'
          
          const hoverId = targetNodeGroup ? targetNodeGroup.getAttribute('data-node-id') : null
          
          // Only dispatch if the hovered node changed
          if (hoverId !== lastHoverId) {
            lastHoverId = hoverId;
            window.dispatchEvent(new CustomEvent('orgchart-drag-hover', { detail: { dragId: node.id, hoverId } }))
          }
        }
      })
      .on('end', function (event) {
        d3.select(this).attr('transform', `translate(${node.x}, ${node.y})`);
        setIsDraggingMe(false)
        document.body.style.cursor = ''
        
        if (lastHoverId) {
          window.dispatchEvent(new CustomEvent('orgchart-drag-end'))
        }

        this.style.pointerEvents = 'none'
        const target = document.elementFromPoint(event.sourceEvent.clientX, event.sourceEvent.clientY)
        const targetNodeGroup = target ? target.closest('[data-node-id]') : null

        if (targetNodeGroup) {
          const targetId = targetNodeGroup.getAttribute('data-node-id')
          if (targetId && targetId !== node.id) {
            moveNode(node.id, targetId)
          }
        }
        this.style.pointerEvents = 'auto'
      })

    d3.select(gRef.current).call(dragHandler)

    return () => { d3.select(gRef.current)?.on('.drag', null) }
  }, [isEditMode, isVacant, node, moveNode])

  // The node group is translated to (node.x, node.y).
  // All child coordinates are LOCAL (relative to top-left of card).
  return (
    <g
      ref={gRef}
      className={styles.nodeGroup}
      style={{
        opacity: isDimmed ? 0.2 : isDraggingMe ? 0.55 : 1,
        cursor: isEditMode && !isVacant ? (isDraggingMe ? 'grabbing' : 'grab') : 'pointer',
      }}
      transform={`translate(${node.x}, ${node.y})`}
      data-node-id={node.id}
      onClick={() => isVacant ? (onVacantClick && onVacantClick(node)) : onSelect(node)}
    >
      {/* Drop-zone highlight ring — shown when another node is dragged over this one */}
      {isDropTarget && (
        <rect
          x={-6} y={-6}
          width={NODE_W + 12} height={NODE_H + 12}
          rx={16} ry={16}
          fill="rgba(34,197,94,0.07)"
          stroke="#22C55E"
          strokeWidth={2}
          strokeDasharray="6 3"
          style={{ animation: 'dropZonePulse 0.9s ease-in-out infinite' }}
          pointerEvents="none"
        />
      )}

      {/* Outer shape (role-dependent outline) */}
      <NodeShape node={node} isMatch={isMatch} isVacant={isVacant} nodeColor={nodeColor} />

      <defs>
        <clipPath id={`avatar-clip-${node.id}`}>
          <circle cx={NODE_W / 2} cy={36} r={24} />
        </clipPath>
      </defs>

      {!isVacant ? (
        <>
          {/* Avatar */}
          {(() => {
            const avatarContent = node.avatarUrl ? (
              <image
                href={node.avatarUrl}
                x={NODE_W / 2 - 24}
                y={12}
                width={48}
                height={48}
                clipPath={`url(#avatar-clip-${node.id})`}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <>
                <circle cx={NODE_W / 2} cy={36} r={24} fill={nodeColor} opacity={0.2} />
                <circle cx={NODE_W / 2} cy={36} r={24} fill="none" stroke={nodeColor} strokeWidth={1.5} />
                <text
                  x={NODE_W / 2} y={41}
                  textAnchor="middle"
                  fill={nodeColor}
                  fontSize={18}
                  fontWeight={700}
                  fontFamily="inherit"
                >
                  {initials[0]?.toUpperCase()}
                </text>
              </>
            )

            return avatarContent
          })()}
        </>
      ) : (
        <>
          <circle cx={NODE_W / 2} cy={36} r={24} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="4,4" />
          <g transform={`translate(${NODE_W / 2 - 10}, 26)`} opacity={0.3}>
            <User size={20} color="#fff" />
          </g>
        </>
      )}

      {/* Name */}
      <text
        x={NODE_W / 2} y={72}
        textAnchor="middle"
        fill={isVacant ? "rgba(255,255,255,0.4)" : "#e5e7eb"}
        fontSize={12}
        fontWeight={600}
        fontFamily="inherit"
        pointerEvents="none"
      >
        {isVacant ? 'Poziție Liberă' : node.name}
      </text>

      {/* Role badge (foreignObject for flexbox auto-sizing & icons) */}
      <foreignObject x={0} y={80} width={NODE_W} height={24} pointerEvents="none">
        <div style={{
          display: 'flex', width: '100%', height: '100%',
          alignItems: 'flex-start', justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: `color-mix(in srgb, ${nodeColor} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${nodeColor} 25%, transparent)`,
            borderRadius: '12px',
            padding: '2px 8px 2px 2px',
          }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: `color-mix(in srgb, ${nodeColor} 20%, transparent)`,
              border: `1px solid color-mix(in srgb, ${nodeColor} 50%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: nodeColor
            }}>
              <Shield size={9} strokeWidth={2.5} />
            </div>
            <span style={{
              color: nodeColor,
              fontSize: '7.5px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              transform: 'translateY(0.5px)'
            }}>
              {role?.title?.toUpperCase().replace('_', ' ') || 'STAFF'}
            </span>
          </div>
        </div>
      </foreignObject>

      {/* Responsibilities count pill (attached to top-right of Avatar) */}
      {!isVacant && roleDetails?.responsibilities?.length > 0 && (
        <g transform={`translate(${NODE_W / 2 + 14}, 12)`} style={{ pointerEvents: 'none' }}>
          <rect width="24" height="16" rx="8" fill={nodeColor} stroke="#0f1117" strokeWidth="2.5" />
          <text x="12" y="11.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
            +{roleDetails.responsibilities.length}
          </text>
        </g>
      )}

      {/* Collapse toggle pill */}
      {hasChildren && (
        <g
          transform={`translate(${NODE_W / 2}, ${NODE_H})`}
          onClick={e => { e.stopPropagation(); onCollapse(node.id) }}
        >
          <g className={styles.collapseBtnInner}>
            {/* The Pill itself */}
            <rect
              className={styles.collapsePillBg}
              x={-20} y={-10} width={40} height={20} rx={10}
              style={{ '--node-color': nodeColor }}
            />

            {/* Text (+ or -) */}
            <text
              className={styles.collapsePillText}
              x={0} y={5} textAnchor="middle"
              fill={nodeColor} fontSize="16" fontWeight={800}
              fontFamily="monospace" style={{ userSelect: 'none' }}
            >
              {node.collapsed ? '+' : '−'}
            </text>
          </g>
        </g>
      )}

      {/* Edit Mode Overlay Controls */}
      {isEditMode && !isVacant && (
        <>
          {/* Remove button — top right */}
          <g
            transform={`translate(${NODE_W - 12}, -12)`}
            onClick={(e) => { e.stopPropagation(); kickNode(node.id); }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="12" cy="12" r="14" fill="#0f1117" />
            <circle cx="12" cy="12" r="12" fill="#ef4444" opacity={0.2} stroke="#ef4444" strokeWidth="1" />
            <g transform="translate(5, 5)">
              <Trash2 size={14} color="#ef4444" />
            </g>
          </g>

          {/* Edit button — top left */}
          <g
            transform={`translate(-12, -12)`}
            onClick={(e) => { e.stopPropagation(); onSelect(node); }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="12" cy="12" r="14" fill="#0f1117" />
            <circle cx="12" cy="12" r="12" fill={nodeColor} opacity={0.2} stroke={nodeColor} strokeWidth="1" />
            <g transform="translate(6, 6)">
              <Pencil size={12} color={nodeColor} />
            </g>
          </g>
        </>
      )}
      {isEditMode && isVacant && (
        <g
          transform={`translate(${NODE_W / 2 - 16}, 20)`}
          onClick={(e) => { e.stopPropagation(); onVacantClick(node); }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx="16" cy="16" r="18" fill="#22C55E" opacity={0.2} stroke="#22C55E" strokeWidth="1" />
          <g transform="translate(6, 6)">
            <PlusCircle size={20} color="#22C55E" />
          </g>
        </g>
      )}
    </g>
  )
}

// ─── EDGE (CONNECTOR) ────────────────────────────────────────────────────────
// Uses cubic bezier curves. Anchors are derived from getNodeAnchors() which always
// returns absolute SVG coordinates, perfectly matching the translated node groups.
function Edge({ from, to }) {
  const parentAnchor = getNodeAnchors(from)
  const childAnchor = getNodeAnchors(to)

  const x1 = parentAnchor.bottom.x
  const y1 = parentAnchor.bottom.y
  const x2 = childAnchor.top.x
  const y2 = childAnchor.top.y

  const midY = y1 + (y2 - y1) / 2
  const r = 8 // border radius

  let path = ''
  // If vertically aligned, just draw a straight line
  if (Math.abs(x1 - x2) < 2) {
    path = `M ${x1} ${y1} L ${x2} ${y2}`
  } else {
    // Smooth cubic bezier connector
    path = `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`
  }

  const color = from.role?.color || '#555'

  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeOpacity={0.6}
      className={styles.edge}
    />
  )
}



// ─── LEGEND ───────────────────────────────────────────────────────────────────

// ─── LEGEND ───────────────────────────────────────────────────────────────────
function Legend() {
  const roles = useStore(s => s.roles)
  const tree = useStore(s => s.tree)

  const allMembers = useMemo(() => {
    if (!tree) return []
    return flattenNodes(tree)
  }, [tree])

  return (
    <div className={styles.legend}>
      {roles.map(r => {
        const activeMembers = allMembers.filter(m => m.roleId === r.id && !m.vacant)
        const active = activeMembers.length
        const slotsText = r.maxSlots ? `${active} / ${r.maxSlots}` : active
        return (
          <div key={r.id} className={styles.legendItem} style={{ '--role-color': r.color }}>
            <div className={styles.legendDot}>
              <Shield size={10} />
            </div>
            <span className={styles.legendLabel}>{r.title}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', paddingLeft: 12 }}>{slotsText}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── MINI MAP ─────────────────────────────────────────────────────────────────
function MiniMap({ nodes, bounds, pan, zoom, svgW, svgH, onPan }) {
  const mapW = 160
  const mapH = 100

  const scaleX = mapW / svgW
  const scaleY = mapH / svgH

  const mapNodes = nodes.map(n => ({
    id: n.id,
    x: n.x * scaleX,
    y: n.y * scaleY,
    w: NODE_W * scaleX,
    h: NODE_H * scaleY,
    color: n.role?.color || '#555'
  }))

  const canvasRect = document.querySelector(`.${styles.canvas}`)?.getBoundingClientRect()
  const vW = canvasRect ? canvasRect.width : 800
  const vH = canvasRect ? canvasRect.height : 600

  const viewRect = {
    x: (-pan.x / zoom) * scaleX,
    y: (-pan.y / zoom) * scaleY,
    w: (vW / zoom) * scaleX,
    h: (vH / zoom) * scaleY
  }

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const realX = clickX / scaleX
    const realY = clickY / scaleY

    const newPanX = vW / 2 - realX * zoom
    const newPanY = vH / 2 - realY * zoom
    onPan({ x: newPanX, y: newPanY })
  }

  return (
    <div className={styles.miniMap} onClick={handleMapClick}>
      <svg width={mapW} height={mapH}>
        {mapNodes.map(n => (
          <rect key={n.id} x={n.x} y={n.y} width={n.w} height={n.h} fill={n.color} opacity={0.6} />
        ))}
        <rect
          x={viewRect.x} y={viewRect.y}
          width={viewRect.w} height={viewRect.h}
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
      </svg>
    </div>
  )
}

// ─── ATTRIBUTIONS VIEW ─────────────────────────────────────────────────────
function AttributionsView({ tree, onAvatarClick, roles, roleDetails, isEditMode, updateRoleDetails }) {
  const [expandedResps, setExpandedResps] = useState({})

  // Flatten the raw tree to get all members regardless of collapse state
  const layoutTree = useMemo(() => {
    if (!tree) return null
    return computeLayout(tree, roles)
  }, [tree, roles])

  const allMembers = useMemo(() => {
    if (!layoutTree) return []
    return flattenNodes(layoutTree)
  }, [layoutTree])

  const toggleResp = (respKey) => {
    setExpandedResps(prev => ({
      ...prev,
      [respKey]: !prev[respKey]
    }))
  }

  const mergedRoles = useMemo(() => {
    return roles.map(role => {
      const detail = roleDetails.find(d => d.id === role.id) || {}
      return {
        ...detail,
        ...role, // spread role after detail to keep title and color authoritative
        color: role.color || '#a855f7',
        glow: role.glow || 'rgba(168, 85, 247, 0.55)',
        title: role.title || detail.title || ''
      }
    })
  }, [roles, roleDetails])

  return (
    <div className={styles.attrPage}>
      <div className={styles.attrChartContainer}>
        {mergedRoles.map((role, i) => {
          const membersWithRole = allMembers.filter(m => m.roleId === role.id && !m.vacant)
          const combinedResps = [
            ...(role.responsibilities || []).map((r, i) => ({ type: 'role', originalIndex: i, data: r })),
            ...membersWithRole.flatMap(member =>
              (member.responsibilities || [])
                .filter(r => {
                  const rTitle = typeof r === 'string' ? r : r.title;
                  return !(role.responsibilities || []).some(defaultResp => {
                    const defTitle = typeof defaultResp === 'string' ? defaultResp : defaultResp.title;
                    return defTitle === rTitle;
                  });
                })
                .map(r => ({ type: 'member', member, data: r }))
            )
          ];
          const respsCount = combinedResps.length;

          const handleUpdateStr = (field, val) => {
            if (!updateRoleDetails) return
            updateRoleDetails(role.id, { [field]: val })
          }

          const handleUpdateResp = (idx, field, val) => {
            if (!updateRoleDetails) return
            const newResps = [...role.responsibilities]
            const oldTitle = newResps[idx].title || newResps[idx]
            
            if (typeof newResps[idx] === 'string') {
              newResps[idx] = { title: newResps[idx], detail: '' }
            }
            newResps[idx] = { ...newResps[idx], [field]: val }
            
            if (field === 'title') {
              updateRoleDetails(role.id, { responsibilities: newResps }, oldTitle, val)
            } else {
              updateRoleDetails(role.id, { responsibilities: newResps })
            }
          }

          const handleAddResp = () => {
            if (!updateRoleDetails) return
            const newResps = [...role.responsibilities, { title: 'Nouă responsabilitate', detail: '' }]
            updateRoleDetails(role.id, { responsibilities: newResps })
          }

          const handleDeleteResp = (idx) => {
            if (!updateRoleDetails) return
            const oldTitle = role.responsibilities[idx].title || role.responsibilities[idx]
            const newResps = role.responsibilities.filter((_, i) => i !== idx)
            updateRoleDetails(role.id, { responsibilities: newResps }, oldTitle, null)
          }

          const handleCopyRole = () => {
            const lines = []
            lines.push(`**${role.title}**`)
            if (role.description) lines.push(`\n${role.description}`)
            if (role.requirements) lines.push(`\n*Cerințe: ${role.requirements}*`)
            if (role.responsibilities && role.responsibilities.length > 0) {
              lines.push('\n**Atribuții:**')
              role.responsibilities.forEach(r => {
                lines.push(`- **${r.title || r}**`)
                if (r.detail) lines.push(`  *${r.detail}*`)
              })
            }

            navigator.clipboard.writeText(lines.join('\n')).then(() => {
              // Optional: could show a tiny toast, but native title tooltips work too
            })
          }

          return (
            <div key={role.id} className={styles.attrChartRow}>
              {/* Left: Role Node & Connector Wrapper */}
              <div className={styles.attrChartLeftWrapper}>
                <div
                  className={styles.attrChartRoleBox}
                  style={{ '--role-color': role.color, '--role-glow': role.glow }}
                >
                  <div className={styles.attrChartRoleTitle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.attrChartRoleTitleDot}>
                        <Shield size={16} />
                      </div>
                      {role.title.replace('_', ' ')}
                    </div>
                    <button
                      className={styles.copyRoleBtn}
                      onClick={handleCopyRole}
                      title="Copiază Atribuțiile (Markdown)"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  {isEditMode ? (
                    <textarea
                      className={styles.attrChartRoleDescEdit}
                      value={role.description}
                      onChange={e => handleUpdateStr('description', e.target.value)}
                      placeholder="Descrierea rolului"
                    />
                  ) : (
                    <div className={styles.attrChartRoleDesc}>{role.description}</div>
                  )}

                  {isEditMode ? (
                    <textarea
                      className={styles.attrChartRoleReqEdit}
                      value={role.requirements || ''}
                      onChange={e => handleUpdateStr('requirements', e.target.value)}
                      placeholder="Cerințe"
                    />
                  ) : role.requirements && (
                    <div className={styles.attrChartRoleReq}>{role.requirements}</div>
                  )}

                  {/* Staff Members Avatar Cluster */}
                  {membersWithRole.length > 0 && (
                    <div className={styles.attrStaffCluster}>
                      {membersWithRole.map((member, idx) => (
                        <div
                          key={member.id}
                          className={styles.attrStaffAvatarWrap}
                          style={{ zIndex: membersWithRole.length - idx }}
                          onClick={() => onAvatarClick && onAvatarClick(member)}
                          title={member.name}
                        >
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className={styles.attrStaffAvatarImg} style={{ borderColor: role.color }} />
                          ) : (
                            <div className={styles.attrStaffAvatarInitials} style={{ borderColor: role.color, color: role.color, backgroundColor: `color-mix(in srgb, ${role.color} 10%, #0f1117)` }}>
                              {getInitials(member.name)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Middle: Connector Line */}
                {respsCount > 0 && (
                  <div className={styles.attrChartConnect} style={{ '--role-color': role.color }} />
                )}
              </div>

              {/* Right: Responsibilities Tree */}
              {(respsCount > 0 || isEditMode) && (
                <div className={styles.attrChartRespList} style={{ '--role-color': role.color }}>
                  {combinedResps.map((respItem, displayIdx) => {
                    const resp = respItem.data;
                    const respKey = respItem.type === 'role' ? `${role.id}-role-${respItem.originalIndex}` : `${role.id}-member-${respItem.member.id}-${displayIdx}`;
                    const isExpanded = !!expandedResps[respKey];
                    const respTitle = typeof resp === 'string' ? resp : resp.title;

                    const assignedMembers = membersWithRole.filter(m => {
                      const mResps = m.responsibilities;
                      if (!mResps || mResps.length === 0) return respItem.type === 'role';
                      return mResps.some(mr => (typeof mr === 'string' ? mr : mr.title) === respTitle);
                    });

                    return (
                      <div
                        key={respKey}
                        className={`${styles.attrChartRespItem} ${styles.attrChartRespInteractive}`}
                      >
                        <div className={styles.attrChartRespHeader} onClick={() => !isEditMode && toggleResp(respKey)}>
                          <div className={styles.attrChartDot} />

                          {isEditMode && respItem.type === 'role' ? (
                            <input
                              className={styles.attrChartTextEdit}
                              value={resp.title || resp}
                              onChange={e => handleUpdateResp(respItem.originalIndex, 'title', e.target.value)}
                            />
                          ) : (
                            <span className={styles.attrChartText}>
                              {resp.title || resp}
                            </span>
                          )}
                          <div className={styles.attrChartRespIcon}>
                            {assignedMembers.length > 0 && (
                              <div className={styles.attrRespStaffCluster}>
                                {assignedMembers.map((member, idx) => (
                                  <div
                                    key={member.id}
                                    className={styles.attrRespAvatarWrap}
                                    style={{ zIndex: assignedMembers.length - idx }}
                                    onClick={(e) => { e.stopPropagation(); onAvatarClick && onAvatarClick(member); }}
                                    title={member.name}
                                  >
                                    {member.avatarUrl ? (
                                      <img src={member.avatarUrl} alt={member.name} className={styles.attrStaffAvatarImg} style={{ borderColor: role.color }} />
                                    ) : (
                                      <div className={styles.attrStaffAvatarInitials} style={{ borderColor: role.color, color: role.color, backgroundColor: `color-mix(in srgb, ${role.color} 10%, #0f1117)` }}>
                                        {getInitials(member.name)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {isEditMode && respItem.type === 'role' ? (
                              <button className={styles.deleteRespBtn} onClick={() => handleDeleteResp(respItem.originalIndex)}>
                                <Trash2 size={14} color="#f87171" />
                              </button>
                            ) : isEditMode && respItem.type === 'member' ? (
                              <Lock size={14} color="#6b7280" title="Atribuție specifică membrului. Editează din profilul membrului." />
                            ) : isExpanded ? (
                              <X size={14} />
                            ) : (
                              <PlusCircle size={14} />
                            )}
                          </div>
                        </div>

                        {(isExpanded || (isEditMode && respItem.type === 'role')) && (
                          <div className={styles.attrChartRespDetails}>
                            {isEditMode && respItem.type === 'role' ? (
                              <textarea
                                className={styles.attrChartDetailEdit}
                                value={resp.detail || ''}
                                onChange={e => handleUpdateResp(respItem.originalIndex, 'detail', e.target.value)}
                                placeholder="Detalii..."
                              />
                            ) : (
                              resp.detail || "Detaliile complete și procedurile specifice pentru această responsabilitate vor fi adăugate aici."
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isEditMode && (
                    <button className={styles.addRespBtn} onClick={handleAddResp}>
                      <PlusCircle size={16} style={{ marginRight: 6 }} />
                      Adaugă o responsabilitate nouă
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN ORG CHART PAGE ──────────────────────────────────────────────────────
export default function OrgChart() {
  const { tree, roles, roleDetails, isEditMode, toggleEditMode, moveNode, toggleCollapse, promoteNode, demoteNode, kickNode, updateRoleDetails, patchHistories, syncAvatars, undo, redo, reset, historyStack, historyIndex } = useStore()
  const [view, setView] = useState('chart') // 'chart' | 'attributions' | 'changelog'

  useEffect(() => {
    patchHistories(userHistories)
    syncAvatars()
  }, [patchHistories, syncAvatars])

  const [selected, setSelected] = useState(null)
  const [profileNode, setProfileNode] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomDisplay, setZoomDisplay] = useState(100)
  const [dragging, setDragging] = useState(false)
  const [toasts, setToasts] = useState([])
  const [navHidden, setNavHidden] = useState(false)

  // Keyboard shortcut: backtick ` toggles cinematic mode
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`' && !e.target.matches('input, textarea, select')) {
        setNavHidden(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  // Single source of truth for transform — stored in a ref so wheel/pointer
  // handlers can read and write atomically without React re-render lag.
  const transform = useRef({ x: 60, y: 60, z: 1 })
  const svgRef = useRef(null)  // the outer canvas div
  const innerRef = useRef(null)  // the <svg> element inside it
  const canvasRef = svgRef        // alias kept so export still works
  const dragOrigin = useRef(null)

  // ─── Derived layout data ─────────────────────────────────────────────────────
  const layout = useMemo(() => computeLayout(tree, roles), [tree, roles])
  const nodes = useMemo(() => flattenNodes(layout), [layout])
  const edges = useMemo(() => flattenEdges(layout), [layout])
  const bounds = useMemo(() => getBounds(nodes), [nodes])

  const svgW = bounds.maxX - bounds.minX + 120
  const svgH = bounds.maxY - bounds.minY + 120

  // ─── Apply transform to SVG element directly (no React re-render) ───────────
  const applyTransform = useCallback((t) => {
    transform.current = t
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.z})`
    }
    setZoomDisplay(Math.round(t.z * 100))
  }, [])

  // ─── Fit entire tree into the canvas viewport (also called from Fit button) ─
  const fitToScreen = useCallback(() => {
    const canvas = svgRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const padding = 60
    const scaleX = (rect.width - padding * 2) / svgW
    const scaleY = (rect.height - padding * 2) / svgH
    const newZ = Math.min(scaleX, scaleY, 1.2)
    const newX = (rect.width - svgW * newZ) / 2
    const newY = padding
    applyTransform({ x: newX, y: newY, z: newZ })
  }, [svgW, svgH, applyTransform])

  // ─── Zoom around an arbitrary pivot point ─────────────────────────────────
  const zoomAround = useCallback((pivotX, pivotY, factor) => {
    const t = transform.current
    const newZ = Math.max(0.05, Math.min(5, t.z * factor))
    if (newZ === t.z) return
    // Keep the point under the cursor fixed in screen space:
    // newX = pivotX - (pivotX - t.x) * (newZ / t.z)
    const ratio = newZ / t.z
    applyTransform({
      x: pivotX - (pivotX - t.x) * ratio,
      y: pivotY - (pivotY - t.y) * ratio,
      z: newZ,
    })
  }, [applyTransform])

  // ─── Search auto-pan: pan so the matched node appears centre-screen ──────────
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) return
    const lowerQ = searchQuery.toLowerCase()
    const matchNode = nodes.find(n => n.name.toLowerCase().includes(lowerQ) && !n.vacant)
    if (!matchNode) return
    const canvas = svgRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const t = transform.current
    applyTransform({
      ...t,
      x: rect.width / 2 - (matchNode.x + NODE_W / 2) * t.z,
      y: rect.height / 2 - (matchNode.y + NODE_H / 2) * t.z,
    })
  }, [searchQuery, nodes, applyTransform])

  const handleCollapse = useCallback((id) => {
    toggleCollapse(id)
  }, [toggleCollapse])

  const handleSelect = useCallback((node) => {
    if (isEditMode) {
      setSelected(prev => prev?.id === node.id ? null : node)
    } else {
      setProfileNode(node)
    }
  }, [isEditMode])

  const handleVacantClick = useCallback((node) => {
    // Non-blocking: open Discord link directly (no confirm popup)
    window.open('https://discord.com', '_blank')
  }, [])


  // Auto-fit on first load or restore from URL
  const initialFitDone = useRef(false)
  useEffect(() => {
    if (initialFitDone.current) return
    initialFitDone.current = true

    const params = new URLSearchParams(window.location.search)
    const z = params.get('zoom')
    const px = params.get('x')
    const py = params.get('y')
    if (z && px && py) {
      applyTransform({ z: parseFloat(z), x: parseFloat(px), y: parseFloat(py) })
    } else {
      // Slight delay so the canvas has its final layout dimensions
      const id = setTimeout(fitToScreen, 80)
      return () => clearTimeout(id)
    }
  }, [fitToScreen, applyTransform])



  const handleExport = useCallback(() => {
    if (!canvasRef.current) return
    toPng(canvasRef.current, { cacheBust: true, backgroundColor: '#07070d' })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'wildfire-org-chart.png'
        link.href = dataUrl
        link.click()
        addToast('Chart exported as PNG', 'success')
      })
      .catch((err) => {
        console.error('Failed to export image', err)
        addToast('Export failed', 'error')
      })
  }, [addToast])

  // ─── Wheel zoom ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 0.1) return

      const rect = el.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      // Use a smooth exponential factor based on deltaY magnitude 
      // (handles both standard mouse wheels and trackpads smoothly)
      const factor = Math.exp(-e.deltaY * 0.002)
      zoomAround(cursorX, cursorY, factor)
    }

    const onTouchMove = (e) => {
      if (e.touches.length === 2) e.preventDefault()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [zoomAround, view])

  // ─── Pan (mouse drag) ──────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.button !== 0) return
    setDragging(true)
    const t = transform.current
    dragOrigin.current = { startX: e.clientX, startY: e.clientY, ox: t.x, oy: t.y }
  }
  const onMouseMove = (e) => {
    if (!dragOrigin.current) return
    const d = dragOrigin.current
    const t = transform.current
    applyTransform({ ...t, x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) })
  }
  const onMouseUp = () => {
    dragOrigin.current = null
    setDragging(false)
  }

  // ─── Zoom buttons (± in navbar) ────────────────────────────────────────────
  const handleZoomBtn = (factor) => {
    const canvas = svgRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    zoomAround(rect.width / 2, rect.height / 2, factor)
  }

  return (
    <div className={`${styles.page} ${navHidden ? styles.pageNavHidden : ''}`}>
      <div className={styles.chartBackground} />

      {/* ─── UNIFIED TOP NAVBAR (brand + all tools) ─── */}
      <Navbar
        onOpenSettings={() => setShowSettings(true)}
        view={view}
        setView={setView}
        zoomDisplay={zoomDisplay}
        onZoomIn={() => handleZoomBtn(1.25)}
        onZoomOut={() => handleZoomBtn(1 / 1.25)}
        onFit={fitToScreen}
        onExportPng={handleExport}
        onExportJson={() => {
          const data = JSON.stringify(tree, null, 2)
          const blob = new Blob([data], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'org-tree-export.json'
          a.click()
          addToast('JSON exported', 'success')
        }}
        onImportJson={(e) => {
          const file = e.target.files[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            try {
              const newTree = JSON.parse(ev.target.result)
              if (newTree && newTree.id) {
                useStore.getState().importTree(newTree)
                addToast('Chart imported successfully', 'success')
              } else {
                addToast('Invalid OrgChart JSON structure', 'error')
              }
            } catch (err) {
              addToast('Failed to parse JSON', 'error')
              console.error('Failed to parse JSON', err)
            }
          }
          reader.readAsText(file)
          e.target.value = ''
        }}
        onToggleEditMode={toggleEditMode}
        onUndo={undo}
        onRedo={redo}
        onReset={() => {
          if (confirm('Reset the organization chart to defaults?')) {
            reset()
            addToast('Chart reset to defaults', 'info')
          }
        }}
        historyIndex={historyIndex}
        historyStack={historyStack}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(v => !v)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isHidden={navHidden}
        onToggleNav={() => setNavHidden(v => !v)}
      />

      {/* ─── CINEMATIC REVEAL TAB ─── */}
      <button
        className={`${styles.revealTab} ${navHidden ? styles.revealTabVisible : ''}`}
        onClick={() => setNavHidden(false)}
        title="Show navigation (`)"
        aria-label="Show navigation bar"
      >
        <svg width="16" height="9" viewBox="0 0 16 9" fill="none">
          <path d="M2 2L8 7L14 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ─── CONTENT ─── */}
      <div key={view} className={`${styles.viewWrapper} ${view === 'chart' ? styles.slideFromLeft : styles.slideFromRight}`}>
        {view === 'chart' ? (
          <>
            {/* ─── CANVAS ─── */}
            <div
              ref={svgRef}
              className={`${styles.canvas} ${dragging ? styles.canvasDragging : ''}`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <svg
                ref={innerRef}
                width={svgW}
                height={svgH}
                style={{
                  transformOrigin: '0 0',
                  overflow: 'visible',
                  transform: `translate(${transform.current.x}px, ${transform.current.y}px) scale(${transform.current.z})`
                }}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Edges rendered first so nodes sit on top */}
                <g className={styles.edgesLayer}>
                  {edges.map((e, i) => (
                    <Edge key={`e-${i}`} from={e.from} to={e.to} />
                  ))}
                </g>
                <g className={styles.nodesLayer}>
                  {nodes.map(node => (
                    <OrgNode
                      key={node.id}
                      node={node}
                      onCollapse={handleCollapse}
                      onSelect={handleSelect}
                      selected={selected?.id}
                      searchQuery={searchQuery}
                      onVacantClick={handleVacantClick}
                      isEditMode={isEditMode}
                      moveNode={moveNode}
                      promoteNode={promoteNode}
                      demoteNode={demoteNode}
                      kickNode={kickNode}
                    />
                  ))}
                </g>
              </svg>
            </div>

            {/* Legend */}
            {showLegend && <Legend />}

            {/* Profile Modal (View Mode) */}
            {profileNode && !isEditMode && <ProfileModal node={profileNode} onClose={() => setProfileNode(null)} />}

            {/* Edit Member Modal (Edit Mode — replaces old sidebar + selected panel) */}
            {selected && isEditMode && <EditMemberModal node={selected} onClose={() => setSelected(null)} />}

            {/* Settings Modal — always accessible */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
          </>
        ) : (
          <AttributionsView
            tree={tree}
            onAvatarClick={setProfileNode}
            roles={roles}
            roleDetails={roleDetails}
            isEditMode={isEditMode}
            updateRoleDetails={updateRoleDetails}
          />
        )}
      </div>

      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toasts.map(t => {
          const Icon = t.type === 'success' ? CheckCircle : t.type === 'error' ? AlertCircle : Info
          return (
            <div key={t.id} className={`${styles.toast} ${styles['toast' + t.type.charAt(0).toUpperCase() + t.type.slice(1)]}`}>
              <Icon size={16} />
              {t.message}
            </div>
          )
        })}
      </div>
    </div>
  )
}
