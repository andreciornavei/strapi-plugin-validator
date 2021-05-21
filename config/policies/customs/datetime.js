const { getValue, skippable } = require('indicative-utils')
const { parse, isValid } = require("date-fns")

module.exports = (extend) => {
  extend('datetime', {
    async: true,
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }
      const formatPattern = args[0] || "yyyy-MM-dd HH:mm"
      const parseDate = parse(fieldValue, formatPattern, new Date());
      if (!isValid(parseDate)) {
        return false
      }
      const datesplit = fieldValue.split(" ")
      if (datesplit.length != 2) return false
      const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/
      if (!regex.test(datesplit[1])) {
        return false
      }

      return true
    }
  })
}
