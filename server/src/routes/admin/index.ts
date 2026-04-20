import groupRoutes from './group';

export default () => ({
  type: "admin",
  routes: [
    ...groupRoutes().routes,
  ],
});