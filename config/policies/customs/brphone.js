const { getValue, skippable } = require('indicative-utils')

const tryFormatterPhone = (phone) => {
  let newString;
  if (phone.length === 11) {
    newString = '(' + phone.substr(0, 2) + ')' + ' ' + phone.substr(2, 5) + '-' + phone.substr(7, phone.length);
  }
  else {
    newString = '(' + phone.substr(0, 2) + ')' + ' ' + phone.substr(2, 4) + '-' + phone.substr(6, phone.length);
  }
  return newString;
};

const isPhone = (phone) => {
  const exp = /\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}-[0-9]{4}/g;
  let result = exp.test(phone);
  if (!result && (phone.length === 11 || phone.length === 10)) {
    const attemptResult = tryFormatterPhone(phone);
    result = exp.test(attemptResult);
  }
  return result;
}


module.exports = (extend) => {
  extend('brphone', {
    async: true,
    async validate(data, field, args, config) {
      try {
        const fieldValue = getValue(data, field)
        if (skippable(fieldValue, field, config)) {
          return true
        }
        return isPhone(fieldValue)
      } catch (error) {
        return false;
      }
    }
  })
}
