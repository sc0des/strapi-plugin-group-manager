/**
 * Application methods
 */
import register from "./register";

/**
 * Plugin server methods
 */
import config from "./config";
import contentTypes from "./content-types";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";

export default {
  register,
  config,
  controllers,
  routes,
  services,
  contentTypes,
};