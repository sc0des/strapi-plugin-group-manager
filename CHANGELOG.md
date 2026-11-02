# Changelog

## 1.1.0

### Added
- Single types can be assigned to groups, on a new **Single Types** tab in the create/edit dialog.
- Single types open in the Content Manager single type editor and show an **ST** badge in the group list.
- Unit tests for the group service and the available items endpoint (`yarn test`).

### Changed
- The server now keeps only known fields on create and update, and falls back to the default colour or icon when given an invalid value.
- Typed the admin fetch calls so the admin typecheck passes.

### Removed
- Unused components (`CollapsibleGroup`, `SidebarGroupInjection`) and empty Strapi template files (`bootstrap`, `destroy`, the sample controller and service, empty content-api routes).

### Notes
- No schema change. Single types are stored in the existing `collectionTypes` list, so groups created on 1.0.x load unchanged.
