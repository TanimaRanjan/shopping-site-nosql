const Product = require('../models/products')

exports.getAddProduct = (req,res,next) => {
    res.render('admin/add-product', {
        pageTitle:'Add Product',
        path:'/admin/add-product',
        editing:false,
    })
}


exports.postAddProduct = (req, res, next) => { 
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description

    // Using SQL
    // const product = new Product(null, title, imageUrl, description, price)
    //  product.save().then(result =>  res.redirect('/')).catch(error => console.log(error))

    // Using sequelize 
    console.log('IMAGE URL ', imageUrl)
    Product.create({
        title,
        price,
        imageUrl,
        description
    }
    ).then(result => console.log(result)
    ).catch(error => console.log(error))

    
   
}

exports.getEditProduct = (req,res) => {
    const editMode = req.query.edit;

    console.log(req.params.productId, editMode)
    if(!editMode) {
        return res.redirect('/')
    }

    const prodId = req.params.productId
    Product.findByPk(prodId).then(product => {
        if(!product) {
            return res.redirect('/')
        }
        res.render('admin/edit-product', {
            pageTitle:'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        })
    }).catch(error => console.log(error))
}

exports.postEditProduct = (req, res) => {
    console.log('EDIT  ')
    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price
    const updatedImageUrl = req.body.imageUrl
    const updatedDesc = req.body.description
    const updatedProduct = new Product(
        prodId,
        updatedTitle,
        updatedImageUrl,
        updatedDesc,
        updatedPrice
    )
    updatedProduct.save()
    res.redirect('/admin/products')
}


exports.postDeleteProduct =  (req, res) => {
    console.log(req.body.productId)
    const prodId = req.body.productId
    Product.deleteById(prodId)
    res.redirect('/admin/products')
}

exports.getProducts = (req, res, next) => {

    Product.findAll().then(products => {
        res.render('admin/products', {
            prods:products,
            pageTitle:'All Products',
            path:'/admin/products'
        })
    }

    ).catch(error => console.log(error))
    // Product.fetchAll(products => {
    //     res.render('admin/products', {
    //         prods:products,
    //         pageTitle:'Admin Products',
    //         path:'/admin/products'
    //     })
    // })
}