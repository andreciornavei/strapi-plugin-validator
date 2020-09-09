const _ = require('lodash');
const { extend, validateAll } = require('indicative/validator')
const { parseMultipartData } = require('strapi-utils');
require("./customs/unique")(extend)
require("./customs/datetime")(extend)
require("./customs/time")(extend)
require("./customs/cpf")(extend)
require("./customs/cnpj")(extend)
require("./customs/cpfj")(extend)
require("./customs/cep")(extend)
require("./customs/brphone")(extend)
require("./customs/file")(extend)


const removeRule = (rules, rule) => {
  rules.indexOf(rule) !== -1 && rules.splice(rules.indexOf(rule), 1)
}

const resolveSettings = (settings, ignoreRequired) => {
  return mergeRules(
    settings.model ? resolveModel(settings.model, ignoreRequired) : {},
    settings.rules ? resolveRules(settings.rules, ignoreRequired) : {}
  )
}

const mergeRules = (fieldsModel, fieldsJson) => {
  const merge = {}
  const fields = [...new Set([...Object.keys(fieldsModel), ...Object.keys(fieldsJson)])]
  for (const field of fields) {
    if (Object.keys(fieldsModel).includes(field) && Object.keys(fieldsJson).includes(field)) {
      //if both model and field config has the same rule, keeps the file override
      const merging = {}
      const modelRules = fieldsModel[field].split("|").map(f => f.split(":"))
      const jsonRules = fieldsJson[field].split("|").map(f => f.split(":"))
      for (const rule of modelRules) {
        merging[rule[0]] = rule.join(":")
      }
      for (const rule of jsonRules) {
        merging[rule[0]] = rule.join(":")
      }
      merge[field] = Object.values(merging).join("|")
    } else if (Object.keys(fieldsModel).includes(field)) {
      // if only model has rules, keep model
      merge[field] = fieldsModel[field]
    } else if (Object.keys(fieldsJson).includes(field)) {
      // if only json has rules, keep json
      merge[field] = fieldsJson[field]
    }
  }
  return merge
}

const resolveModel = (model, ignoreRequired) => {
  if (object = _.get(strapi, model)) {
    return buildRules(object.attributes, ignoreRequired)
  }
  return undefined
}

const resolveRules = (rules, ignoreRequired) => {
  const fields = {}
  for (const rule in rules) {
    if (typeof rules[rule] === "string") {
      const processRule = rules[rule] ? rules[rule].split("|") : []
      if (processRule.includes("required") && ignoreRequired == true) removeRule(processRule, "required")
      fields[rule] = processRule.join("|")      
    } else if (typeof rules[rule] === "object") {
      if (rules[rule].validator) {
        const processRule = rules[rule].rule ? rules[rule].rule.split("|") : []
        if (!processRule.includes("object")) processRule.push("object")
        if (processRule.includes("required") && ignoreRequired == true) removeRule(processRule, "required")
        fields[rule] = processRule.join("|")
        const settings = _.get(strapi, rules[rule].validator);
        if (settings) {
          const deepFields = resolveSettings(settings, ignoreRequired)
          for (const deepField in deepFields) {
            fields[`${rule}.${deepField}`] = deepFields[deepField]
          }
        }
      } else if (rules[rule].rule) {
        const processRule = rules[rule].rule ? rules[rule].rule.split("|") : []
        if (processRule.includes("required") && ignoreRequired == true) removeRule(processRule, "required")
        fields[rule] = processRule.join("|")
      }
    }
  }
  return fields
}

const buildRules = (attributes, ignoreRequired) => {
  const fields = {}
  for (const attrName in attributes) {
    const attr = attributes[attrName];
    if (
      (
        attr.collection && attr.collection == "file" ||
        attr.model && attr.model == "file"
      ) && attr.plugin && attr.plugin == "upload"
    ) {
      //validate for files
      const rules = []
      if (attr.required && ignoreRequired == false) rules.push("required")
      rules.push(`file:${attr.allowedTypes ? attr.allowedTypes.join(",") : ""}`)
      if (rules.length > 0) fields[attrName] = rules.join("|")
    } else if (attr.type) {
      const rules = []
      if (attr.required && ignoreRequired == false) rules.push("required")
      if (attr.maxLength) rules.push(`max:${attr.maxLength}`)
      if (attr.minLength) rules.push(`min:${attr.minLength}`)
      switch (attr.type) {
        case "decimal":
          rules.push("float")
          if (attr.min) rules.push(`above:${attr.min}`)
          if (attr.max) rules.push(`under:${attr.max}`)
          break;
        case "enumeration":
          rules.push(`in:${attr.enum.join(",")}`)
          break;
        case "boolean":
          rules.push("boolean")
          break;
        case "date":
          rules.push("date")
          break;
        case "datetime":
          rules.push("datetime")
          break;
        case "time":
          rules.push("time")
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
      const ignoreRequired = _.get(route.config, 'validator_ignore_required') || false
      const settings = _.get(strapi, validator);
      const rules = resolveSettings(settings, ignoreRequired)
      try {
        let data = {}
        if (ctx.is('multipart')) {
          const multipart = parseMultipartData(ctx);
          data = { ...multipart.data, ...multipart.files }
        } else {
          data = ctx.request.body || {}
        }
        await validateAll(data || {}, rules);
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