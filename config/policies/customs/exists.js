const { getValue, skippable } = require('indicative-utils')
const mongoose = require("mongoose")

module.exports = (extend) => {
  extend('exists', {
    async: true,
    compile(args) {
      if (args.length != 2) {
        throw new Error('Exists rule needs the column collection and field')
      }
      return args
    },
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }
      const record = await strapi.query(args[0]).model.findOne({
        // "_id": mongoose.Types.ObjectId(fieldValue),
        [args[1]]: fieldValue,
      });
      if (!record) {
        return false
      }
      return true
    }
  })
}