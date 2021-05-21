# strapi-plugin-validator

## 🚀 &nbsp; _Overview_

This plugins was created on top of [Indicative][indicative] project, mantained by [Adonis.js][adonisjs] with the purpose to keep simple the management of validations on Strapi Projects. Also, this enriches the standard validation of the strapi content-types, including a better response structure to frontend.

---

## ⏳ &nbsp; _Installation_

With npm:
```bash
npm install strapi-plugin-validator
```

With yarn:
```bash
yarn add strapi-plugin-validator
```

---

## _Changes in yours strapi project strucutre._

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

### 1.1 - The content of file _`validators.json`_
Once you determine the better place where you want to write your validator based in your self purposes, its time to create its content. For this example, i will create a custom validator for user (_created by users-permission plugin_) placed in `extensions` folder, it because strapi validator is a bit poor and i want to create a better validation for custom fields that i can create in my user content-type. 

So below, you can see the structure of this file.

```json
{
    "validators": {
        "user": {
            "message":"It appears that there is some invalid information on your user.",
            "rules": {
                //Example with Array Structure 
                //[the basic approach]
                "email": [
                  "required",
                  "email"
                ],
                //Example with Object Structure
                //[approach with custom messages]
                "password": {
                  "required": "The password is the most important!!",
                  "min:4": "And must to have a minimal 4 character length!!"
                },
                //Example with String Structure
                //[approach referring to another validator as a deep level validation] 
                "address": "api.address.config.validators.address"
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

* __`validstors` / [`user`] / `message`__:

  The property __`message`__ is __`optional`__ and its value should be a message to frontend explaining a generic fail information for this request. If this is not informed, the default message is "`Bad Request`"

* __`validstors` / [`user`] / `rules`__:

  The property __`rules`__ content must to be a object following the rules of [indicative][indicative] project, to see all allowed validation rules, read this [link][validations]. Each rule can have three types of value structure, and for each structure, there is a different behavior, the types of structure can be `Array`, `Object` or `String`:

  * __`Array`__: The Array is the most basic approach of validation, each item of the array must to be a string identifying the validation rule (_that you can find accessing the [indicative][indicative] project_) or reading the customized validations on the section `Custom Validation` on this documentation.
  * __`Object`__: The Object also implements validations, but different from the Array, the rule must be identified in the object's key, leaving the value of that key free for you to create a customized message for your users.
  * __`String`__: The String value must to be a path to another validator using dot notation, allowing you to create deep level validations and reuse these validations in other validators.

---

### 2.0 - The file `routes.json`

Finally, we need to append the validator to some route who need to pass by validation. To do it is very simple and for that i will use the same example of __`user`__ model like before. In this case i will need to recreate a file `routes.json` on _`extensions/users-permissions/config`_ to override the default route config of users-permission plugin:

```json
{
    "routes": [
        {
            "method": "POST",
            "path": "/auth/local/register",
            "handler": "Auth.register",
            "config": {
                "policies": [
                    "plugin::users-permissions.ratelimit"
                ],
                "prefix": "",
                "description": "Register a new user with the default role",
                "tag": {
                    "plugin": "users-permissions",
                    "name": "User",
                    "actionType": "create"
                },
                "validate": "plugins.users-permissions.config.validators.user"
            }
        }
    ]
}
```

Here, i has copied all content of routes of __`users-permissions`__ plugin and added a new property __`validate`__ inside __`routes.[0].config`__, basically the value of __`validate`__ property is the path to the __`validators.json`__ and the __`identifier`__ of validator inside this file on the end.

In additional, you can use the property __`validate_ignore_required`__ as `true` to indicate that this route doesn't need fields to be required, so in your requests for update data, any field will not be required and you can pass only needed fields to update.

---
## The frontend result.

Well, if you knows the basic valdiation of strapi, may you know that the result of this validation is not so friendly to frontend, some of theses problems is a single validation by request (_`response returns when the first validation fails`_), and a response object pattern that doesn't tell to frontend the exact field who fails (_`the frontend needs to treat the value of each property id to knows the failed field`_) like example below:

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
    "statusCode": 400,
    "error": "Bad Request",
    "message": "It appears that there is some invalid information on your user form.", 
    "data": [
      {
        "message": "Email is already in use.",
        "validation": "unexists",
        "field": "email"
      }
    ]       
}
```

---

## Custom validations

This plugin implements other usually validations that indicative doest support by default.

> ### ___`unexists`___
>_It checks if the requested field value does not exists inside some content-type and return an error if this value is founded on database._
>
> `Example.:` _Check if the email is available for use._
> ```json
>"rules": {
>    "email": [
>      "unexists:email,user,users-permissions"
>    ]
>}
> ```
>* `args[0]` : The content-type column name
>* `args[1]` : The content-type name
>* `args[2]` : Is optional, verify the plugin where  content-type resides
>
> &nbsp;

