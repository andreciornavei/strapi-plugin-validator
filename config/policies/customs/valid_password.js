const { getValue, skippable } = require('indicative-utils')
const _ = require("lodash")

module.exports = (extend) => {
  extend('validPassword', {
    async: true,
    async validate(data, field, args, config) {
      if (!_.get(data, `tip._ctx.user`)) return false
      // find the table module
      const fieldValue = getValue(data, field)
      const currentPassword = _.get(data, `tip._ctx.user.password`)
      if (skippable(fieldValue, field, config)) return true
      if (!strapi.plugins['users-permissions'].services.user.validatePassword(fieldValue, currentPassword)) {
        return false
      }
      return true
    }
  })
}
