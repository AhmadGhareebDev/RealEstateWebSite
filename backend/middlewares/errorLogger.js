const {logEvent} = require('./logevents')

const errorLogger = async (error,req , res , next) => {
    await logEvent(`${error.name} ${error.message}` , 'errorLogs.txt')

    res.status(500).send(error.message)

}

module.exports = errorLogger