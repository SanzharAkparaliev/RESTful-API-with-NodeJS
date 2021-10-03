const http = require('http')
const { post } = require('./app')
const app = require('./app')

const port = process.env.PORT || 3000

const server = http.createServer(app)

app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error)
})

app.use((err,req,res,next) => {
    res.status(err.status || 500);
    res.json({
        error:{
            message:err.message
        }
    })
})

server.listen(port,()=>{
    console.log(`Server has been started on PORT ${port}`)
})