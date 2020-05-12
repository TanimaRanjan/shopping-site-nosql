const Product = require('../models/products')
const Cart = require('../models/cart')

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

exports.getCart = (req, res) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = []
            for(product of products) {
                const cartProductData = cart.products.find(
                    prod => prod.id === product.id
                )
                if(cartProductData) { 
                    cartProducts.push(
                        {
                            productData:product, 
                            qty: cartProductData.qty,
                            totalPrice:cart.totalPrice
                        })
                } 
            }
           // console.log('FOUND THE PRODUCT ', cartProducts)
            res.render('shop/cart', {
                path:'/cart',
                pageTitle:'Your Cart',
                products:cartProducts
            })
        })
    })
    
}


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId, product => {
        Cart.addProduct(prodId, product.price)
    })
    res.redirect('/cart');
  };
  

  exports.postCartDeleteProduct = (req, res, next) => {
    console.log(req.body)
    const prodId = req.body.productId;
    console.log(prodId)
    Product.findById(prodId, product => {
        console.log('TRYING TO DELETE ', prodId)
        Cart.deleteProduct(prodId, product.price);
    })
       
      res.redirect('/cart');
    // });
  };
  

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