require('dotenv').config()
const express = require("express")
const PORT = process.env.PORT || 3500
const cookieParser = require('cookie-parser');
const connectDataBase = require('./configs/DBconnection')
const { default: mongoose } = require('mongoose');
const errorLogger = require('./middlewares/errorLogger')
const {logger} = require('./middlewares/logevents')
const verifyJWT = require('./middlewares/verifyJWT')
const app = express()





connectDataBase()
app.use(logger)
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));



app.use('/auth' , require('./routes/auth'))


app.use(verifyJWT);
app.use('/user', require('./routes/user/user') );



app.use(errorLogger)

mongoose.connection.once('open' , () => {
    console.log('connected to the DATABASE');
    app.listen(PORT , () => {
        console.log(`Server is running at Port: ${PORT}`)
    })
})