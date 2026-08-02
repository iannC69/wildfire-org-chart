import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ORG_TREE, INITIAL_ROLES_DATA, ROLES as INITIAL_ROLES } from '../data/staffData'
import INITIAL_ROLE_DETAILS from '../data/roleDetails.json'

// Recursive helper to move a node in the tree
function removeNode(tree, id) {
  if (!tree.children) return tree;
  const filtered = tree.children.filter(c => c.id !== id);
  const nextChildren = filtered.map(c => removeNode(c, id));
  return { ...tree, children: nextChildren };
}

export function flattenNodes(node) {
  const nodes = [node]
  for (const child of node.children || []) {
    nodes.push(...flattenNodes(child))
  }
  return nodes
}

function enrichTreeWithData(treeNode, rolesData) {
  let enriched = { ...treeNode };
  for (const role of rolesData) {
    const member = role.members.find(m => m.name.toLowerCase() === treeNode.name.toLowerCase() || m.id === treeNode.id);
    if (member) {
      enriched.avatarUrl = member.avatarUrl || null;
      enriched.steamLink = member.steamLink || null;
      enriched.responsibilities = member.responsibilities || [];
      enriched.joinDate = member.joinDate || 'N/A';
      enriched.status = member.status || 'offline';
      break;
    }
  }
  // Ensure default responsibilities if missing
  if (!enriched.responsibilities) enriched.responsibilities = [];
  
  if (enriched.children) {
    enriched.children = enriched.children.map(c => enrichTreeWithData(c, rolesData));
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

export const useStore = create(
  persist(
    (set, get) => {
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
        tree: enrichTreeWithData(ORG_TREE, INITIAL_ROLES_DATA),
        rolesData: INITIAL_ROLES_DATA,
        roles: INITIAL_ROLES,
        roleDetails: INITIAL_ROLE_DETAILS,
        isEditMode: false,
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

        reset: () => set(state => {
          const historyUpdate = pushHistory(state);
          return {
            tree: enrichTreeWithData(ORG_TREE, INITIAL_ROLES_DATA),
            roles: INITIAL_ROLES,
            roleDetails: INITIAL_ROLE_DETAILS,
            ...historyUpdate
          };
        }),

        toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),

        updateRoleDetails: (roleId, updates) => set(state => {
          const historyUpdate = pushHistory(state);
          return {
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
          
          // Add history
          const historyEntry = {
            date: new Date().toISOString(),
            action: 'Promoted',
            fromRole: currentRole.title,
            toRole: newRole.title
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

    return { tree: newTree };
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
          
          // Add history
          const historyEntry = {
            date: new Date().toISOString(),
            action: 'Demoted',
            fromRole: currentRole.title,
            toRole: newRole.title
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

        kickNode: (nodeId) => set(state => {
          const node = findNode(state.tree, nodeId);
          if (!node) return state;
          const role = state.roles.find(r => r.id === node.roleId);
          
          const historyUpdate = pushHistory(state);
          let newTree = state.tree;
          
          if (role && role.maxSlots !== null) {
            const replaceWithVacant = (t) => {
              if (t.id === nodeId) {
                return { ...t, name: 'Vacant', vacant: true, id: `vacant-${Date.now()}`, children: t.children || [] };
              }
              if (!t.children) return t;
              return { ...t, children: t.children.map(c => replaceWithVacant(c)) };
            }
            newTree = replaceWithVacant(state.tree);
          } else {
            newTree = removeNode(state.tree, nodeId);
          }
          
          return { tree: newTree, ...historyUpdate };
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
          const historyUpdate = pushHistory(state);
          return { tree: updateNodeRole(state.tree, nodeId, role), ...historyUpdate };
        }),

        updateNodeDetails: (id, updates) => set(state => {
          const historyUpdate = pushHistory(state);
          let newTree = state.tree;
          for (const [key, value] of Object.entries(updates)) {
            newTree = updateNodeField(newTree, id, key, value);
          }
          return { tree: newTree, ...historyUpdate };
        }),

        addNode: (parentId, newNode) => set(state => {
          const historyUpdate = pushHistory(state);
          return { tree: insertNode(state.tree, parentId, newNode), ...historyUpdate };
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
              newTree = updateNodeField(newTree, node.id, 'history', histories[name]);
              migrated = true;
            }
          });
          
          if (!migrated) return state;
          const historyUpdate = pushHistory(state);
          return { tree: newTree, ...historyUpdate };
        })
      };
    },
    {
      name: 'org-chart-storage',
      partialize: (state) => ({ 
        tree: state.tree, 
        roles: state.roles, 
        roleDetails: state.roleDetails
      })
    }
  )
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
