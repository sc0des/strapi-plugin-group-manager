import type { Core } from '@strapi/strapi';

const groupController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    ctx.body = await strapi.plugin('group-manager').service('group').find();
  },

  async findOne(ctx: any) {
    const group = await strapi.plugin('group-manager').service('group').findOne(ctx.params.id);
    if (!group) return ctx.throw(404, 'Group not found');
    ctx.body = group;
  },

  async create(ctx: any) {
    try {
      const group = await strapi.plugin('group-manager').service('group').create(ctx.request.body);
      ctx.status = 201;
      ctx.body = group;
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('unique')) return ctx.throw(400, 'A group with this name already exists');
      ctx.throw(500, err);
    }
  },

  async update(ctx: any) {
    const existing = await strapi.plugin('group-manager').service('group').findOne(ctx.params.id);
    if (!existing) return ctx.throw(404, 'Group not found');
    ctx.body = await strapi.plugin('group-manager').service('group').update(ctx.params.id, ctx.request.body);
  },

  async delete(ctx: any) {
    const existing = await strapi.plugin('group-manager').service('group').findOne(ctx.params.id);
    if (!existing) return ctx.throw(404, 'Group not found');
    await strapi.plugin('group-manager').service('group').delete(ctx.params.id);
    ctx.body = { message: 'Deleted' };
  },

  async getAvailableItems(ctx: any) {
    const collectionTypes = Object.values(strapi.contentTypes)
      .filter((ct: any) => ct.kind === 'collectionType' && !ct.plugin)
      .map((ct: any) => ({
        uid: ct.uid,
        displayName: ct.info?.displayName || ct.uid,
        singularName: ct.info?.singularName,
        pluralName: ct.info?.pluralName,
      }));

    const components = Object.values(strapi.components).map((comp: any) => ({
      uid: comp.uid,
      displayName: comp.info?.displayName || comp.uid,
      category: comp.category,
    }));

    ctx.body = { collectionTypes, components };
  },
});

export default groupController;