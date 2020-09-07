module.exports = () => {

  // ******************************************************* //
  // append validator as a middleware to register policies   //
  // ******************************************************* //
  strapi.config.middleware.load.after.push('validator')  
  
};