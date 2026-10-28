import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Flex } from '@strapi/design-system';
import { Pencil, Trash } from '@strapi/icons';
import type { Group, AvailableItems } from '../hooks/useGroups';

const ICON_MAP: Record<string, string> = {
  // From ICONS
  folder: '📁',  layer: '◧',  link: '🔗',  form: '📝',  analytics: '📈',  palette: '🎨',
  brush: '🖌️',
};

interface Props {
  group: Group;
  availableItems: AvailableItems;
  onEdit: (group: Group) => void;
  onDelete: (id: number) => void;
}

const getLabel = (uid: string, availableItems: AvailableItems): string => {
  const ct = availableItems.collectionTypes.find((c) => c.uid === uid);
  if (ct) return ct.displayName;
  const comp = availableItems.components.find((c) => c.uid === uid);
  if (comp) return comp.displayName;
  return uid.split('.').pop() || uid;
};

const getNavPath = (uid: string, availableItems: AvailableItems): string => {
  const ct = availableItems.collectionTypes.find((c) => c.uid === uid);
  if (ct) return `/content-manager/${ct.kind === 'singleType' ? 'single' : 'collection'}-types/${uid}`;
  const comp = availableItems.components.find((c) => c.uid === uid);
  if (comp) return `/content-type-builder/component-categories/${comp.category}`;
  return '/';
};

export const CollapsibleGroup = ({ group, availableItems, onEdit, onDelete }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const allItems = [
    ...group.collectionTypes.map((uid) => ({ uid, type: 'collection' as const })),
    ...group.components.map((uid) => ({ uid, type: 'component' as const })),
  ];

  return (
    <Box
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${isHovered ? group.color + '50' : '#EAEAEF'}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isHovered ? `0 2px 12px ${group.color}18` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Group header */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '14px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          background: isOpen ? `${group.color}08` : 'transparent',
          borderBottom: isOpen ? `1px solid ${group.color}20` : 'none',
          transition: 'background 0.15s ease',
        }}
      >
        <Flex alignItems="center" gap={2} style={{ flex: 1, minWidth: 0 }}>
          {/* Color dot */}
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: group.color, flexShrink: 0,
            boxShadow: `0 0 0 3px ${group.color}20`,
          }} />

          {/* Icon */}
          <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>
            {ICON_MAP[group.icon] || '📁'}
          </span>

          {/* Name */}
          <Typography style={{
            fontSize: 14, fontWeight: 600, color: '#212134',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {group.name}
          </Typography>

          {/* Count badge */}
          <span style={{
            fontSize: 11, fontWeight: 700, color: group.color,
            background: `${group.color}18`, borderRadius: 10,
            padding: '2px 8px', flexShrink: 0,
          }}>
            {allItems.length}
          </span>
        </Flex>

        <Flex alignItems="center" gap={1} onClick={(e: any) => e.stopPropagation()}>
          {/* Action buttons — visible on hover */}
          <Box style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <button
              title="Edit group"
              onClick={() => onEdit(group)}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: '1px solid #EAEAEF', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#666687',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#F0F0FF';
                (e.currentTarget as HTMLElement).style.borderColor = '#4945FF';
                (e.currentTarget as HTMLElement).style.color = '#4945FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#fff';
                (e.currentTarget as HTMLElement).style.borderColor = '#EAEAEF';
                (e.currentTarget as HTMLElement).style.color = '#666687';
              }}
            >
              <Pencil width={13} height={13} />
            </button>

            <button
              title="Delete group"
              onClick={() => {
                if (window.confirm(`Delete group "${group.name}"?`)) onDelete(group.id);
              }}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: '1px solid #EAEAEF', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#666687',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#FCECEA';
                (e.currentTarget as HTMLElement).style.borderColor = '#EE5E52';
                (e.currentTarget as HTMLElement).style.color = '#EE5E52';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#fff';
                (e.currentTarget as HTMLElement).style.borderColor = '#EAEAEF';
                (e.currentTarget as HTMLElement).style.color = '#666687';
              }}
            >
              <Trash width={13} height={13} />
            </button>
          </Box>

          {/* Chevron */}
          <span style={{
            fontSize: 12, color: '#8E8EA9', marginLeft: 4,
            display: 'inline-flex', alignItems: 'center',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
          }}>
            ▾
          </span>
        </Flex>
      </Flex>

      {/* Items list */}
      {isOpen && (
        <Box>
          {allItems.length === 0 ? (
            <Flex
              alignItems="center"
              justifyContent="center"
              style={{ padding: '20px 16px' }}
            >
              <Typography variant="pi" textColor="neutral400" style={{ fontStyle: 'italic' }}>
                No items added to this group yet
              </Typography>
            </Flex>
          ) : (
            allItems.map(({ uid, type }, index) => {
              const label = getLabel(uid, availableItems);
              const path = getNavPath(uid, availableItems);
              const isComponent = type === 'component';
              const isItemHovered = hoveredItem === uid;

              return (
                <Flex
                  key={uid}
                  alignItems="center"
                  gap={3}
                  onClick={() => navigate(path)}
                  onMouseEnter={() => setHoveredItem(uid)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    padding: '10px 16px 10px 32px',
                    cursor: 'pointer',
                    borderBottom: index < allItems.length - 1 ? '1px solid #F6F6F9' : 'none',
                    background: isItemHovered ? `${group.color}06` : 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                >
                  {/* Type badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
                    flexShrink: 0,
                    ...(isComponent
                      ? { color: '#8312D1', background: '#F6ECFC' }
                      : { color: '#0C75AF', background: '#EAF5FF' }
                    ),
                  }}>
                    {isComponent ? 'comp' : 'col'}
                  </span>

                  {/* Label */}
                  <Typography style={{
                    fontSize: 13, color: '#32324D', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </Typography>

                  {/* Arrow */}
                  <span style={{
                    fontSize: 12, flexShrink: 0,
                    color: isItemHovered ? group.color : '#C0C0CF',
                    transform: isItemHovered ? 'translateX(2px)' : 'translateX(0)',
                    transition: 'all 0.15s ease',
                  }}>
                    →
                  </span>
                </Flex>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};