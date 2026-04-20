import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import { Box, Typography, Flex, Searchbar, SearchForm } from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';
import { Group, useGroups } from '../hooks/useGroups';
import { useGroupPermissions } from '../hooks/useGroupPermissions';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { ICON_MAP } from '../utils/iconMap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
function sanitiseColor(color: string): string {
  return HEX_COLOR_RE.test(color) ? color : '#4945FF';
}

// ─── Confirmation Dialog (non-blocking) ──────────────────────────────────────

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Confirm action"
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: '#1C1C2E', border: '1px solid #2C2C50', borderRadius: 10,
        padding: '24px 28px', minWidth: 300, maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      <Typography style={{ color: '#E0E0F0', fontSize: 14, display: 'block', marginBottom: 20 }}>
        {message}
      </Typography>
      <Flex gap={2} justifyContent="flex-end">
        <button
          autoFocus
          onClick={onCancel}
          style={{
            background: '#252540', border: '1px solid #32325A', borderRadius: 5,
            color: '#C0C0D8', fontSize: 12, padding: '6px 14px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            background: '#EE5E52', border: 'none', borderRadius: 5,
            color: '#fff', fontSize: 12, fontWeight: 700,
            padding: '6px 14px', cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </Flex>
    </div>
  </div>
);

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; message: string }

class GroupManagerErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    return { hasError: true, message: err.message || 'Unknown error' };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[GroupManager] Uncaught error:', err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex
          alignItems="center"
          justifyContent="center"
          style={{ height: '100vh', flexDirection: 'column', gap: 16, background: '#14142A' }}
        >
          <Box style={{
            width: 64, height: 64, borderRadius: 16, background: '#2A1020',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>⚠️</Box>
          <Box style={{ textAlign: 'center', maxWidth: 400 }}>
            <Typography style={{
              color: '#E0E0F0', fontSize: 18, fontWeight: 600, display: 'block', marginBottom: 8,
            }}>
              Something went wrong
            </Typography>
            <Typography style={{ color: '#505070', fontSize: 13 }}>
              {this.state.message}
            </Typography>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              style={{
                marginTop: 16, background: '#4945FF', border: 'none', borderRadius: 5,
                color: '#fff', fontSize: 12, padding: '7px 16px', cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </Box>
        </Flex>
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const GroupManagerPageInner: React.FC = () => {
  const navigate = useNavigate();
  const permissions = useGroupPermissions();
  const { groups, availableItems, isLoading, error, createGroup, updateGroup, deleteGroup } = useGroups();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Auto-open newly added groups
  useEffect(() => {
    if (groups.length === 0) return;
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      groups.forEach((g) => {
        if (!(g.documentId in next)) {
          next[g.documentId] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [groups]);

  // ── Navigation ───────────────────────────────────────────────────────────

  /**
   * Clicking any sidebar item navigates directly to the appropriate Strapi page.
   * Collections  → Content Manager list view .
   * Components   → Content Type Builder schema editor.
   */
  const handleSelectItem = useCallback(
    (uid: string, type: 'collection' | 'component') => {
      if (type === 'collection') {
        navigate(`/content-manager/collection-types/${uid}`);
      } else {
        const comp = availableItems?.components?.find((c) => c.uid === uid);
        if (!comp?.category) return;
        navigate(
          `/plugins/content-type-builder/component-categories/${encodeURIComponent(comp.category)}/${encodeURIComponent(uid)}`
        );
      }
    },
    [availableItems, navigate]
  );

  // ── Group CRUD ───────────────────────────────────────────────────────────

  const toggleGroup = useCallback(
    (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] })),
    []
  );

  const handleSave = useCallback(
    async (data: Omit<Group, 'id' | 'documentId'>) => {
      try {
        if (editingGroup) {
          await updateGroup(editingGroup.documentId, data);
        } else {
          await createGroup(data);
        }
        setEditingGroup(null);
        setIsModalOpen(false);
      } catch (err) {
        console.error('[GroupManager] Failed to save group:', err);
        throw err;
      }
    },
    [editingGroup, updateGroup, createGroup]
  );

  const handleDeleteConfirmed = useCallback(async () => {
    if (deleteTarget === null) return;
    try {
      await deleteGroup(deleteTarget);
    } catch (err) {
      console.error('[GroupManager] Failed to delete group:', err);
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteGroup]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const getLabel = useCallback(
    (uid: string): string => {
      const ct = availableItems?.collectionTypes?.find((c) => c.uid === uid);
      if (ct) return ct.displayName;
      const comp = availableItems?.components?.find((c) => c.uid === uid);
      if (comp) return comp.displayName;
      return uid.split('.').pop() ?? uid;
    },
    [availableItems]
  );

  const filteredGroups = useMemo(() => {
    const lc = search.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        filteredCollections: group.collectionTypes.filter(
          (uid) => !lc || getLabel(uid).toLowerCase().includes(lc)
        ),
        filteredComponents: group.components.filter(
          (uid) => !lc || getLabel(uid).toLowerCase().includes(lc)
        ),
      }))
      .filter(
        (g) =>
          !lc ||
          g.name.toLowerCase().includes(lc) ||
          g.filteredCollections.length > 0 ||
          g.filteredComponents.length > 0
      );
  }, [groups, search, getLabel]);

  const totalItems =
    (availableItems?.collectionTypes?.length ?? 0) +
    (availableItems?.components?.length ?? 0);

  // ── Access denied ────────────────────────────────────────────────────────

  if (!permissions.isLoading && !permissions.canRead && !permissions.canAccess) {
    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{ height: '100vh', flexDirection: 'column', gap: 16, background: '#14142A' }}
      >
        <Box style={{
          width: 64, height: 64, borderRadius: 16, background: '#2A1020',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>🔒</Box>
        <Box style={{ textAlign: 'center' }}>
          <Typography style={{
            color: '#E0E0F0', fontSize: 18, fontWeight: 600, display: 'block', marginBottom: 8,
          }}>
            Access restricted
          </Typography>
          <Typography style={{ color: '#505070', fontSize: 14 }}>
            You don't have permission to access Content Groups.
          </Typography>
        </Box>
      </Flex>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {deleteTarget !== null && (
        <ConfirmDialog
          message="Delete this group? This cannot be undone."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Box style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: '#14142A',
      }}>

        {/* ── SIDEBAR ── */}
        <Box
          role="navigation"
          aria-label="Content groups"
          style={{
            width: 210, flexShrink: 0, background: '#1C1C2E',
            borderRight: '1px solid #252540',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box style={{ flexShrink: 0 }}>
            {/* Title row — matches Strapi's SubNav header height */}
            <Flex justifyContent="space-between" alignItems="center" style={{
              padding: '0 16px',
              height: 56,
              borderBottom: '1px solid #32325A',
            }}>
              <Typography style={{ color: '#F0F0FF', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                Group Manager
              </Typography>
              {permissions.canCreate && (
                <button
                  aria-label="Create new group"
                  title="New group"
                  onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
                  style={{
                    width: 28, height: 28, borderRadius: 6, background: '#4945FF',
                    border: 'none', cursor: 'pointer', color: '#fff',
                    fontSize: 18, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}
                >+</button>
              )}
            </Flex>

            {/* Search row */}
            <Box style={{ padding: '8px 12px', borderBottom: '1px solid #32325A' }}>
              <SearchForm>
                <Searchbar
                  name="search-groups"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  clearLabel="Clear search"
                  placeholder="Search..."
                >
                  Search groups
                </Searchbar>
              </SearchForm>
            </Box>
          </Box>

          {/* Groups list */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            {isLoading || permissions.isLoading ? (
              <Typography style={{ color: '#505070', fontSize: 12, padding: 14 }}>Loading…</Typography>
            ) : error ? (
              <Box style={{ padding: '20px 14px', textAlign: 'center' }}>
                <span aria-hidden="true" style={{ fontSize: 20 }}>⚠️</span>
                <Typography style={{ color: '#EE5E52', fontSize: 12, marginTop: 8, display: 'block' }}>
                  {error}
                </Typography>
              </Box>
            ) : !permissions.canRead ? (
              <Box style={{ padding: '24px 14px', textAlign: 'center' }}>
                <span aria-hidden="true" style={{ fontSize: 20 }}>🔒</span>
                <Typography style={{ color: '#505070', fontSize: 12, marginTop: 8, display: 'block' }}>
                  No permission to view groups
                </Typography>
              </Box>
            ) : filteredGroups.length === 0 ? (
              <Box style={{ padding: '20px 14px', textAlign: 'center' }}>
                <Typography style={{ color: '#505070', fontSize: 12 }}>
                  {search ? 'No results' : 'No groups yet'}
                </Typography>
                {!search && permissions.canCreate && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      marginTop: 10, background: 'none', border: '1px dashed #32325A',
                      color: '#8080A0', borderRadius: 5, padding: '6px 10px',
                      cursor: 'pointer', fontSize: 11, width: '100%',
                    }}
                  >
                    + Create first group
                  </button>
                )}
              </Box>
            ) : filteredGroups.map((group) => {
              const isOpen = openGroups[group.documentId] !== false;
              const safeColor = sanitiseColor(group.color);
              const allItems = [
                ...group.filteredCollections.map((uid) => ({ uid, type: 'collection' as const })),
                ...group.filteredComponents.map((uid) => ({ uid, type: 'component' as const })),
              ];

              return (
                <Box key={group.id}>
                  {/* Group header row */}
                  <Flex
                    alignItems="center"
                    gap={2}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-label={`Group: ${group.name}`}
                    onClick={() => toggleGroup(group.documentId)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGroup(group.documentId);
                      }
                    }}
                    style={{
                      padding: '10px 16px 10px 13px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderLeft: `3px solid ${isOpen ? safeColor : 'transparent'}`,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                      {ICON_MAP[group.icon] ?? '📁'}
                    </span>
                    <Typography style={{
                      color: '#D9D8FF', fontSize: 14, fontWeight: 600,
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {group.name}
                    </Typography>
                    <span aria-label={`${allItems.length} items`} style={{
                      fontSize: 11, color: safeColor,
                      background: `${safeColor}25`,
                      padding: '2px 7px', borderRadius: 10,
                      fontWeight: 700, flexShrink: 0, lineHeight: 1.4,
                    }}>
                      {allItems.length}
                    </span>

                    {/* Edit / Delete — stopPropagation so the group row doesn't toggle */}
                    <Flex gap={1} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      {permissions.canUpdate && (
                        <button
                          aria-label={`Edit group ${group.name}`}
                          title="Edit"
                          onClick={() => { setEditingGroup(group); setIsModalOpen(true); }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#505070', padding: '2px 3px', fontSize: 13,
                          }}
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.color = '#8080C0';
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.color = '#505070';
                          }}
                        >✎</button>
                      )}
                      {permissions.canDelete && (
                        <button
                          aria-label={`Delete group ${group.name}`}
                          title="Delete"
                          onClick={() => setDeleteTarget(group.documentId)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#505070', padding: '2px 3px', fontSize: 13,
                          }}
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.color = '#EE5E52';
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.color = '#505070';
                          }}
                        >✕</button>
                      )}
                    </Flex>

                    <span
                      aria-hidden="true"
                      style={{
                        color: '#666687', fontSize: 11, flexShrink: 0,
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}
                    >▾</span>
                  </Flex>

                  {isOpen && (
                    <Box role="list" aria-label={`Items in ${group.name}`}>
                      {allItems.length === 0 ? (
                        <Typography style={{
                          color: '#505070', fontSize: 13,
                          padding: '10px 16px 10px 32px',
                          fontStyle: 'italic', display: 'block',
                        }}>
                          Empty group
                        </Typography>
                      ) : allItems.map(({ uid, type }) => {
                        const isComp = type === 'component';
                        const label = getLabel(uid);
                        return (
                          <Flex
                            key={uid}
                            role="listitem"
                            alignItems="center"
                            gap={2}
                            tabIndex={0}
                            title={label}
                            aria-label={`${isComp ? 'Component' : 'Collection type'}: ${label}`}
                            onClick={() => handleSelectItem(uid, type)}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectItem(uid, type);
                              }
                            }}
                            style={{
                              padding: '7px 16px 7px 32px',
                              cursor: 'pointer',
                              background: 'transparent',
                              borderLeft: '3px solid transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                              e.currentTarget.style.background = `${safeColor}14`;
                              e.currentTarget.style.borderLeftColor = `${safeColor}70`;
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                          >
                            <span aria-hidden="true" style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                              padding: '2px 5px', borderRadius: 3, flexShrink: 0,
                              lineHeight: 1.5,
                              color: isComp ? '#C17FFF' : '#6EB3D9',
                              background: isComp
                                ? 'rgba(193,127,255,0.15)'
                                : 'rgba(110,179,217,0.15)',
                            }}>
                              {isComp ? 'COMP' : 'CT'}
                            </span>
                            <Typography style={{
                              fontSize: 14,
                              color: '#C0C0D8',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {label}
                            </Typography>
                          </Flex>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Footer */}
          <Box style={{ padding: '8px 14px', borderTop: '1px solid #252540', flexShrink: 0 }}>
            <Typography style={{ color: '#404060', fontSize: 10 }}>
              {groups.length} groups · {totalItems} items
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT PANEL ── */}
        {/* Clicking any sidebar item navigates away immediately.
            This panel is a permanent landing/hint state. */}
        <Box
          role="main"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ flex: 1, gap: 16, background: '#14142A' }}
          >
            <Box style={{
              width: 72, height: 72, borderRadius: 18,
              background: '#1C1C3A', border: '1px solid #2C2C50',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>📂</Box>
            <Box style={{ textAlign: 'center', maxWidth: 300 }}>
              <Typography style={{
                color: '#C0C0D8', fontSize: 15, fontWeight: 600,
                display: 'block', marginBottom: 8,
              }}>
                Select an item from the sidebar
              </Typography>
              <Typography style={{ color: '#404060', fontSize: 12, lineHeight: 1.6, display: 'block' }}>
                Collections open in the Content Manager.
              </Typography>
              <Typography style={{ color: '#404060', fontSize: 12, lineHeight: 1.6, display: 'block' }}>
                Components open in the Content Type Builder.
              </Typography>
              {permissions.canCreate && (
                <button
                  onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
                  style={{
                    marginTop: 16, background: '#4945FF', border: 'none', borderRadius: 6,
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    padding: '8px 18px', cursor: 'pointer',
                  }}
                >
                  + Create group
                </button>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>

      {isModalOpen && (
        <CreateGroupModal
          onClose={() => { setIsModalOpen(false); setEditingGroup(null); }}
          onSave={handleSave}
          availableItems={availableItems}
          existingGroup={editingGroup}
        />
      )}
    </>
  );
};

// ─── Export (wrapped in error boundary) ──────────────────────────────────────

export const GroupManagerPage: React.FC = () => (
  <GroupManagerErrorBoundary>
    <GroupManagerPageInner />
  </GroupManagerErrorBoundary>
);