> ### ___`exists`___
> _It checks if the requested field value exists inside some content-type and return an error if this value is not founded on database._
>
> `Example.:` _Check if the plan id informed by user exists on database._
>  ```json
> "rules": {
>     "plan": [
>       "exists:id,plan"
>     ]
> }
>  ```
> * `args[0]` : The content-type column name
> * `args[1]` : The content-type name
> * `args[2]` : Is optional, verify the plugin where  content-type resides
>
> &nbsp;

> ### ___`empty`___
> _It checks if the requested field value is empty and return an error if it is true._
>
> `Example.:` _The name is not undefined, but is an empty string, so it checks if is an string with zero length._
>  ```json
> "rules": {
>     "name": [
>       "empty"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`invalid_when`___
> _It throws an error if the first parameter (another field on the payload) has some of one values on the next other (n params)._
>
> `Example.:` _Imagine a register of property, the field garden only can be filled if it is a common house, otherwise like (apartment or yatch) it cannot have a garden._
>  ```json
> "rules": {
>     "garden": [
>       "invalid_when:property_type,apartment,yacht"
>     ]
> }
>  ```
> * `args[0]` : Another field on payload to be analyzed
> * `args[1]` : Some value to be compared
> * `args[n]` : More values to be compared
>
> &nbsp;

> ### ___`objectid`___
> _It throws an error if the value passed is not a valid ObjectId (validated by mongoose)._
>
> `Example.:` _Strapi brokes when you pass an invalid ObjectId to it, so you can validate and send a message to user before it happens._
>  ```json
> "rules": {
>     "plan": [
>       "objectid"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`file`___
> _It throws an error if the value passed is not a valid file._
>
> `Example.:` _The registered user must to provide an avatar picture and the upload must to be an image._
>  ```json
> "rules": {
>     "avatar": [
>       "file:image"
>     ]
> }
>  ```
> * `args[0]` : The file type (image|video|any)
>
> &nbsp;

> ### ___`datetime`___
> _It throws an error if the value passed does not match a specified valid date pattern._
>
> `Example.:` _The registered user must to provide its birthday with hour and minute._
>  ```json
> "rules": {
>     "avatar": [
>       "datetime:yyyy-MM-dd HH:mm"
>     ]
> }
>  ```
> * `args[0]` : The date pattern to match (default is yyyy-MM-dd HH:mm)
>
> &nbsp;

> ### ___`e164`___
> _It throws an error if the value passed does not match the global format pattern e.164 for phones._
>
> `Example.:` _The registered user must to provide a valid phone number._
>  ```json
> "rules": {
>     "phone": [
>       "e164"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`brphone`___
> _It throws an error if the value passed does not match the brazilian phone number pattern "0000000000" or "00900000000" | (without mask)._
>
> `Example.:` _The registered user must to provide a valid brazilian phone number._
>  ```json
> "rules": {
>     "phone": [
>       "brphone"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`cep`___
> _It throws an error if the value passed does not match the brazilian zipcode number pattern "00000000" | (without mask)._
>
> `Example.:` _The registered user must to provide a valid brazilian zipcode number._
>  ```json
> "rules": {
>     "zipcode": [
>       "cep"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`cnpj`___
> _It throws an error if the value passed was not a valid brazilian company registry number (CNPJ) | (without mask)._
>
> `Example.:` _The registered user must to provide its valid company registry number._
>  ```json
> "rules": {
>     "document": [
>       "cnpj"
>     ]
> }
>  ```
>
> &nbsp;


> ### ___`cpf`___
> _It throws an error if the value passed was not a valid  brazilian personal registry number (CPF) | (without mask)._
>
> `Example.:` _The registered user must to provide its valid company registry number._
>  ```json
> "rules": {
>     "document": [
>       "cpf"
>     ]
> }
>  ```
>
> &nbsp;

> ### ___`cpfj`___
> _It throws an error if the value passed was not a valid  brazilian personal registry number (CPF) or brazilian company registry number (CNPJ) | (without mask)._
>
> `Example.:` _The registered user must to provide its valid company registry number._
>  ```json
> "rules": {
>     "document": [
>       "cpfj"
>     ]
> }
>  ```
>
> &nbsp;
---

## 🎉 &nbsp;  _Congradulations, You're done._

How can you see, is not so hard to implement custom validations with this plugin, and if you have been followed step-by-step of this documentation, you probably now can implement youself validations and make your project easy. I hope to have been made it simple for you understand and that this project helps you in your own project.

---
## 📜 &nbsp; _License_

This project is under the MIT license. See the [LICENSE](./LICENSE) for details.

--- 

💻 &nbsp; Developed by André Ciornavei - [Get in touch!](https://www.linkedin.com/in/andreciornavei/)


[indicative]: https://indicative.adonisjs.com/
[validations]: https://indicative.adonisjs.com/validations/master/array
[adonisjs]: https://adonisjs.com/
[dto]: https://en.wikipedia.org/wiki/Data_transfer_object