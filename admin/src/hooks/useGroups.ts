import { useState, useEffect, useCallback } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';

export interface Group {
  id: number;
  documentId: string;
  name: string;
  color: string;
  icon: string;
  collectionTypes: string[];
  components: string[];
  order: number;
}

export interface AvailableItem {
  uid: string;
  displayName: string;
  singularName?: string;
  pluralName?: string;
  category?: string;
}

export interface AvailableItems {
  collectionTypes: AvailableItem[];
  components: AvailableItem[];
}

export const useGroups = () => {
  const { get, post, put, del } = useFetchClient();
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItems>({
    collectionTypes: [],
    components: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await get(`/group-manager/groups`);
      setGroups(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch groups');
    }
  }, [get]);

  const fetchAvailableItems = useCallback(async () => {
    try {
      const { data } = await get(`/group-manager/groups/available-items`);
      setAvailableItems(data || { collectionTypes: [], components: [] });
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch available items');
    }
  }, [get]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchGroups(), fetchAvailableItems()]);
      setIsLoading(false);
    };
    init();
  }, [fetchGroups, fetchAvailableItems]);

  const createGroup = async (data: Omit<Group, 'id' | 'documentId'>) => {
    const { data: created } = await post('/group-manager/groups', data);
    await fetchGroups();
    return created;
  };

  const updateGroup = async (documentId: string, data: Omit<Group, 'id' | 'documentId'>) => {
    const { data: updated } = await put(`/group-manager/groups/${documentId}`, data);
    await fetchGroups();
    return updated;
  };

  const deleteGroup = async (documentId: string) => {
    await del(`/group-manager/groups/${documentId}`);
    setGroups((prev) => prev.filter((g) => g.documentId !== documentId));
  };

  return {
    groups,
    availableItems,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};