const { getValue, skippable } = require('indicative-utils')
const { isCpf } = require("validator-brazil");

module.exports = (extend) => {
  extend('cpf', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return isCpf(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}