const { format } = require('date-fns')
let uuid;
import('uuid').then(module => {
  uuid = module.v4;
});const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')



const logEvent = async (message , logName) => {

    const date = `${format(new Date() , 'yyyy/MM/dd\tHH:mm:ss')}`
    const logItem  = `${uuid()}\t${date}\t${message}\n`

    try {

        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(__dirname , '..' , 'logs')
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