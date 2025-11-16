const roleCheck = (roles) => (req ,res , next) => {

    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            errorCode: 'FORBIDDEN',
            message: 'Access denied.'
    });
    }

    next()
    
}

module.exports = roleCheck