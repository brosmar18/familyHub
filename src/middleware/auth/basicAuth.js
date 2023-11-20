const base64 = require('base-64');
const bcrypt = require("bcrypt");
const { userCollection } = require('../../models');
const logger = require('../../utils/logger'); 

const basicAuth = async (req, res, next) => {
    try {
        let { authorization } = req.headers;

        if (!authorization) {
            logger.warn("No authorization header provided"); 
            res.status(401).send("No authorization header provided");
            return;
        }

        let authString = authorization.split(' ')[1];
        let decodedAuthString = base64.decode(authString);
        let [username, password] = decodedAuthString.split(':');

        logger.info(`Authenticating user: ${username}`);

        let user = await userCollection.findOne({ where: { username } });

        if (user) {
            let validUser = await bcrypt.compare(password, user.password);

            if (validUser) {
                req.user = user;
                logger.info("Authentication successful, calling next()"); 
                next();
            } else {
                logger.warn("Authentication failed: Password incorrect"); 
                res.status(403).send("Not Authorized (password incorrect)");
            }
        } else {
            logger.warn("Authentication failed: User does not exist"); 
            res.status(403).send("Not Authorized (user doesn't exist in DB)");
        }
    } catch (error) {
        logger.error("Error in basicAuth middleware", { error }); 
        res.status(500).send("Internal Server Error");
    }
};

module.exports = basicAuth;
