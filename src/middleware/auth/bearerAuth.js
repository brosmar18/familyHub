const { sequelizeDatabase } = require('../../models');
const logger = require('../../utils/logger'); 

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    next("Not Authorized, no token present!");
  } else {
    try {
      let parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        let token = parts[1];
        logger.debug(`Token from bearer middleware: ${token}`); 

        let validUser = await sequelizeDatabase.models.User.authenticateBearer(token);
        if (validUser) {
          req.user = validUser;
          next();
        } else {
          next("Invalid token provided");
        }
      } else {
        next("Invalid Authorization header format. Format is Authorization: Bearer [token]");
      }
    } catch (e) {
      logger.error(`Error in bearerAuth middleware: ${e.message}`); 
      next(new Error("Error processing the token"));
    }
  }
};
