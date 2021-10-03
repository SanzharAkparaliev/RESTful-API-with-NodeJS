const express = require('express')
const app = express()
const morgan  = require('morgan')
const productRoutes = require('./api/routes/products')
const ordersRoutes = require('./api/routes/orders')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/node-shop')
//Routes  which  should handle request
app.use(morgan('dev'))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads',express.static('uploads'))

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header(
        "Access-Control-Allow-Headers",
        "Orogin,X-Request-With,Content-Type,Accept,Authorization"
    )
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE')
        return res.status(200).json({})
    }
    next()
})

app.use('/products',productRoutes)
app.use('/orders',ordersRoutes)

module.exports = app