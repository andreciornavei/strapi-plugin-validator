const { getValue, skippable } = require('indicative-utils')
const { parse, isValid } = require("date-fns")

module.exports = (extend) => {
  extend('time', {
    async: true,
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/
      if (!regex.test(fieldValue)) {
        return false
      }
      return true
    }
  })
}