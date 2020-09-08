const { getValue, skippable } = require('indicative-utils')

module.exports = (extend) => {
  extend('unique', {
    async: true,
    compile(args) {
      if (args.length < 2 || args.length > 3) {
        throw new Error('Unique rule needs the column name, table and a optional module')
      }
      return args
    },
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }
      const module = args[2] == undefined || args[2] == "api" ? null : args[2]
      const content = await strapi.query(args[1], module).findOne({
        [args[0]]: fieldValue,
      });
      if (content) {
        return false
      }
      return true
    }
  })
}