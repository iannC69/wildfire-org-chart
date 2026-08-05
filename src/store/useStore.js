import { create } from 'zustand'
import { ORG_TREE, INITIAL_ROLES_DATA, ROLES as INITIAL_ROLES } from '../data/staffData'
import INITIAL_ROLE_DETAILS from '../data/roleDetails.json'

// Recursive helper to move a node in the tree
function removeNode(tree, id) {
  if (!tree.children) return tree;
  const filtered = tree.children.filter(c => c.id !== id);
  const nextChildren = filtered.map(c => removeNode(c, id));
  return { ...tree, children: nextChildren };
}

// Removes a node but hoists its children to the parent
function removeAndHoistNode(tree, id) {
  if (!tree.children) return tree;
  
  const targetIndex = tree.children.findIndex(c => c.id === id);
  if (targetIndex !== -1) {
    const target = tree.children[targetIndex];
    const hoistedChildren = target.children || [];
    const nextChildren = [
      ...tree.children.slice(0, targetIndex),
      ...tree.children.slice(targetIndex + 1),
      ...hoistedChildren
    ];
    return { ...tree, children: nextChildren };
  }
  
  return { ...tree, children: tree.children.map(c => removeAndHoistNode(c, id)) };
}

export function flattenNodes(node) {
  const nodes = [node]
  for (const child of node.children || []) {
    nodes.push(...flattenNodes(child))
  }
  return nodes
}

const savedPrefs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wildfire_prefs') || 'null') : null;
const initialPrefs = savedPrefs || { vacantName: 'Poziție Liberă', vacantAvatar: null };

function enrichTreeWithData(treeNode, rolesData, prefs = initialPrefs) {
  let enriched = { ...treeNode };
  for (const role of rolesData) {
    const member = role.members.find(m => m.name.toLowerCase() === treeNode.name.toLowerCase() || m.id === treeNode.id);
    if (member) {
      // Only fill in fields that are missing/null on the tree node
      if (!enriched.avatarUrl) enriched.avatarUrl = member.avatarUrl || null;
      if (!enriched.steamLink) enriched.steamLink = member.steamLink || null;
      if (!enriched.responsibilities) enriched.responsibilities = member.responsibilities || [];
      if (!enriched.joinDate) enriched.joinDate = member.joinDate || 'N/A';
      if (!enriched.status) enriched.status = member.status || 'offline';
      break;
    }
  }
  // Ensure default responsibilities if missing
  if (!enriched.responsibilities) enriched.responsibilities = [];

  // Apply vacant preferences if this node is vacant
  if (enriched.vacant || enriched.id.startsWith('vacant-')) {
    enriched.name = prefs.vacantName;
    enriched.avatarUrl = prefs.vacantAvatar;
    enriched.vacant = true;
  }
  
  if (enriched.children) {
    enriched.children = enriched.children.map(c => enrichTreeWithData(c, rolesData, prefs));
  }
  return enriched;
}

