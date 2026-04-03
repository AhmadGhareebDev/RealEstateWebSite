const jwt = require('jsonwebtoken')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const softAuth  = (req,  res , next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        req.user = null;
        return next()
    }

    const accessToken = authHeader.split(' ')[1];

    jwt.verify(accessToken , ACCESS_TOKEN_SECRET , (error , decoded) => {
        if (error) {
            req.user = null;
            return next();
        }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        username: decoded.username || 'unknown'
      };

      next();
    })

}


module.exports = softAuth
