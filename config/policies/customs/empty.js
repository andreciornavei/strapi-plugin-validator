const { getValue } = require('indicative-utils')

module.exports = (extend) => {
  extend('empty', {
    async: true,
    async validate(data, field) {
      try {
        const fieldValue = getValue(data, field)
        if (fieldValue == undefined) return true
        return fieldValue.length > 0
      } catch (error) {
        return false;
      }
    }
  })
}
