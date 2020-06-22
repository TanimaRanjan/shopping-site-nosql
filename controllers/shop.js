const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit');

const Product = require('../models/products');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });


  // Product.find()
  //   .then(products => {
  //     console.log(products);
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'All Products',
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {

  const page = +req.query.page || 1
  let totalItems 
  Product
    .find()
    .countDocuments()
    .then(numOfProd => {
      totalItems = numOfProd
      console.log(totalItems)
      return Product.find()
      .skip((page-1)*ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .then(products => {
        // console.log(products)
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
          // isAuthenticated: req.session.isLoggedIn, 
          // csrfToken:req.csrfToken()
          // totalProducts:totalItems,
          currentPage: page,
          hasNextPage : ITEMS_PER_PAGE * page < totalItems,
          hasPrevPage : page > 1,
          nextPage : page+1,
          prevPage: page - 1,
          lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)

        });
      })
  }).catch(err => {
      console.log(err);
   });
};

exports.getCart = (req, res, next) => {
  
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      console.log(products)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      console.log('session ', req.session.user)
      console.log('user ', req.user)
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log('prodID ', prodId)
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};


exports.getInvoice = (req,res,next) => {
  
  let orderId = req.params.orderId

  Order.findById(orderId)
  .then(order => {
    if(!order) {
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized access'))
    }

    const invoiceName = `invoice-${orderId}.pdf`
    const invoicePath = path.join('data', 'invoice', invoiceName)

    const pdfDoc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`)


    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res)

    pdfDoc.fontSize(22).text('Invoice', {
      underline:true
    })

    pdfDoc.text('---------------------------')
    let totalPrice = 0

    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price
      pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x ${prod.product.price}`)
    })
    console.log(totalPrice)
    pdfDoc.text('---------------------------')
    pdfDoc.fontSize(20).text(`Total Price : $ ${totalPrice}`)

    pdfDoc.end()



  // fs.readFile(invoicePath, (err, data) => {
  //   if(err) {
  //     console.log(err)
  //     return next(err)
  //   }
  //   res.setHeader('Content-Type', 'application/pdf')
  //   res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`)
  //   res.send(data)
  //  })


  })

  
}