const { getValue, skippable } = require('indicative-utils')
const phone = require('phone');

module.exports = (extend) => {
  extend('e164', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        const phoneData = phone(fieldValue);
        if (phoneData.length == 0) throw Error("Phone was not validated")
        return true
      } catch (error) {
        return false;
      }
    }
  })
}
