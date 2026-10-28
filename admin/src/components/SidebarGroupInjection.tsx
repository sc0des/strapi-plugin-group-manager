import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Box, Typography, Flex } from '@strapi/design-system';
import type { Group, AvailableItems } from '../hooks/useGroups';
import { ICON_MAP } from '../utils/iconMap';

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
function sanitiseColor(color: string): string {
  return HEX_COLOR_RE.test(color) ? color : '#4945FF';
}

// This component is injected into the Content Manager left nav
export const SidebarGroupInjection = () => {
  const { get } = useFetchClient();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItems>({
    collectionTypes: [],
    components: [],
  });
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const [{ data: groupsData }, { data: itemsData }] = await Promise.all([
        get('/group-manager/groups'),
        get('/group-manager/groups/available-items'),
      ]);
      setGroups(groupsData || []);
      setAvailableItems(itemsData || { collectionTypes: [], components: [] });
      // Default all groups to open
      const defaultOpen: Record<number, boolean> = {};
      (groupsData || []).forEach((g: Group) => {
        defaultOpen[g.id] = true;
      });
      setOpenGroups(defaultOpen);
    } catch (e) {
      // silently fail in sidebar
    }
  }, [get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleGroup = (id: number) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getLabel = (uid: string): string => {
    const ct = availableItems.collectionTypes.find((c) => c.uid === uid);
    if (ct) return ct.displayName;
    const comp = availableItems.components.find((c) => c.uid === uid);
    if (comp) return comp.displayName;
    return uid.split('.').pop() || uid;
  };

  const handleNavigate = (uid: string, type: 'collection' | 'component') => {
    if (type === 'collection') {
      const ct = availableItems.collectionTypes.find((c) => c.uid === uid);
      navigate(`/content-manager/${ct?.kind === 'singleType' ? 'single' : 'collection'}-types/${uid}`);
    } else {
      const comp = availableItems.components.find((c) => c.uid === uid);
      if (!comp?.category) return;
      navigate(`/plugins/content-type-builder/component-categories/${encodeURIComponent(comp.category)}/${encodeURIComponent(uid)}`);
    }
  };

  if (groups.length === 0) return null;

  return (
    <Box style={{ padding: '12px 0 4px' }}>
      <Typography
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: '#666687',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 16px 8px',
        }}
      >
        Groups
      </Typography>

      {groups.map((group) => {
        const isOpen = openGroups[group.id] !== false;
        const safeColor = sanitiseColor(group.color);
        const allItems = [
          ...group.collectionTypes.map((uid) => ({ uid, type: 'collection' as const })),
          ...group.components.map((uid) => ({ uid, type: 'component' as const })),
        ];

        return (
          <Box key={group.id} style={{ marginBottom: 1 }}>
            {/* Group header */}
            <Flex
              alignItems="center"
              gap={2}
              onClick={() => toggleGroup(group.id)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                userSelect: 'none',
                borderLeft: isOpen ? `3px solid ${safeColor}` : '3px solid transparent',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                {ICON_MAP[group.icon] || '📁'}
              </span>
              <Typography
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#D9D8FF',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.name}
              </Typography>
              <span
                style={{
                  fontSize: 11,
                  color: safeColor,
                  background: `${safeColor}30`,
                  padding: '2px 7px',
                  borderRadius: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}
              >
                {allItems.length}
              </span>
              <span
                style={{
                  color: '#8E8EA9',
                  fontSize: 12,
                  lineHeight: 1,
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                ▾
              </span>
            </Flex>

            {/* Items */}
            {isOpen && (
              <Box style={{ paddingBottom: 4 }}>
                {allItems.map(({ uid, type }) => (
                  <Flex
                    key={uid}
                    alignItems="center"
                    gap={2}
                    onClick={() => handleNavigate(uid, type)}
                    style={{
                      padding: '10px 16px 10px 40px',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: type === 'component' ? '#C17FFF' : '#6EB3D9',
                        background: type === 'component' ? '#8312D120' : '#0C75AF20',
                        padding: '2px 5px',
                        borderRadius: 4,
                        flexShrink: 0,
                        lineHeight: 1.5,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {type === 'component' ? 'COMP' : 'CT'}
                    </span>
                    <Typography
                      style={{
                        fontSize: 14,
                        color: '#BCBCD4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {getLabel(uid)}
                    </Typography>
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
