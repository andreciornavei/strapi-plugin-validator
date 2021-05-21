const { getValue, skippable } = require('indicative-utils')
const _ = require("lodash")

module.exports = (extend) => {
  extend('invalidWhen', {
    async: true,
    compile(args) {
      if (args.length < 2) {
        throw new Error('InvalidWhen rule needs 2 arguments as a minimal input')
      }
      return args
    },
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }

      if (!Object.keys(_.get(data, "tip")).includes(args[0])) {
        // throw new Error("The first argument must to be a field on input data.")
        return false;
      }

      const targetField = args.shift()
      const targetValue = getValue(data, targetField)
      if (args.includes(targetValue)) {
        // throw new Error("This field cannot be filled if field ${args[0]} has the following values (${invalidValues.join(',')}).")
        return false;
      }

      return true;
    }
  })
}
