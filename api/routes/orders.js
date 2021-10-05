 const express = require('express')
 const router = express.Router()
 const mongoose = require('mongoose')
 const Order = require('../models/Order')
 const Product = require('../models/Product')
 const checkAuth = require('../middleware/check-auth')

router.get('/',checkAuth,(req,res,next) => {
   Order.find()
   .select('product quantity _id')
   .populate('product','name')
   .exec()
   .then(result => {
       console.log(result);
       res.status(201).json({
           count:result.length,
           orders:result.map(doc => {
               return{
                   _id:doc._id,
                   product:doc.product,
                   quentity:doc.quentity,
                   request:{
                    type:"GET",
                    url:"http://localhost:3000/orders/" + doc._id
                }
               }
           })
           
       })
   }).catch(err => {
       console.log(err)
       res.status(500).json({
           error:err
       })
   })
})

router.post('/',checkAuth,(req,res) => {
    Product.findById(req.body.productID)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }
        const order = new Order({
            _id:mongoose.Types.ObjectId(),
            quentity:req.body.quentity,
            product:req.body.productID
        })
        return order.save()
    }).then(result => {
        console.log(result),
        res.status(201).json({
            message:"Order stored",
            createdOrder:{
                _id:result._id,
                quentity:result.quentity
            },
            request:{
                type:"GET",
                url:"http://localhost:3000/orders/" + result._id
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })  
    
})

router.get('/:orderId',checkAuth,(req,res,next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        console.log(order)
        res.status(200).json({
            order:order,
            request:{
                type:"GET",
                url:"http://localhost:3000/orders"
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
}) 

router.delete('/:orderId',checkAuth,(req,res,next) => {
  Order.remove({_id:req.params.orderId})
  .exec()
  .then(result => {
      res.status(200).json({
          message:"Order  deleted",
          request:{
              type:"POST",
              url:"http://localhost:3000/orders"
          },
          body:{
              productID:"ID",
              quentity:"Number"
          }
      })
  })
  .catch(err => {
      console.log(err)
      res.status(500).json({
          error:err
      })
  } )
})

 module.exports = router