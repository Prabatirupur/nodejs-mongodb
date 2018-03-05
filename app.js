const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Orgin', '*');
    req.header('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.connect('mongodb://shoppingtutorial:velmurugan143@ds247178.mlab.com:47178/shoppoingtutorial');
mongoose.Promise = global.Promise;
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status | 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;