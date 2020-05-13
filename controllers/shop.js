const Product = require('../models/products')
const Cart = require('../models/cart')

exports.getProducts = (req, res) => {
    
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods:products,
            pageTitle:'All Products',
            path:'/products'
        })
    }

    ).catch(error => console.log(error))

    // Product.fetchAll().then(([rows, fieldData]) => {
    //     console.log(rows[0])
    //     res.render('shop/product-list', {
    //         prods:rows,
    //         pageTitle:'All Products',
    //         path:'/products'
    //     })
    // }

    // ).catch(error => console.log(error)) 

}

exports.getProduct = (req, res) => {
    const productId = req.params.productId
    Product.findByPk(productId)
    .then((product) => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle:product.title,
            path:'/'
        })
    }).catch(error => console.log(error))
    // res.render('/')
}

exports.getIndex = ( req, res) => {
    Product.findAll().then(products => {
        res.render('shop/index', {
            prods:products,
            pageTitle:'All Products',
            path:'/products'
        })
    }

    ).catch(error => console.log(error))

    // Product.fetchAll().then(([rows, fieldData]) => {
    //     console.log(rows[0])
    //     res.render('shop/index', {
    //         prods:rows,
    //         pageTitle:'All Products',
    //         path:'/'
    //     })
    // }
    // ).catch(error => console.log(error)) 
    
}

exports.getCart = (req, res) => {
    Cart.getCart(cart => {
        Product.fetchAll().then(([products, fieldData]) => {
            
            const cartProducts = []
            for(product of products) {
                const cartProductData = cart.products.find(prod => {
                    return prod.id === product.id
                })
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
        }).catch(error => {
            console.log(error)
        })
          
    })
    
}


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    console.log('post cart')
    Product.findByPk(prodId).then((product) => {
        console.log(product)
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