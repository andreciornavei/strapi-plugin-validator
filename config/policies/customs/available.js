const { getValue, skippable } = require('indicative-utils')
const _ = require("lodash")

// args[0] = THE PATH IN DOT NOTATION TO _STATE FIELD
// args[1] = THE COLUMN OF THE DESIRED TABLE
// args[2] = THE DESIRED TABLE TO COMPARE VALUE
// args[3] = THE DESIRED TABLE MODULE IF APPLY (optional if module equals to API)

module.exports = (extend) => {
  extend('available', {
    async: true,
    compile(args) {
      if (args.length < 2 || args.length > 3) {
        throw new Error('Available rule needs the column name, table and a optional module')
      }
      return args
    },
    async validate(data, field, args, config) {

      // find the table module
      const module = args[2] == undefined || args[2] == "api" ? null : args[2]

      const fieldValue = getValue(data, field)
      let currentValue = undefined
      if (args[1] === "user") {
        currentValue = _.get(data, `tip._ctx.user.${args[0]}`)
      } else {
        const recordData = await strapi.query(args[1], module).findOne({ id: _.get(data, "tip._ctx.params.id") })
        if (recordData) currentValue = _.get(recordData, args[0])
      }

      if (skippable(fieldValue, field, config)) {
        return true
      }
      const content = await strapi.query(args[1], module).findOne({
        [args[0]]: fieldValue,
        [`${args[0]}_ne`]: currentValue
      });
      if (content) {
        return false
      }
      return true
    }
  })
}
