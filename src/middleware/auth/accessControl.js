const logger = require('../../utils/logger'); 

module.exports = (capability) => (req, res, next) => {
    try {
        if (req.user && req.user.capabilities.includes(capability)) {
            next();
        } else {
            // Log the unauthorized attempt
            const username = req.user ? req.user.username : 'Unknown';
            logger.warn(`User ${username} attempted to ${capability} without sufficient permissions.`);

            // Respond with a 403 Forbidden status
            res.status(403).send({
                message: `User ${username} does not have the ability to ${capability}.`
            });
        }
    } catch (e) {
        logger.error(`Error in ACL Middleware: ${e.message}`); 
        next(new Error('Error occurred in access control'));
    }
};
