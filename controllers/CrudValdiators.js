'use strict';

const _ = require("lodash")

module.exports = {
  find: async (ctx) => {
    const validators = []
    for (const api in strapi.api) {
      if (_.get(strapi.api[api], "config.validators")) {
        for (const validator in strapi.api[api].config.validators) {
          validators.push({
            "module": "api",
            "contenttype": api,
            "name": validator
          })
        }
      }
    }
    ctx.status = 200
    ctx.body = validators
    return ctx
  }
}