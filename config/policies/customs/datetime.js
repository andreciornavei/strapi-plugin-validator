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
      const formatPattern = args.length > 0 ? args.join(":") : "yyyy-MM-dd HH:mm"
      const parseDate = parse(fieldValue, formatPattern, new Date());
      if (!isValid(parseDate)) {
        return false
      }
      return true
    }
  })
}
