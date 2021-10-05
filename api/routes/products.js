const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString() + file.originalname)
    }
})

const fileFilter = (req,file,cb) => {
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

const upload = multer({
    storage:storage,
    limits:{
    fileSize:1024 * 1024 * 5
    },
    fileFilter:fileFilter
})


router.get('/',(req,res,next) => {
   Product.find().select('name price _id productImage')
   .exec()
   .then(doc => {
    const response = { 
        count:doc.length,
        products:doc.map(doc => {
            return{
                name:doc.name,
                price:doc.price,
                productImage:doc.productImage,
                _id:doc._id,
                request:{
                    "type":"GET",
                    "url":"localhost:3000/products/"+doc._id
                }
            }
        })
    }
     //  if(doc.length >= 0){
            res.status(200).json(response)
    //    }else{
    //        res.status(404).json({
    //            message:'No entries found'
    //        })
    //    }
   }).catch(err => {
       console.log(err)
       res.status(500).json({
           error:err
       })
   })
} )


router.post('/',checkAuth,upload.single('productImage'),(req,res,next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    })
    product.save()
    .then(result =>{
        console.log(result)
        res.status(201).json({
            message:"Created product successfully",
            createProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                    "type":"GET",
                    "url":"http://localhost:3000/produts/" + result._id
                }
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })

} )

router.get('/:productId',(req,res,next) => {
    const id = req.params.productId;
    Product.findById(id).select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log(doc);
        if(doc){
            res.status(200).json({
                product:doc,
                request:{
                    type:"GET",
                    url:"http://localhost:3000/products"
                }
            })
        }else{
            res.status(404).json({message:"No valid entry found for providded ID"})
        }
        
    })
    .catch(err => {console.log(err)
    res.status(500).json({error:err})})
})

router.patch('/:id',checkAuth,(req,res,next) => {
   const id = req.params.id;
   Product.updateOne({_id:id},{$set:{name:req.body.newName,price:req.body.newPrice}})
   .exec()
   .then(result =>{
       console.log(result)
       res.status(200).json({
           message:"Product updated",
           request:{
               type:"GET",
               url:"http://localhost:3000/pruducts" + id
           }
       })
   }).catch(err => {
       console.log(err)
       res.status(500).json({
           error:err
       })
   })
})

router.delete('/:id',checkAuth,(req,res,next) => {
   const id = req.params.id
    Product.remove({_id:id}).exec()
    .then(result => {
        res.status(200).json({
            message:"Product deleted",
            request:{
                type:"GET",
                url:"http://localhost:3000/products",
                body:{name:"String",price:"Number"}
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

module.exports = router