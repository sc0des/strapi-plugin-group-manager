import { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';

export interface GroupPermissions {
  canAccess: boolean;
  canRead:   boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

// Order is significant — matches the boolean[] returned by /admin/permissions/check
const PERMISSIONS_TO_CHECK = [
  { action: 'plugin::group-manager.access',        subject: null },
  { action: 'plugin::group-manager.groups.read',   subject: null },
  { action: 'plugin::group-manager.groups.create', subject: null },
  { action: 'plugin::group-manager.groups.update', subject: null },
  { action: 'plugin::group-manager.groups.delete', subject: null },
];

const DENIED: GroupPermissions = {
  canAccess: false,
  canRead:   false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  isLoading: false,
};

export const useGroupPermissions = (): GroupPermissions => {
  const { post } = useFetchClient();
  const [perms, setPerms] = useState<GroupPermissions>({ ...DENIED, isLoading: true });

  useEffect(() => {
    post('/admin/permissions/check', { permissions: PERMISSIONS_TO_CHECK })
      .then(({ data }: { data: { data: boolean[] } }) => {
        const [canAccess, canRead, canCreate, canUpdate, canDelete] = data.data ?? [];
        setPerms({
          canAccess:  canAccess  ?? false,
          canRead:    canRead    ?? false,
          canCreate:  canCreate  ?? false,
          canUpdate:  canUpdate  ?? false,
          canDelete:  canDelete  ?? false,
          isLoading:  false,
        });
      })
      .catch(() => setPerms(DENIED));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return perms;
};
