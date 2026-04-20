# Group Manager Strapi Plugin

A **Strapi** plugin that lets you organise your collections and components into named, colour coded groups in a dedicated admin panel page.

---

## Features

- Create named groups with a custom colour and icon
- Assign any collection type or component to a group
- Fine grained role permissions (read, create, update, delete)

## Preview

![Plugin](https://github.com/sc0des/strapi-plugin-group-manager/blob/main/assets/plugin-view.png)

![Create](https://github.com/sc0des/strapi-plugin-group-manager/blob/main/assets/create.png)


---

## Requirements

- Strapi v5 (v5.0.0 or later)
- Node.js ≥ 18

---

## Installation

```bash
# npm
npm install strapi-plugin-group-manager

# yarn
yarn add strapi-plugin-group-manager
```

Then enable the plugin in your Strapi app's `config/plugins.ts` (or `.js`):

```ts
export default {
  'group-manager': {
    enabled: true,
  },
};
```

Rebuild and restart your Strapi app:

```bash
npm run build
npm run develop
```

---

## Usage

1. Open the Strapi admin panel.
2. Navigate to **Group Manager** in the left sidebar.
3. Click **Create group** to add a new group, give it a name, colour, and icon.
4. Use the **Assign** button on each group to add collection types or components.

---

## Permissions

Manage access under **Settings → Roles** in the admin panel. The plugin registers the following permissions:

| Permission | Description |
| --- | --- |
| `plugin::group-manager.access` | Access the Group Manager page |
| `plugin::group-manager.groups.read` | View groups |
| `plugin::group-manager.groups.create` | Create groups |
| `plugin::group-manager.groups.update` | Edit groups |
| `plugin::group-manager.groups.delete` | Delete groups |

---


## Development

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Watch for changes (link to a local Strapi app)
yarn watch:link

# Type-check
yarn test:ts:front
yarn test:ts:back

# Verify plugin structure
yarn verify
```

---

## License

[MIT](./LICENSE)
