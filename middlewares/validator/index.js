const _ = require('lodash');

module.exports = strapi => {
  return {
    initialize() {
      // Attach validations/sanitizors to admin panel actions
      _.forEach(strapi.admin.config.routes, value => {
        if (_.get(value.config, 'validate')) value.config.policies.push('plugins::validator.validate');
        if (_.get(value.config, 'sanitize')) value.config.policies.push('plugins::validator.sanitize');
      });
      // Attach validations/sanitizors to api/application actions
      _.forEach(strapi.config.routes, value => {
        if (_.get(value.config, 'validate')) value.config.policies.push('plugins::validator.validate');
        if (_.get(value.config, 'sanitize')) value.config.policies.push('plugins::validator.sanitize');
      });
      // Attach validations/sanitizors to plugins actions
      if (strapi.plugins) {
        _.forEach(strapi.plugins, plugin => {
          _.forEach(plugin.config.routes, value => {
            if (_.get(value.config, 'validate')) value.config.policies.push('plugins::validator.validate');
            if (_.get(value.config, 'sanitize')) value.config.policies.push('plugins::validator.sanitize');
          });
        });
      }
    },
  };
};
