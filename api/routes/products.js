const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
    
    
};

const upload = multer({storage: storage, limits: {
    fileSize: 1024 * 1024 * 5
},
fileFilter: fileFilter
});

const Product = require('../models/product');
router.get('/', (req,res, next)=>{
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    productImage: doc.productImage,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/',upload.single('productImage'), (req,res, next)=>{

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
    .then(result=>{
        res.status(201).json({
            message: 'Product created successfully!',
            createProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: "http://localhost:3000" + result._id
                }
            }
        })
    })
    .catch(err => {
        res.status(500).json({error: err});
    });
});

router.get('/:productId', (req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost/products'
                }
            });
        } else {
            res.status(404).json({message: "No valid entry found for provided Id"})
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    });
    
});

router.patch('/:productId',(req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(req => {
        res.status(200).json({
           message: 'Product updated',
           request: {
               type: 'GET',
               url: 'http://localhost:3000/products/' + id
           } 
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    })
});

router.delete('/:productId',(req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(res => {
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:300/products',
                body: {name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;