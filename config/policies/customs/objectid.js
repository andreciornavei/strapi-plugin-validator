const { getValue, skippable } = require('indicative-utils')
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = (extend) => {
  extend('objectid', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return ObjectId.isValid(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}
