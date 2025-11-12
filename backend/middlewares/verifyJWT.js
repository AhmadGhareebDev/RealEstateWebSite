const jwt = require('jsonwebtoken')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const verifyJWT = (req, res , next) => {

    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      errorCode: 'NO_TOKEN',
      message: 'Unauthorized: No token provided.'
    });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        ACCESS_TOKEN_SECRET,
        (error , decoded) => {
            if (error) {
                return res.status(403).json({
                success: false,
                errorCode: 'INVALID_TOKEN',
                message: 'Forbidden: Invalid or expired token.'
                });
            }

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            }


            next()
        });

}


module.exports = verifyJWT