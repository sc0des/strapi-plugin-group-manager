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

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
const ICONS = ['folder', 'layer', 'link', 'form', 'analytics', 'palette', 'brush'];

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

const sanitise = (data: any): Partial<GroupData> => {
  const out: Partial<GroupData> = {};
  if (typeof data?.name === 'string') out.name = data.name.trim();
  if (data?.color !== undefined) out.color = HEX_COLOR_RE.test(data.color) ? data.color : '#4945FF';
  if (data?.icon !== undefined) out.icon = ICONS.includes(data.icon) ? data.icon : 'folder';
  if (data?.collectionTypes !== undefined) out.collectionTypes = strings(data.collectionTypes);
  if (data?.components !== undefined) out.components = strings(data.components);
  if (Number.isInteger(data?.order)) out.order = data.order;
  return out;
};

const groupService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find() {
    return strapi.documents(UID).findMany({
      sort: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  },

  async findOne(documentId: string) {
    return strapi.documents(UID).findOne({ documentId });
  },

  async create(input: GroupData) {
    const data = sanitise(input) as GroupData;
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
    return strapi.documents(UID).update({ documentId, data: sanitise(data) as any });
  },

  async delete(documentId: string) {
    return strapi.documents(UID).delete({ documentId });
  },
});

export default groupService;
