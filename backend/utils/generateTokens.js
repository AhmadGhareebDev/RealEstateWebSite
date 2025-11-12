const jwt = require('jsonwebtoken')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: '15m'
        }
    );


    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return { accessToken  , refreshToken }
}


module.exports = { generateTokens }