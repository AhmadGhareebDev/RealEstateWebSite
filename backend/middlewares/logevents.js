const { format } = require('date-fns')
const crypto = require('crypto');
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvent = async (message , logName) => {
    const generateUUID = () => crypto.randomUUID()
    const date = `${format(new Date() , 'yyyy/MM/dd\tHH:mm:ss')}`
    const logItem  = `${generateUUID()}\t${date}\t${message}\n`

    try {

        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname , '..' , 'logs'))
        }

        await fsPromises.appendFile(path.join(__dirname , '..' , 'logs' , logName) , logItem)

    } catch (error) {

        console.error(error)
        
    }

}

const logger = async (req , res , next) => {

    await logEvent(`${req.method} ${req.headers.origin} ${req.url}` , 'reqLogs.txt')

    next()
}

module.exports = {
    logEvent ,
    logger
}