import { useState } from 'react';
import {
  Modal,
  Button,
  TextInput,
  MultiSelect,
  MultiSelectOption,
  Tabs,
  Box,
  Typography,
  Flex,
  Field,
} from '@strapi/design-system';

import type { Group, AvailableItems, AvailableItem } from '../hooks/useGroups';

const COLORS = [
  '#4945FF', '#0C75AF', '#328048', '#BF5130',
  '#8312D1', '#C0399F', '#D9822B', '#666687',
];

const ICONS = [
  { value: 'folder', label: '📁 Folder' },
  { value: 'layer', label: '◧ Layer' },
  { value: 'link', label: '🔗 Link' },
  { value: 'form', label: '📝 Form' },
  { value: 'analytics', label: '📈 Analytics' },
  { value: 'palette', label: '🎨 Theme' },
  { value: 'brush', label: '🖌️ Brand' },
];

interface Props {
  onClose: () => void;
  onSave: (data: Omit<Group, 'id' | 'documentId'>) => Promise<void>;
  availableItems: AvailableItems;
  existingGroup?: Group | null;
}

export const CreateGroupModal = ({
  onClose,
  onSave,
  availableItems,
  existingGroup,
}: Props) => {
  const [name, setName] = useState(existingGroup?.name || '');
  const [color, setColor] = useState(existingGroup?.color || '#4945FF');
  const [icon, setIcon] = useState(existingGroup?.icon || 'folder');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    existingGroup?.collectionTypes || []
  );
  const [selectedComponents, setSelectedComponents] = useState<string[]>(
    existingGroup?.components || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Group name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        icon,
        collectionTypes: selectedCollections,
        components: selectedComponents,
        order: existingGroup?.order || 0,
      });
      onClose();
    } catch (err: any) {
      setNameError(err?.response?.data?.error?.message || 'Failed to save group');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal.Root defaultOpen onOpenChange={(open: boolean) => !open && onClose()}>
      <Modal.Content style={{ maxWidth: 700 }}>
        <Modal.Header>
          <Modal.Title>
            {existingGroup ? 'Edit Group' : 'Create Group'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Flex direction="column" gap={5} alignItems="stretch">

            {/* GROUP NAME */}
            <Field.Root error={nameError} required>
              <Field.Label>Group Name</Field.Label>
              <TextInput
                autoFocus
                placeholder="e.g. Marketing, Blog..."
                value={name}
                onChange={(e: any) => {
                  setName(e.target.value);
                  setNameError('');
                }}
              />
              {nameError && <Field.Error />}
            </Field.Root>

            {/* COLOR */}
            <Field.Root>
              <Field.Label>Color</Field.Label>
              <Flex gap={2}>
                {COLORS.map((c) => {
                  const active = color === c;

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: active
                          ? '2px solid #212134'
                          : '1px solid #DCDCE4',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </Flex>
            </Field.Root>

            {/* ICON */}
            <Field.Root hint="Choose an icon for the group — this appears in the UI and in lists." style={{ width: '100%' }}>
              <Field.Label>Icon</Field.Label>

              <Flex gap={2} wrap="wrap" style={{ marginTop: 8 }}>
                {ICONS.map((ic) => {
                  const active = icon === ic.value;

                  return (
                    <button
                      key={ic.value}
                      type="button"
                      onClick={() => setIcon(ic.value)}
                      aria-pressed={active}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: active ? `1px solid ${color}` : '1px solid var(--neutral200)',
                        background: active ? `${color}20` : 'var(--neutral0)',
                        color: active ? 'var(--primary600)' : 'var(--neutral700)',
                        fontSize: 13,
                        lineHeight: 1,
                        cursor: 'pointer',
                        boxShadow: active ? '0 0 0 2px rgba(0,0,0,0.03) inset' : 'none',
                        transition: 'all 120ms ease',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIcon(ic.value);
                        }
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{ic.label.split(' ')[0]}</span>
                      <span style={{ color: 'var(--neutral500)', fontSize: 13 }}>
                        {ic.label.split(' ').slice(1).join(' ')}
                      </span>
                    </button>
                  );
                })}
              </Flex>

              <Field.Hint />
            </Field.Root>


            {/* CONTENT */}
             <Box
                borderColor="neutral200"
                hasRadius
                padding={3}
                marginBottom={3}
                style={{ width: '100%' }}
              >
                <Tabs.Root defaultValue="collections">

                  {/* Tabs header */}
                  <Tabs.List
                    aria-label="Content selection"
                    style={{
                      display: 'flex',
                      gap: 12,
                      borderBottom: '1px solid var(--neutral200)',
                      marginBottom: 16,
                    }}
                  >
                    <Tabs.Trigger
                      value="collections"
                      style={{
                        padding: '10px 0',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid transparent',
                        color: 'var(--neutral600)',
                        fontWeight: 500,
                      }}
                    >
                      Collection Types
                      <span style={{ marginLeft: 6, color: 'var(--neutral500)' }}>
                        ({availableItems.collectionTypes.length})
                      </span>
                    </Tabs.Trigger>

                    <Tabs.Trigger
                      value="components"
                      style={{
                        padding: '10px 0',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid transparent',
                        color: 'var(--neutral600)',
                        fontWeight: 500,
                      }}
                    >
                      Components
                      <span style={{ marginLeft: 6, color: 'var(--neutral500)' }}>
                        ({availableItems.components.length})
                      </span>
                    </Tabs.Trigger>
                  </Tabs.List>

                  {/* CONTENT WRAPPER (IMPORTANT FIX) */}
                  <Box style={{ width: '100%' }}>

                    {/* COLLECTIONS */}
                    <Tabs.Content value="collections">
                      <Box paddingTop={2} style={{ width: '100%' }}>
                        <Field.Root>
                          <Field.Label>Collection Types</Field.Label>
                          <MultiSelect
                            placeholder="Search & select collection types..."
                            value={selectedCollections}
                            onChange={(val: string[]) => setSelectedCollections(val)}
                            withTags
                          >
                          {availableItems.collectionTypes.map((ct: AvailableItem) => (
                            <MultiSelectOption key={ct.uid} value={ct.uid}>
                              {ct.displayName}
                            </MultiSelectOption>
                          ))}
                          </MultiSelect>
                        </Field.Root>
                      </Box>
                    </Tabs.Content>

                    {/* COMPONENTS */}
                    <Tabs.Content value="components">
                      <Box paddingTop={2} style={{ width: '100%' }}>
                        <Field.Root>
                          <Field.Label>Components</Field.Label>
                          <MultiSelect
                            placeholder="Search & select components..."
                            value={selectedComponents}
                            onChange={(val: string[]) => setSelectedComponents(val)}
                            withTags
                          >
                          {availableItems.components.map((comp: AvailableItem) => (
                            <MultiSelectOption key={comp.uid} value={comp.uid}>
                              {comp.category
                                ? `${comp.category} / ${comp.displayName}`
                                : comp.displayName}
                            </MultiSelectOption>
                          ))}
                          </MultiSelect>
                        </Field.Root>
                      </Box>
                    </Tabs.Content>

                  </Box>
                </Tabs.Root>
              </Box>


            {/* PREVIEW */}
            <Box>
              <Typography variant="pi" textColor="neutral600" marginBottom={1}>
                Preview
              </Typography>

              <Flex alignItems="center" gap={2}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                  }}
                />
                <Typography fontWeight="semiBold">
                  {name || 'Group Name'}
                </Typography>
              </Flex>
            </Box>

          </Flex>
        </Modal.Body>

       <Modal.Footer>
        <Flex width="100%" justifyContent="space-between">
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!name.trim()}
          >
            {existingGroup ? 'Save' : 'Create'}
          </Button>
        </Flex>
      </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};