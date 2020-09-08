const { getValue, skippable } = require('indicative-utils')
const { isCep } = require("validator-brazil");

module.exports = (extend) => {
  extend('cep', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return isCep(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}