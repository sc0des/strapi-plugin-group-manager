import { describe, it, expect, vi } from 'vitest';
import groupService from '../server/src/services/group';

const setup = () => {
  const documents = { create: vi.fn(async (a) => a), update: vi.fn(async (a) => a) };
  const strapi: any = { documents: () => documents };
  return { service: groupService({ strapi }), documents };
};

describe('group service', () => {
  it('create applies defaults', async () => {
    const { service, documents } = setup();
    await service.create({ name: 'Blog' });
    expect(documents.create.mock.calls[0][0].data).toEqual({
      name: 'Blog',
      color: '#4945FF',
      icon: 'folder',
      collectionTypes: [],
      components: [],
      order: 0,
    });
  });

  it('create keeps single types in collectionTypes', async () => {
    const { service, documents } = setup();
    await service.create({
      name: 'Site',
      collectionTypes: ['api::footer.footer', 'api::page.page'],
    });
    expect(documents.create.mock.calls[0][0].data.collectionTypes).toEqual([
      'api::footer.footer',
      'api::page.page',
    ]);
  });

  it('create falls back for an invalid colour and icon', async () => {
    const { service, documents } = setup();
    await service.create({ name: 'x', color: 'red;x', icon: 'nope' });
    const data = documents.create.mock.calls[0][0].data;
    expect(data.color).toBe('#4945FF');
    expect(data.icon).toBe('folder');
  });

  it('create accepts 3 and 6 digit hex colours and known icons', async () => {
    const { service, documents } = setup();
    await service.create({ name: 'a', color: '#abc', icon: 'brush' });
    await service.create({ name: 'b', color: '#A1B2C3', icon: 'layer' });
    expect(documents.create.mock.calls[0][0].data).toMatchObject({ color: '#abc', icon: 'brush' });
    expect(documents.create.mock.calls[1][0].data).toMatchObject({ color: '#A1B2C3', icon: 'layer' });
  });

  it('create drops non-string list entries', async () => {
    const { service, documents } = setup();
    await service.create({ name: 'x', collectionTypes: ['a', 1, null, {}] as any, components: 'nope' as any });
    const data = documents.create.mock.calls[0][0].data;
    expect(data.collectionTypes).toEqual(['a']);
    expect(data.components).toEqual([]);
  });

  it('update only passes known fields', async () => {
    const { service, documents } = setup();
    await service.update('doc1', { name: 'New', createdAt: '2000-01-01', createdBy: 1 } as any);
    expect(documents.update.mock.calls[0][0]).toEqual({ documentId: 'doc1', data: { name: 'New' } });
  });

  it('update leaves omitted fields out', async () => {
    const { service, documents } = setup();
    await service.update('doc1', { components: ['shared.seo'] });
    expect(documents.update.mock.calls[0][0].data).toEqual({ components: ['shared.seo'] });
  });
});