function findNode(tree, id) {
  if (tree.id === id) return tree;
  for (const child of tree.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

function insertNode(tree, parentId, nodeToInsert) {
  if (tree.id === parentId) {
    return { ...tree, children: [...(tree.children || []), nodeToInsert] };
  }
  return { ...tree, children: (tree.children || []).map(c => insertNode(c, parentId, nodeToInsert)) };
}

function collapseNodeRec(node, id) {
  if (node.id === id) {
    return { ...node, collapsed: !node.collapsed };
  }
  if (!node.children) return node;
  return { ...node, children: node.children.map(c => collapseNodeRec(c, id)) };
}

function updateNodeRole(node, id, newRoleObj) {
  if (node.id === id) {
    return { ...node, role: newRoleObj.title, roleId: newRoleObj.id };
  }
  if (!node.children) return node;
  return { ...node, children: node.children.map(c => updateNodeRole(c, id, newRoleObj)) };
}

function updateNodeField(node, id, field, value) {
  if (node.id === id) {
    return { ...node, [field]: value };
  }
  if (!node.children) return node;
  return { ...node, children: node.children.map(c => updateNodeField(c, id, field, value)) };
}

const savedLog = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wildfire_audit_log') || 'null') : null;
const initialLog = savedLog || [];

const savedArchive = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wildfire_archived_admins') || 'null') : null;
const initialArchive = savedArchive || [];

export const useStore = create((set, get) => {
      // Pure helper to append log without triggering a nested set()
      const appendGlobalLog = (state, message, targetAvatar = null, overrideBy = null, overrideDate = null) => {
        const finalBy = overrideBy || state.adminName || 'Console';
        // Find avatar for 'by' (adminName)
        const allMembers = flattenNodes([state.tree]);
        const byMember = allMembers.find(m => m.name === finalBy);
        const byAvatar = byMember?.avatarUrl || null;

        const newEntry = {
          id: Date.now() + Math.random(),
          date: overrideDate ? new Date(overrideDate).toISOString() : new Date().toISOString(),
          message,
          by: finalBy,
          targetAvatar,
          byAvatar
        };
        const newLog = [newEntry, ...(state.globalLog || [])].slice(0, 100);
        if (typeof window !== 'undefined') {
          localStorage.setItem('wildfire_audit_log', JSON.stringify(newLog));
        }
        return { globalLog: newLog };
      };

      const addGlobalLog = (message, targetAvatar = null, overrideBy = null) => {
        set(state => appendGlobalLog(state, message, targetAvatar, overrideBy));
      };

      const pushHistory = (state) => {
        let newStack = (state.historyStack || []).slice(0, state.historyIndex + 1);
        newStack.push({ tree: state.tree, roles: state.roles, roleDetails: state.roleDetails });
        
        // Limit history to 30 items
        if (newStack.length > 30) {
          newStack = newStack.slice(newStack.length - 30);
        }
        
        return { historyStack: newStack, historyIndex: newStack.length - 1 };
      };

      return {
        addGlobalLog, // Export the function
        globalLog: initialLog,
        archivedAdmins: initialArchive,
        tree: enrichTreeWithData(ORG_TREE, INITIAL_ROLES_DATA),
        rolesData: INITIAL_ROLES_DATA,
        roles: INITIAL_ROLES,
        roleDetails: INITIAL_ROLE_DETAILS,
        isEditMode: false,
        adminName: 'Console',
        vacantName: initialPrefs.vacantName,
        vacantAvatar: initialPrefs.vacantAvatar,
        
        promptConfig: null,
        requestPrompt: (title, description, placeholderOrOptions, optionsObj = {}) => new Promise((resolve) => {
          const isOptions = placeholderOrOptions && typeof placeholderOrOptions === 'object';
          const placeholder = isOptions ? undefined : placeholderOrOptions;
          const options = isOptions ? placeholderOrOptions : optionsObj;
          
          set({ 
            promptConfig: { 
              title, 
              description, 
              placeholder, 
              options,
              onConfirm: (val) => {
                set({ promptConfig: null })
                resolve(val)
              },
              onCancel: () => {
                set({ promptConfig: null })
                resolve(null)
              }
            } 
          })
        }),

        setAdminName: (name) => set({ adminName: name }),
        setVacantPrefs: (name, avatar) => set(state => {
          const newPrefs = { vacantName: name || 'Poziție Liberă', vacantAvatar: avatar || null };
          if (typeof window !== 'undefined') {
            localStorage.setItem('wildfire_prefs', JSON.stringify(newPrefs));
          }
          // We must also recursively update all existing vacant nodes in the tree
          const updateVacantNodes = (node) => {
            if (node.vacant || node.id.startsWith('vacant-')) {
              return { ...node, name: newPrefs.vacantName, avatarUrl: newPrefs.vacantAvatar };
            }
            if (!node.children) return node;
            return { ...node, children: node.children.map(updateVacantNodes) };
          };
          return { ...newPrefs, tree: updateVacantNodes(state.tree) };
        }),
        historyStack: [],
        historyIndex: -1,

        undo: () => set(state => {
          if (state.historyIndex <= 0) return state;
          const newIndex = state.historyIndex - 1;
          const restoredState = state.historyStack[newIndex];
          return { ...restoredState, historyIndex: newIndex };
        }),

        redo: () => set(state => {
          if (state.historyIndex >= (state.historyStack || []).length - 1) return state;
          const newIndex = state.historyIndex + 1;
          const restoredState = state.historyStack[newIndex];
          return { ...restoredState, historyIndex: newIndex };
        }),

        reset: async () => {
          try {
            const res = await fetch('/api/reset-to-default');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            set(state => {
              const historyUpdate = pushHistory(state);
              return {
                tree: data.tree,
                roles: data.roles,
                roleDetails: data.roleDetails,
                rolesData: data.rolesData,
                ...historyUpdate
              };
            });
          } catch (err) {
            console.error('Reset failed, falling back to bundled defaults', err);
            set(state => {
              const historyUpdate = pushHistory(state);
              return {
                tree: enrichTreeWithData(ORG_TREE, INITIAL_ROLES_DATA),
                roles: INITIAL_ROLES,
                roleDetails: INITIAL_ROLE_DETAILS,
                ...historyUpdate
              };
            });
          }
        },

        toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),

        updateRoleDetails: (roleId, updates, oldTitle = null, newTitle = null) => set(state => {
          const historyUpdate = pushHistory(state);
          
          let newTree = state.tree;
          if (oldTitle) {
            // Helper to recursively update or delete responsibilities in the tree
            const updateTreeResps = (node) => {
              let updatedNode = { ...node };
              if (updatedNode.roleId === roleId && updatedNode.responsibilities) {
                if (newTitle === null) {
                  // Delete it
                  updatedNode.responsibilities = updatedNode.responsibilities.filter(r => r !== oldTitle);
                } else if (oldTitle !== newTitle) {
                  // Rename it
                  updatedNode.responsibilities = updatedNode.responsibilities.map(r => r === oldTitle ? newTitle : r);
                }
              }
              if (updatedNode.children) {
                updatedNode.children = updatedNode.children.map(child => updateTreeResps(child));
              }
              return updatedNode;
            };
            newTree = updateTreeResps(newTree);
          }

          return {
            tree: newTree,
            roleDetails: state.roleDetails.map(r => r.id === roleId ? { ...r, ...updates } : r),
            ...historyUpdate
          };
        }),

        updateRole: (roleId, updates) => set(state => {
          const historyUpdate = pushHistory(state);
          return {
            roles: state.roles.map(r => r.id === roleId ? { ...r, ...updates } : r),
            ...historyUpdate
          };
        }),

        addRole: (newRole) => set(state => {
          const historyUpdate = pushHistory(state);
          const roleId = newRole.id || `role-${Date.now()}`;
          const role = { id: roleId, title: 'New Role', color: '#888888', glow: 'rgba(136,136,136,0.5)', rank: 10, maxSlots: null, ...newRole };
          return {
            roles: [...state.roles, role],
            roleDetails: [...state.roleDetails, { id: roleId, responsibilities: [] }],
            ...historyUpdate
          };
        }),

        deleteRole: (roleId) => set(state => {
          const historyUpdate = pushHistory(state);
          return {
            roles: state.roles.filter(r => r.id !== roleId),
            roleDetails: state.roleDetails.filter(r => r.id !== roleId),
            ...historyUpdate
          };
        }),
        
        toggleCollapse: (id) => set(state => ({
          tree: collapseNodeRec(state.tree, id)
        })),

        moveNode: (draggedId, newParentId) => set(state => {
          if (draggedId === newParentId) return state; // can't drop on self
          const node = findNode(state.tree, draggedId);
          if (!node) return state;
          
          // Prevent dropping node into its own children (cycle)
          const isDescendant = findNode(node, newParentId);
          if (isDescendant) return state;

          const historyUpdate = pushHistory(state);
          let newTree = removeNode(state.tree, draggedId);
          newTree = insertNode(newTree, newParentId, node);
          return { tree: newTree, ...historyUpdate };
        }),

        moveMultipleNodes: (draggedIds, newParentId) => set(state => {
          if (!draggedIds || draggedIds.length === 0) return state;
          
          let newTree = state.tree;
          let movedCount = 0;
          const historyUpdate = pushHistory(state);

          for (const draggedId of draggedIds) {
            if (draggedId === newParentId) continue;
            const node = findNode(newTree, draggedId);
            if (!node) continue;
            
            // Prevent cycle
            if (findNode(node, newParentId)) continue;
            
            newTree = removeNode(newTree, draggedId);
            newTree = insertNode(newTree, newParentId, node);
            movedCount++;
          }
          
          if (movedCount > 0) {
            return { tree: newTree, ...historyUpdate };
          }
          return state;
        }),

        importTree: (newTree) => set(state => {
          const historyUpdate = pushHistory(state);
          return { tree: newTree, ...historyUpdate };
        }),

        promoteNode: (nodeId) => set(state => {
          const node = findNode(state.tree, nodeId);
          if (!node) return state;
          const currentRole = state.roles.find(r => r.id === node.roleId);
          if (!currentRole) return state;
          
          const higherRankRoles = state.roles.filter(r => r.rank < currentRole.rank);
          if (higherRankRoles.length === 0) return state; // already top
          higherRankRoles.sort((a,b) => b.rank - a.rank);
          const newRole = higherRankRoles[0];

          const historyUpdate = pushHistory(state);
          let newTree = updateNodeRole(state.tree, nodeId, newRole);
          
          const logUpdate = appendGlobalLog(state, `Promoted ${node.name} from ${currentRole.title} to ${newRole.title}`, node.avatarUrl);

          // Add history
          const historyEntry = {
            date: new Date().toISOString(),
            action: 'Promoted',
            fromRole: currentRole.title,
            toRole: newRole.title,
            by: state.adminName || 'Console'
          };
          newTree = updateNodeField(newTree, nodeId, 'history', [...(node.history || []), historyEntry]);
    
    // Auto-reparent to a node with rank < newRole.rank
    let bestParent = null;
    function searchParent(n) {
      if (n.id === nodeId) return; // skip self and children
      const role = state.roles.find(r => r.id === n.roleId);
      if (role && role.rank < newRole.rank) {
        if (!bestParent || role.rank > state.roles.find(r => r.id === bestParent.roleId).rank) {
          bestParent = n;
        }
      }
      for (const child of n.children || []) searchParent(child);
    }
    searchParent(newTree);

    if (bestParent) {
      const updatedNode = findNode(newTree, nodeId);
      newTree = removeNode(newTree, nodeId);
      newTree = insertNode(newTree, bestParent.id, updatedNode);
    }

    return { tree: newTree, ...historyUpdate };
  }),

  demoteNode: (nodeId) => set(state => {
    const node = findNode(state.tree, nodeId);
    if (!node) return state;
    const currentRole = state.roles.find(r => r.id === node.roleId);
    if (!currentRole) return state;
    
    const lowerRankRoles = state.roles.filter(r => r.rank > currentRole.rank);
    if (lowerRankRoles.length === 0) return state; // already bottom
    lowerRankRoles.sort((a,b) => a.rank - b.rank);
    const newRole = lowerRankRoles[0];

          const historyUpdate = pushHistory(state);
          let newTree = updateNodeRole(state.tree, nodeId, newRole);
          
          const logUpdate = appendGlobalLog(state, `Demoted ${node.name} from ${currentRole.title} to ${newRole.title}`, node.avatarUrl);

          // Add history
          const historyEntry = {
            date: new Date().toISOString(),
            action: 'Demoted',
            fromRole: currentRole.title,
            toRole: newRole.title,
            by: state.adminName || 'Console'
          };
          newTree = updateNodeField(newTree, nodeId, 'history', [...(node.history || []), historyEntry]);
          
          // Auto-reparent to a node with rank < newRole.rank
          let bestParent = null;
          function searchParent(n) {
            if (n.id === nodeId) return; // skip self and children
            const role = state.roles.find(r => r.id === n.roleId);
            if (role && role.rank < newRole.rank) {
              if (!bestParent || role.rank > state.roles.find(r => r.id === bestParent.roleId).rank) {
                bestParent = n;
              }
            }
            for (const child of n.children || []) searchParent(child);
          }
          searchParent(newTree);

          if (bestParent) {
            const updatedNode = findNode(newTree, nodeId);
            newTree = removeNode(newTree, nodeId);
            newTree = insertNode(newTree, bestParent.id, updatedNode);
          }

          return { tree: newTree, ...historyUpdate, ...logUpdate };
        }),

        kickNode: (nodeId, reason, adminName, dateOverride) => set(state => {
          const node = findNode(state.tree, nodeId);
          if (!node) return state;

          const role = state.roles.find(r => r.id === node.roleId);
          
          const reasonText = reason ? ` - Reason: ${reason}` : '';
          const logUpdate = appendGlobalLog(state, `Removed member ${node.name} (${role?.title || ''})${reasonText}`, node.avatarUrl, adminName, dateOverride);

          const historyUpdate = pushHistory(state);
          let newTree = state.tree;

          const replaceWithVacant = (t) => {
            if (t.id === nodeId) {
              return { ...t, name: state.vacantName || 'Poziție Liberă', vacant: true, avatarUrl: state.vacantAvatar || null, id: `vacant-${Date.now()}`, children: t.children || [] };
            }
            if (!t.children) return t;
            return { ...t, children: t.children.map(c => replaceWithVacant(c)) };
          }

          if (node.vacant) {
            if (node.children && node.children.length > 0) {
              // Hoist children up to grandparent, then remove the vacant node
              newTree = removeAndHoistNode(state.tree, nodeId);
            } else {
              newTree = removeAndHoistNode(state.tree, nodeId);
            }
            return { tree: newTree, ...historyUpdate };
          }

          // Save to archive
          const archivedNode = { ...node, children: [], archivedAt: new Date().toISOString() };
          const newArchive = [archivedNode, ...(state.archivedAdmins || [])];
          if (typeof window !== 'undefined') {
            localStorage.setItem('wildfire_archived_admins', JSON.stringify(newArchive));
          }
          
          if ((role && role.maxSlots !== null) || (node.children && node.children.length > 0)) {
            newTree = replaceWithVacant(state.tree);
          } else {
            newTree = removeAndHoistNode(state.tree, nodeId);
          }
          
          return { tree: newTree, archivedAdmins: newArchive, ...historyUpdate, ...logUpdate };
        }),

        restoreNode: (adminId) => set(state => {
          const admin = state.archivedAdmins.find(a => a.id === adminId);
          if (!admin) return state;

          const newArchive = state.archivedAdmins.filter(a => a.id !== adminId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('wildfire_archived_admins', JSON.stringify(newArchive));
          }

          const restoredAdmin = { ...admin };
          delete restoredAdmin.archivedAt;

          // Push history log for restoration
          const logUpdate = appendGlobalLog(state, `Restored member ${admin.name} from archive`, admin.avatarUrl);

          const historyUpdate = pushHistory(state);
          
          // Restore to root node by default
          const newTree = insertNode(state.tree, state.tree.id, restoredAdmin);

          return { tree: newTree, archivedAdmins: newArchive, ...historyUpdate, ...logUpdate };
        }),

        recoverLostAdmins: () => set(state => {
          let newTree = state.tree;
          let recoveredCount = 0;

          // Build maps of the original structure
          const originalParentMap = {};
          const originalNodeMap = {};
          function buildMaps(node, parentName) {
            originalNodeMap[node.name] = node;
            if (parentName) originalParentMap[node.name] = parentName;
            for (const c of node.children || []) buildMaps(c, node.name);
          }
          buildMaps(ORG_TREE, null);

          // Helper to find node in current tree (finds by ID or Name)
          const findInTree = (t, id, name) => {
            if (t.id === id || t.name === name) return t;
            for (const c of t.children || []) {
              const res = findInTree(c, id, name);
              if (res) return res;
            }
            return null;
          };

          const spawnedVacants = {};

          // Recursive function to ensure a node's original parent exists in the tree
          function ensureParentExists(originalParentName) {
            if (!originalParentName) return state.tree.id; // root

            let parentInCurrentTree = findInTree(newTree, null, originalParentName);
            if (parentInCurrentTree) return parentInCurrentTree.id;

            if (spawnedVacants[originalParentName]) return spawnedVacants[originalParentName];

            // Parent doesn't exist, we must spawn a vacant position!
            const originalParentNode = originalNodeMap[originalParentName];
            if (!originalParentNode) return state.tree.id;

            // Ensure the grandparent exists before inserting this vacant parent
            const grandparentTargetId = ensureParentExists(originalParentMap[originalParentName]);

            const vacantId = `vacant-${originalParentNode.id}-${Date.now()}`;
            const vacantNode = {
              id: vacantId,
              name: state.vacantName || 'Poziție Liberă',
              roleId: originalParentNode.roleId,
              vacant: true,
              avatarUrl: state.vacantAvatar || null,
              children: []
            };

            newTree = insertNode(newTree, grandparentTargetId, vacantNode);
            spawnedVacants[originalParentName] = vacantId;
            return vacantId;
          }

          // First, let's recover any missing admins
          const allCurrentNodes = flattenNodes(newTree);
          const toRecover = [];
          
          INITIAL_ROLES_DATA.forEach(roleGroup => {
            roleGroup.members.forEach(member => {
              const existsInTree = findInTree(newTree, member.id, member.name);
              const existsInArchive = state.archivedAdmins.some(n => n.id === member.id || n.name === member.name);
              
              if (!existsInTree && !existsInArchive) {
                toRecover.push(member);
              }
            });
          });

          // Recover missing admins into their proper places
          toRecover.forEach(member => {
            const originalParentName = originalParentMap[member.name];
            const targetParentId = ensureParentExists(originalParentName);

            const recoveredMember = {
              ...member,
              roleId: originalNodeMap[member.name]?.roleId || 'helper',
              children: []
            };
            newTree = insertNode(newTree, targetParentId, recoveredMember);
            recoveredCount++;
          });

          // Second, FIX the ones that were already mistakenly recovered to the root in the previous version!
          const currentRootChildren = newTree.children || [];
          const nodesToMove = [];
          
          currentRootChildren.forEach(child => {
            const origParentName = originalParentMap[child.name];
            if (origParentName && origParentName !== newTree.name && !child.vacant) {
              nodesToMove.push({ childId: child.id, origParentName });
            }
          });

          nodesToMove.forEach(({ childId, origParentName }) => {
            const targetParentId = ensureParentExists(origParentName);
            const nodeToMove = findInTree(newTree, childId, null);
            if (nodeToMove && targetParentId !== newTree.id) {
              newTree = removeNode(newTree, childId);
              // Fix roleId
              const correctRoleId = originalNodeMap[nodeToMove.name]?.roleId;
              if (correctRoleId) nodeToMove.roleId = correctRoleId;
              
              newTree = insertNode(newTree, targetParentId, nodeToMove);
              recoveredCount++;
            }
          });

          if (recoveredCount > 0) {
            const historyUpdate = pushHistory(state);
            return { tree: newTree, ...historyUpdate };
          }
          return state;
        }),

        deleteArchivedAdmin: (adminId) => set(state => {
          const newArchive = state.archivedAdmins.filter(a => a.id !== adminId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('wildfire_archived_admins', JSON.stringify(newArchive));
          }
          return { archivedAdmins: newArchive };
        }),

        clearArchive: () => set(state => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('wildfire_archived_admins', JSON.stringify([]));
          }
          return { archivedAdmins: [] };
        }),

        updateNodeAvatarUrl: (id, url) => set(state => {
          const historyUpdate = pushHistory(state);
          return {
            tree: updateNodeField(state.tree, id, 'avatarUrl', url),
            ...historyUpdate
          };
        }),

        updateNodeSteam: (id, url, link) => set(state => {
          const historyUpdate = pushHistory(state);
          let newTree = updateNodeField(state.tree, id, 'avatarUrl', url);
          newTree = updateNodeField(newTree, id, 'steamLink', link);
          return { tree: newTree, ...historyUpdate };
        }),

        setNodeRole: (nodeId, roleId) => set(state => {
          const role = state.roles.find(r => r.id === roleId);
          if (!role) return state;

          const node = findNode(state.tree, nodeId);
          let newTree = state.tree;
          let logUpdate = {};
          
          const targetAvatar = node?.avatarUrl || null;
          let changedRole = false;

          if (node && node.roleId !== roleId) {
            changedRole = true;
            const oldRoleObj = state.roles.find(r => r.id === node.roleId);
            const oldRole = oldRoleObj?.title || 'Unknown';
            const oldRank = oldRoleObj?.rank || 999;
            const newRank = role.rank || 999;
            
            const sortedUniqueRanks = [...new Set(state.roles.map(r => r.rank))].sort((a, b) => b - a);
            const oldIndex = sortedUniqueRanks.indexOf(oldRank);
            const newIndex = sortedUniqueRanks.indexOf(newRank);
            
            let action = 'Promoted';
            if (newIndex > oldIndex) {
              action = 'Promoted';
            } else if (newIndex < oldIndex) {
              action = 'Demoted';
            }
            
            logUpdate = appendGlobalLog(state, `${action} member ${node.name} from ${oldRole} to ${role.title}`, targetAvatar);

            const historyEntry = {
              date: new Date().toISOString(),
              action: action,
              fromRole: oldRole,
              toRole: role.title,
              by: state.adminName || 'Console'
            };
            newTree = updateNodeField(newTree, nodeId, 'history', [...(node.history || []), historyEntry]);
          }

          const historyUpdate = pushHistory(state);
          newTree = updateNodeRole(newTree, nodeId, role);

          if (changedRole) {
            // Find current parent
            let currentParent = null;
            function findParentTarget(tree, targetId, parent = null) {
              if (tree.id === targetId) return parent;
              for (const child of tree.children || []) {
                const found = findParentTarget(child, targetId, tree);
                if (found) return found;
              }
              return null;
            }
            currentParent = findParentTarget(newTree, nodeId);

            if (currentParent) {
              const currentParentRole = state.roles.find(r => r.id === currentParent.roleId);
              // We want to find the optimal parent rank (closest to role.rank but strictly less)
            }

            let candidates = [];
            function gatherCandidates(n) {
              if (n.id === nodeId) return; // skip self
              const pRole = state.roles.find(r => r.id === n.roleId);
              if (pRole && pRole.rank < role.rank) {
                candidates.push({ node: n, rank: pRole.rank });
              }
              for (const child of n.children || []) gatherCandidates(child);
            }
            gatherCandidates(newTree);

            if (candidates.length > 0) {
              const maxRank = Math.max(...candidates.map(c => c.rank));
              const bestCandidates = candidates.filter(c => c.rank === maxRank);
              
              let chosenParent = bestCandidates[0].node;
              // If currentParent is already one of the optimal candidates, stay there
              if (currentParent && bestCandidates.some(c => c.node.id === currentParent.id)) {
                chosenParent = currentParent;
              }

              if (chosenParent.id !== currentParent?.id) {
                const updatedNode = findNode(newTree, nodeId);
                newTree = removeNode(newTree, nodeId);
                newTree = insertNode(newTree, chosenParent.id, updatedNode);
              }
            }
          }

          return { tree: newTree, ...historyUpdate, ...logUpdate };
        }),

        updateNodeDetails: (id, updates) => set(state => {
          const historyUpdate = pushHistory(state);
          let newTree = state.tree;
          
          const node = findNode(newTree, id);
          let changedRole = false;
          let newRoleObj = null;

          if (node && updates.roleId && updates.roleId !== node.roleId) {
            changedRole = true;
            newRoleObj = state.roles.find(r => r.id === updates.roleId);
            
            const oldRoleObj = state.roles.find(r => r.id === node.roleId);
            const oldRole = oldRoleObj?.title || 'Unknown';
            const oldRank = oldRoleObj?.rank || 999;
            const newRole = newRoleObj?.title || 'Unknown';
            const newRank = newRoleObj?.rank || 999;
            
            const sortedUniqueRanks = [...new Set(state.roles.map(r => r.rank))].sort((a, b) => b - a);
            const oldIndex = sortedUniqueRanks.indexOf(oldRank);
            const newIndex = sortedUniqueRanks.indexOf(newRank);
            
            let action = 'Promoted';
            if (newIndex > oldIndex) {
              action = 'Promoted';
            } else if (newIndex < oldIndex) {
              action = 'Demoted';
            }
            
            const historyEntry = {
              date: new Date().toISOString(),
              action: action,
              fromRole: oldRole,
              toRole: newRole,
              by: state.adminName || 'Console'
            };
            
            // If they didn't manually pass a history array in updates, create one
            if (!updates.history) {
              updates.history = [...(node.history || []), historyEntry];
            }
            
            // Ensure title string stays in sync
            updates.role = newRole;
          }

          for (const [key, value] of Object.entries(updates)) {
            newTree = updateNodeField(newTree, id, key, value);
          }
          
          // Auto-reparent logic
          if (changedRole && newRoleObj) {
            let currentParent = null;
            function findParentTarget(tree, targetId, parent = null) {
              if (tree.id === targetId) return parent;
              for (const child of tree.children || []) {
                const found = findParentTarget(child, targetId, tree);
                if (found) return found;
              }
              return null;
            }
            currentParent = findParentTarget(newTree, id);

            let candidates = [];
            function gatherCandidates(n) {
              if (n.id === id) return; // skip self
              const pRole = state.roles.find(r => r.id === n.roleId);
              if (pRole && pRole.rank < newRoleObj.rank) {
                candidates.push({ node: n, rank: pRole.rank });
              }
              for (const child of n.children || []) gatherCandidates(child);
            }
            gatherCandidates(newTree);

            if (candidates.length > 0) {
              const maxRank = Math.max(...candidates.map(c => c.rank));
              const bestCandidates = candidates.filter(c => c.rank === maxRank);
              
              let chosenParent = bestCandidates[0].node;
              if (currentParent && bestCandidates.some(c => c.node.id === currentParent.id)) {
                chosenParent = currentParent;
              }

              if (chosenParent.id !== currentParent?.id) {
                const updatedNode = findNode(newTree, id);
                newTree = removeNode(newTree, id);
                newTree = insertNode(newTree, chosenParent.id, updatedNode);
              }
            }
          }

          return { tree: newTree, ...historyUpdate };
        }),

        addNode: (parentId, newNode) => set(state => {
          const historyUpdate = pushHistory(state);

          // Check if parent has a vacant child with the same roleId — if so, replace it
          function replaceVacantOrInsert(tree) {
            if (tree.id === parentId) {
              const vacantIdx = (tree.children || []).findIndex(
                c => c.vacant && c.roleId === newNode.roleId
              );
              if (vacantIdx !== -1) {
                // Replace vacant, inheriting its children
                const vacantNode = tree.children[vacantIdx];
                const replacedNode = { ...newNode, children: [...(vacantNode.children || []), ...(newNode.children || [])] };
                const newChildren = [
                  ...tree.children.slice(0, vacantIdx),
                  replacedNode,
                  ...tree.children.slice(vacantIdx + 1)
                ];
                return { ...tree, children: newChildren };
              }
              // No matching vacant — just insert normally
              return { ...tree, children: [...(tree.children || []), newNode] };
            }
            if (!tree.children) return tree;
            return { ...tree, children: tree.children.map(c => replaceVacantOrInsert(c)) };
          }

          return { tree: replaceVacantOrInsert(state.tree), ...historyUpdate };
        }),

        patchHistories: (histories) => set(state => {
          let newTree = state.tree;
          let migrated = false;
          
          // flatten to find by name easily
          const allNodes = flattenNodes(newTree);
          
          Object.keys(histories).forEach(name => {
            // Find node loosely by matching name prefix or exact to handle cases like "Spark (Ultra)"
            const node = allNodes.find(n => n.name.includes(name));
            if (node) {
              // Only update if the history is actually different/missing
              if (JSON.stringify(node.history) !== JSON.stringify(histories[name])) {
                newTree = updateNodeField(newTree, node.id, 'history', histories[name]);
                migrated = true;
              }
            }
          });
          
          if (!migrated) return state;
          const historyUpdate = pushHistory(state);
          return { tree: newTree, ...historyUpdate };
        }),

        syncAvatars: async () => {
          const state = get();
          const allNodes = flattenNodes(state.tree);
          
          const promises = allNodes.map(async (node) => {
            if (!node.steamLink || node.vacant || node.id === 'vacant') return null;
            try {
              const res = await fetch(`/api/steam-avatar?url=${encodeURIComponent(node.steamLink)}`);
              if (!res.ok) return null;
              const data = await res.json();
              if (data.avatarUrl && data.avatarUrl !== node.avatarUrl) {
                return { id: node.id, avatarUrl: data.avatarUrl };
              }
            } catch (err) {
              console.error('Failed to sync avatar for', node.name, err);
            }
            return null;
          });
          
          const results = await Promise.all(promises);
          const updates = results.filter(Boolean);
          
          if (updates.length > 0) {
            set(state => {
              let newTree = state.tree;
              for (const update of updates) {
                newTree = updateNodeField(newTree, update.id, 'avatarUrl', update.avatarUrl);
              }
              return { tree: newTree }; // triggers auto-save to disk via subscribe
            });
          }
        },

        loadPreset: (presetState) => set(state => {
          return {
            tree: presetState.tree || state.tree,
            roles: presetState.roles || state.roles,
            roleDetails: presetState.roleDetails || state.roleDetails,
            archivedAdmins: presetState.archivedAdmins || state.archivedAdmins,
            globalLog: presetState.globalLog || state.globalLog
          };
        })
      };
    }
);

let saveTimeout = null;
useStore.subscribe((state, prevState) => {
  if (
    state.tree !== prevState.tree ||
    state.roles !== prevState.roles ||
    state.roleDetails !== prevState.roleDetails
  ) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      fetch('/api/save-disk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tree: state.tree,
          roles: state.roles,
          rolesData: state.rolesData,
          roleDetails: state.roleDetails
        })
      }).catch(err => console.error('Failed to sync to disk', err));
    }, 1500); // 1.5s debounce
  }
});
