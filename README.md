# strapi-plugin-validator

## Overview

This plugins was created on top of [Indicative][indicative] project mantained by [Adonis.js][adonisjs] with the purpose to keep simple the management of validations on Strapi Projects, both by panel and by code. Also, this enriches the standard validation of the strapi content-types, including a better response structure to frontend.

---

## Changes in yours strapi project strucutre.

This plugin doesn't need many changes in yours project, so dont be worry because it should not broke.

### 1.0 - The file _`validators.json`_

To allow this plugin integrate with your project, all you need is create a new file called `validators.json` inside yours `content-types`, `extensions` or `plugins` folders like below:

```bash
--- api/
    --- your-content-type/
        --- config/
            validators.json
            
--- extensions/
    --- installed-plugin-name/
        --- config/
            validators.json

--- plugins/
    --- your-custom-plugin/
        --- config/
            validators.json
```

### 1.2 - The content of file _`validators.json`_
Once you determine the better place where you want to write your validator based in your self purposes, its time to create its content. For this example, i will create a custom validator for user (_created by users-permission plugin_) placed in `extensions` folder, it because strapi validator is a bit poor and i want to create a better validation for custom fields that i can create in my user content-type. 

So below, you can see the structure of this file.

```json
{
    "validators": {
        "user": {
            "model": "plugins.users-permissions.models.user",
            "message":"It appears that there is some invalid information on your user.",
            "rules": {
                "username": "required|alpha_numeric",
                "email": "required|email",
                "password": "required|min:4",
                "address": {
                    "rule": "required",
                    "validator": "api.address.config.validators.address"
                }
            }
        }
    }
}
```
As you can see, it is not so hard to understand, so lets explain each property, on-by-one.

* __`validators`__:

  This is a mandatory property needed by plugin, its because strapi expose configs for each content-type, and the plugin needs to find validators inside this configs. How this is an object, you can create many validators inside it to serve several purposes.

* __`validators` / [`user`]__:

  __[`user`]__ its only an identifier for your validator, so it could by any name, you will need this to relate a validator to another validator if the validation has a deep level object to validate. Also, this identifier will be used on routes to define whitch route will need to be validated by your validator.

* __`validstors` / [`user`] / `model`__:

  The property __`model`__ is __`optional`__ and its value should be the path for a which model you want to validate. It's optional because by default, when a model is created it already has some validation properties like (_`required`, `enum`, `type`, `minLength`, `maxLength`, `unique`, etc..._) and this plugin can read it and append this rules to itself rules. But if you dont want to inherit these properties, or you want to validate only a [_DTO_][dto], so this is not required.

* __`validstors` / [`user`] / `message`__:

  The property __`message`__ is __`optional`__ and its value should be a message to frontend explaining a generic fail information for this request. If this is not informed, the default message is "`Bad Request`"

* __`validstors` / [`user`] / `rules`__:

  The property __`rules`__ is also __`optional`__ and its content must to be a object following the rules of [indicative][indicative] project, to see all allowed validation rules, read this [link][validations]. It's optional because you may want to inherit only model properties and not append new rules, but if you do not inform both model and rules, so your query will not have anything to validate and will pass. In additional, was implemented a custom handler for this structure how you can see in the `address` example, in this case, it is an object with two properties:

  * __`rule`__: it's the same of standard rules following the [indicative][indicative] project.
  * __`validator`__: it's a path to other validator, indicating that this rule is a deep rule containing more validations. It should be used if your model contains a relationship that need to be validated in the same query. For this example, the user must to be created with an address, so its address should to be valid too. In additional, when this field (__`validator`__) is present, it's append the value _`object`_ to __`rule`__ property by default, it guarantees that the field _`address`_ is an object.

---

### 2.0 - The file `routes.json`

Finally, we need to append the validator to some route who need to pass by validation. To do it is very simple and for that i will use the same example of __`user`__ model like before. In this case i will need to create a file `routes.json` on _`extensions/users-permissions/config`_ to override the default route config of users-permission plugin:

```json
{
    "routes": [
        {
            "method": "POST",
            "path": "/auth/local/register",
            "handler": "Auth.register",
            "config": {
                "policies": [
                    "plugins.users-permissions.ratelimit"
                ],
                "prefix": "",
                "description": "Register a new user with the default role",
                "tag": {
                    "plugin": "users-permissions",
                    "name": "User",
                    "actionType": "create"
                },
                "validator": "plugins.users-permissions.config.validators.user"
            }
        }
    ]
}
```

Here, i has copied all content of routes of __`users-permissions`__ plugin and added a new property __`validator`__ inside __`routes.[0].config`__, basically the value of __`validator`__ property is the path to the __`validators.json`__ and the __`identifier`__ of validator inside this file on the end.

In additional, you can use the property __`validator_ignore_required`__ as `true` to indicate that this route doesn't need fields to be required, so in your requests for update data, any field will not be required and you can pass only needed fields to update.

---

## The frontend result.

Well, if you knows the basic valdiation of strapi, may you know that the result of this validation is not so friendly to frontend, some of theses problems is a single validation by request (_`response returns when the first validation fails`_), a redundant information about status code (_`that already cames on header`_), and a response object pattern that doesn't tell to frontend the exact field who fails (_`the frontend needs to treat the value of each property id to knows the failed field`_) like example below:

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": [
        {
            "messages": [
                {
                    "id": "Auth.form.error.email.taken",
                    "message": "Email is already taken."
                }
            ]
        }
    ]
}
```

This plugin uses the [indicative][indicative] response pattern, that presents to forntend exacly what it needs to know about the `field`, `validation error type` and `message`.

```json
{
    "message": "It appears that there is some invalid information on your user.", 
    "fields": [
      {
        "message": "Email is already taken.",
        "validation": "unique",
        "field": "email"
      }
    ]       
}
```

---

## Custom validations

This plugin implements other usually validations that indicative doest support by default.

### ___`unique:`___
_It checks if the requested field value exists inside some content-type._
 ```json
"rules": {
    "email": "unique:email,user,users-permissions"
}
 ```
* `args[0]` : The content-type column name
* `args[1]` : The content-type name
* `args[2]` : Is optional, verify the plugin where  content-type resides

---

## _🎉 That's all, folks._

How can you see, is not so hard to implement custom validations with this plugin, and if you have been followed step-by-step of this documentation, you probably now can implement youself validations and make your project easy. I hope to have been made it simple for you understand and that this project helps you in your own project.



[indicative]: https://indicative.adonisjs.com/
[validations]: https://indicative.adonisjs.com/validations/master/array
[adonisjs]: https://adonisjs.com/
[dto]: https://en.wikipedia.org/wiki/Data_transfer_object