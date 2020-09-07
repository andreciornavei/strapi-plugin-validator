const _ = require('lodash');

module.exports = strapi => {
  return {
    initialize() {

      _.forEach(strapi.admin.config.routes, value => {
        if (_.get(value.config, 'validator')) {
          value.config.policies.push('plugins::validator.validate');
        }
      });

      _.forEach(strapi.config.routes, value => {
        if (_.get(value.config, 'validator')) {
          value.config.policies.push('plugins::validator.validate');
        }
      });

      if (strapi.plugins) {
        _.forEach(strapi.plugins, plugin => {
          _.forEach(plugin.config.routes, value => {
            if (_.get(value.config, 'validator')) {
              value.config.policies.push('plugins::validator.validate');
            }
          });
        });
      }

    },
  };
};