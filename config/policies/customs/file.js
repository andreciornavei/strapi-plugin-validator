const { getValue, skippable } = require('indicative-utils')
const mime = require('mime');

module.exports = (extend) => {
  extend('file', {
    async: true,
    async validate(data, field, args, config) {
      const fieldValue = getValue(data, field)
      if (skippable(fieldValue, field, config)) {
        return true
      }
      try {
        const mimeType = mime.getType(fieldValue.name)
        if (mimeType) {
          const type = mimeType.split("/")[0]
          if (type == "video" && args.includes("video")) return true;
          if (type == "image" && args.includes("image")) return true;
          if (!["video", "image"].includes(type) && args.includes("any")) return true;
        }
      } catch (error) {
        return false;
      }
      return false;
    }
  })
}
