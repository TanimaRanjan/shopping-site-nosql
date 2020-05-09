const Product = require('../models/products')

exports.getProducts = (req, res) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            prods:products,
            pageTitle:'All Products',
            path:'/products'
        })
    })
}

exports.getProduct = (req, res) => {
    const productId = req.params.productId
    console.log('Getting ID ',productId)
    Product.findById(productId, product => {
        console.log(product)
        res.render('shop/product-detail', {
            product: product,
            pageTitle:product.title,
            path:'/'
        })
    })
    // res.render('/')
}

exports.getIndex = ( req, res) => {
    Product.fetchAll(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle:'Shop',
            path:'/'
        })
    })
}

exports.getCart = ( req, res) => {
    res.render('shop/cart', {
        path:'/cart',
        pageTitle:'Your Cart'
    })
}

exports.getOrders = (req, res) => {
    res.render('shop/orders', {
        path:'/orders',
        pageTitle:'Your Orders'
    })
}

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        path:'/checkout',
        pageTitle:'Checkout'
    })
}