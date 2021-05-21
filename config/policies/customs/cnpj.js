const { getValue, skippable } = require('indicative-utils')
const { isCnpj } = require("validator-brazil");

module.exports = (extend) => {
  extend('cnpj', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return isCnpj(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}
