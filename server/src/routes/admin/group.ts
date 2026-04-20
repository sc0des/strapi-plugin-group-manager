export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/groups',
      handler: 'group.find',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.read'] },
          },
        ],
      },
    },
    {
      method: 'GET',
      path: '/groups/available-items',
      handler: 'group.getAvailableItems',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.read'] },
          },
        ],
      },
    },
    {
      method: 'GET',
      path: '/groups/:id',
      handler: 'group.findOne',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.read'] },
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/groups',
      handler: 'group.create',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.create'] },
          },
        ],
      },
    },
    {
      method: 'PUT',
      path: '/groups/:id',
      handler: 'group.update',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.update'] },
          },
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/groups/:id',
      handler: 'group.delete',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::group-manager.groups.delete'] },
          },
        ],
      },
    },
  ],
});