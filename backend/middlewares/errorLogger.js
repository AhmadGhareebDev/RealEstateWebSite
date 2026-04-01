const {logEvent} = require('./logevents')

const errorLogger = async (error, req, res, next) => {
    await logEvent(`${error.name} ${error.message}`, 'errorLogs.txt')

    res.status(500).json({
        success: false,
        errorCode: 'SERVER_ERROR',
        message: 'An unexpected error occurred.'
    })
}

module.exports = errorLogger