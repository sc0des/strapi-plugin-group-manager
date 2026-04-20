import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.admin.services.permission.actionProvider.registerMany([
    {
      section: 'plugins',
      displayName: 'Access plugin',
      uid: 'access',
      pluginName: 'group-manager',
    },
    {
      section: 'plugins',
      displayName: 'Read groups',
      uid: 'groups.read',
      pluginName: 'group-manager',
    },
    {
      section: 'plugins',
      displayName: 'Create groups',
      uid: 'groups.create',
      pluginName: 'group-manager',
    },
    {
      section: 'plugins',
      displayName: 'Update groups',
      uid: 'groups.update',
      pluginName: 'group-manager',
    },
    {
      section: 'plugins',
      displayName: 'Delete groups',
      uid: 'groups.delete',
      pluginName: 'group-manager',
    },
  ]);
};

export default register;