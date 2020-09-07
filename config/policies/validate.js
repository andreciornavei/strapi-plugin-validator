const _ = require('lodash');
const { extend, validateAll } = require('indicative/validator')
const { getValue, skippable } = require('indicative-utils')

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

const resolveSettings = (settings) => {
  return Object.assign(
    settings.model ? resolveModel(settings.model) : {},
    settings.rules ? resolveRules(settings.rules) : {}
  )
}

const resolveModel = (model) => {
  if (object = _.get(strapi, model)) {
    return buildRules(object.attributes)
  }
  return undefined
}

const resolveRules = (rules) => {
  const fields = {}
  for (const rule in rules) {
    if (typeof rules[rule] === "string") {
      fields[rule] = rules[rule]
    } else if (typeof rules[rule] === "object") {
      if (rules[rule].validator) {
        const processRule = rules[rule].rule ? rules[rule].rule.split("|") : []
        if (!processRule.includes("object")) processRule.push("object")
        fields[rule] = processRule.join("|")
        const settings = _.get(strapi, rules[rule].validator);
        if (settings) {
          const deepFields = resolveSettings(settings)
          for (const deepField in deepFields) {
            fields[`${rule}.${deepField}`] = deepFields[deepField]
          }
        }
      } else if (rules[rule].rule) {
        fields[rule] = rules[rule].rule
      }
    }
  }
  return fields
}

const buildRules = (attributes) => {
  const fields = {}
  for (const attrName in attributes) {
    const attr = attributes[attrName];
    if (attr.type) {
      const rules = []
      if (attr.required) rules.push("required")
      if (attr.maxLength) rules.push(`max:${attr.maxLength}`)
      if (attr.minLength) rules.push(`min:${attr.minLength}`)
      switch (attr.type) {
        case "decimal":
          rules.push("float")
          if (attr.min) rules.push(`above:${attr.min}`)
          if (attr.max) rules.push(`under:${attr.max}`)
          break;
      }
      if (rules.length > 0) fields[attrName] = rules.join("|")
    }
  }
  return fields;
}


const resolveModule = async (ctx, module) => {
  const [ctxVerb, ctxEndpoint] = ctx.request.route.endpoint.split(" ");
  for (routeKey in module.config.routes) {
    const route = module.config.routes[routeKey]
    if (
      _.get(route.config, 'validator') &&
      _.get(route, 'path') === ctxEndpoint &&
      _.get(route, 'method') &&
      _.get(route, 'method').toLowerCase() === ctxVerb.toLowerCase()
    ) {
      const validator = _.get(route.config, 'validator')
      const settings = _.get(strapi, validator);
      const rules = resolveSettings(settings)
      try {
        await validateAll(ctx.request.body || {}, rules);
        return true;
      } catch (error) {
        ctx.status = 400
        ctx.body = {
          "message": settings.message || "Bad Request",
          "fields": error
        }
        return ctx
      }
    }
  }
  return undefined;
}


module.exports = async (ctx, next) => {
  const apiModuleResolved = resolved = await resolveModule(ctx, strapi)
  if (apiModuleResolved) {
    return apiModuleResolved === true ? await next() : apiModuleResolved;
  }
  if (strapi.plugins) {
    for (pluginKey in strapi.plugins) {
      const pluginModuleResolved = await resolveModule(ctx, strapi.plugins[pluginKey])
      if (pluginModuleResolved) {
        return pluginModuleResolved === true ? await next() : apiModuleResolved;
      }
    }
  }
  return await next();
};