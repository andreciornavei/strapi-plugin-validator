const { getValue, skippable } = require('indicative-utils')
const { isCpf, isCnpj } = require("validator-brazil");

module.exports = (extend) => {
  extend('cpfj', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return isCpf(fieldValue) || isCnpj(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}
