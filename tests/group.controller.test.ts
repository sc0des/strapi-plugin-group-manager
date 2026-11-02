import { describe, it, expect } from 'vitest';
import groupController from '../server/src/controllers/group';

const run = async (contentTypes: Record<string, any>, components: Record<string, any> = {}) => {
  const strapi: any = { contentTypes, components };
  const ctx: any = {};
  await groupController({ strapi }).getAvailableItems(ctx);
  return ctx.body;
};

describe('getAvailableItems', () => {
  it('includes collection and single types with their kind', async () => {
    const body = await run({
      'api::post.post': { uid: 'api::post.post', kind: 'collectionType', info: { displayName: 'Post' } },
      'api::footer.footer': { uid: 'api::footer.footer', kind: 'singleType', info: { displayName: 'Footer' } },
    });
    expect(body.collectionTypes).toEqual([
      expect.objectContaining({ uid: 'api::post.post', kind: 'collectionType', displayName: 'Post' }),
      expect.objectContaining({ uid: 'api::footer.footer', kind: 'singleType', displayName: 'Footer' }),
    ]);
  });

  it('excludes plugin content types', async () => {
    const body = await run({
      'plugin::users-permissions.user': { uid: 'plugin::users-permissions.user', kind: 'collectionType', plugin: 'users-permissions' },
      'plugin::x.single': { uid: 'plugin::x.single', kind: 'singleType', plugin: 'x' },
    });
    expect(body.collectionTypes).toEqual([]);
  });

  it('falls back to the uid when there is no display name', async () => {
    const body = await run({ 'api::a.a': { uid: 'api::a.a', kind: 'singleType' } });
    expect(body.collectionTypes[0].displayName).toBe('api::a.a');
  });

  it('returns components with their category', async () => {
    const body = await run({}, { 'shared.seo': { uid: 'shared.seo', category: 'shared', info: { displayName: 'SEO' } } });
    expect(body.components).toEqual([{ uid: 'shared.seo', displayName: 'SEO', category: 'shared' }]);
  });
});
