'use strict';

const _ = require("lodash")

module.exports = {
  find: async (ctx) => {
    const validators = []
    const modules = ["api", "plugins"]
    for (const module of modules) {
      _.forEach(strapi[module], (node, key) => {
        if (_.get(node, "config.validators")) {
          for (const validator in _.get(node, "config.validators")) {
            validators.push({
              "module": module,
              "contenttype": key,
              "name": validator,
              "path": `${module}.${key}.config.validators.${validator
                }`
            })
          }
        }
      })
    }
    ctx.status = 200
    ctx.body = validators
    return ctx
  },
  findOne: async (ctx) => {
    const validator = _.get(strapi, ctx.params.validator)
    ctx.status = validator ? 200 : 404
    ctx.body = validator ? validator : "Not Found"
    return ctx
  }
}