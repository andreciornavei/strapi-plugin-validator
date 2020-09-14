const { getValue, skippable } = require('indicative-utils')

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
      const records = await strapi.query(args[0]).count({
        [args[1]]: String(fieldValue),
      });
      if (!records || records == 0) {
        return false
      }
      return true
    }
  })
}