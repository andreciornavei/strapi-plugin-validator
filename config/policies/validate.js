const _ = require('lodash');
const { extend, validateAll } = require('indicative/validator')
const { parseMultipartData } = require('strapi-utils');
require("./customs/exists")(extend)
require("./customs/unexists")(extend)
require("./customs/datetime")(extend)
require("./customs/cpf")(extend)
require("./customs/cnpj")(extend)
require("./customs/cpfj")(extend)
require("./customs/cep")(extend)
require("./customs/brphone")(extend)
require("./customs/e164")(extend)
require("./customs/file")(extend)
require("./customs/empty")(extend)
require("./customs/objectid")(extend)
require("./customs/invalid_when")(extend)
require("./customs/available")(extend)
require("./customs/valid_password")(extend)


const input = (ctx) => {
  if (ctx.is('multipart')) {
    const multipart = parseMultipartData(ctx);
    return { ...multipart.data, ...multipart.files }
  } else {
    return _.get(ctx, "request.body", {})
  }
}

const removeRule = (rules, rule) => {
  rules.indexOf(rule) !== -1 && rules.splice(rules.indexOf(rule), 1)
}

const resolveSettings = (settings, ignoreRequired) => {
  const { fields, messages } = settings.rules ? resolveRules(settings.rules, ignoreRequired) : { fields: {}, messages: {} }
  return {
    rules: fields,
    messages: messages
  }
}

const resolveRules = (rules, ignoreRequired) => {
  const fields = {}
  const messages = {}
  for (const rule in rules) {
    // Check each type of rules based on type variable
    // 1 - String - [is a reference to other file validation]
    // 2 - Array - [is an array of values of rules for this field]
    // 3 - Object - [is a key/valu map where key is the rule and value is the custom message]
    if (_.isString(rules[rule])) {
      const appendRules = rules[rule].split("|")
      const ref = appendRules.shift() // remove the first element (the reference) and get the rest (rules)
      if (!appendRules.includes("object")) appendRules.push("object")
      if (appendRules.includes("required") && ignoreRequired == true) removeRule(appendRules, "required")
      fields[rule] = appendRules.join("|")
      if (settings = _.get(strapi, ref)) {
        const { rules: deepRules, messages: deepMessages } = resolveSettings(settings, ignoreRequired)
        if (Object.keys(deepRules).length > 0) {
          for (const deepRule in deepRules) {
            fields[`${rule}.${deepRule}`] = deepRules[deepRule]
          }
          _.forEach(deepMessages, (deepMessage, deepKey) => {
            messages[`${rule}.${deepKey}`] = deepMessage
          })
        }
      }
    } else if (_.isArray(rules[rule])) {
      const appendRules = rules[rule]
      if (appendRules.includes("required") && ignoreRequired == true) removeRule(appendRules, "required")
      if (appendRules.length > 0) fields[rule] = appendRules.join("|")
    } else if (_.isObject(rules[rule])) {
      const appendRules = Object.keys(rules[rule])
      if (appendRules.includes("required") && ignoreRequired == true) removeRule(appendRules, "required")
      if (appendRules.length > 0) {
        _.forEach(appendRules, (ruleItem) => {
          messages[`${rule}.${ruleItem.split(/:(.+)/)[0]}`] = rules[rule][ruleItem]
        })
        fields[rule] = appendRules.join("|")
      }
    }
  }
  return { fields: fields, messages: messages }
}

const resolveModule = async (ctx, module) => {
  // Get the verb and endpoint from route to search for correspondent
  // route in configs
  const [ctxVerb, ctxEndpoint] = ctx.request.route.endpoint.split(" ");
  // Check if module.config.routes is an object to continue
  if (!_.isObject(module.config.routes)) return "module.config.routes is not an valid object."
  // Find the correspondent route for this request
  const route = Object.values(module.config.routes).find(route => {
    return (
      _.get(route, "config.validate") &&
      ctxEndpoint === _.get(route, "path") &&
      ctxVerb.toLowerCase() === _.get(route, 'method').toLowerCase()
    )
  })
  // Check if validation route exists to continue
  if (!route) return "the validation route does not exists."
  const validation = _.get(route, "config.validate")
  const ignoreRequired = _.get(route, "config.validate_ignore_required", false)
  const settings = _.isString(validation) ? _.get(strapi, validation) : _.isObject(validation) ? validation : undefined
  // Check if settings variable is a valid validator to continue
  if (!settings) return "validation settings is not valid."
  const { rules, messages } = resolveSettings(settings, ignoreRequired)
  // remove rules that doesn't have any validation
  for (const rule in rules) {
    if (rules[rule].legnth == 0) delete rules[rule]
  }
  // Try to validate inputs applying rules
  try {
    const data = input(ctx)
    await validateAll({
      ...data,
      _ctx: {
        user: _.get(ctx, "state.user"),
        params: _.get(ctx, "params")
      },
    }, rules, messages || {});
    return true;
  } catch (error) {
    if (_.get(error, "message")) {
      strapi.log.error(error.message)
      ctx.badImplementation(error.message)
    } else {
      ctx.badRequest(settings.message || "Invalid input data", error)
    }
    return ctx
  }
}

module.exports = async (ctx, next) => {
  let errorMessage = null
  const apiModuleResolved = resolved = await resolveModule(ctx, strapi)
  if (_.isString(apiModuleResolved)) errorMessage = apiModuleResolved
  if (!_.isString(apiModuleResolved)) {
    return apiModuleResolved === true ? await next() : apiModuleResolved;
  }
  if (strapi.plugins) {
    for (pluginKey in strapi.plugins) {
      const pluginModuleResolved = await resolveModule(ctx, strapi.plugins[pluginKey])
      if (_.isString(pluginModuleResolved)) errorMessage = pluginModuleResolved
      if (!_.isString(pluginModuleResolved)) {
        return pluginModuleResolved === true ? await next() : apiModuleResolved;
      }
    }
  }
  if (errorMessage) return ctx.badRequest(errorMessage)
  return await next();
};
