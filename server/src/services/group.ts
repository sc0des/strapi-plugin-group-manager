import type { Core } from '@strapi/strapi';

const UID = 'plugin::group-manager.group' as const;

export interface GroupData {
  name: string;
  color?: string;
  icon?: string;
  collectionTypes?: string[];
  components?: string[];
  order?: number;
}

const groupService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find() {
    return strapi.documents(UID).findMany({
      sort: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  },

  async findOne(documentId: string) {
    return strapi.documents(UID).findOne({ documentId });
  },

  async create(data: GroupData) {
    return strapi.documents(UID).create({
      data: {
        name: data.name,
        color: data.color ?? '#4945FF',
        icon: data.icon ?? 'folder',
        collectionTypes: data.collectionTypes ?? [],
        components: data.components ?? [],
        order: data.order ?? 0,
      },
    });
  },

  async update(documentId: string, data: Partial<GroupData>) {
    return strapi.documents(UID).update({ documentId, data: data as any });
  },

  async delete(documentId: string) {
    return strapi.documents(UID).delete({ documentId });
  },
});

export default groupService;
