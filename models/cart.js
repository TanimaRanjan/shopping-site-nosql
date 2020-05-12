const fs = require('fs')
const path = require('path')

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data',
    'cart.json'
)

module.exports = class Cart {
    static addProduct(id, productPrice) {
        console.log('Add prod')
        fs.readFile(p, (err, fileContent) => {
            let cart = { products : [], totalPrice: 0 }
            if(!err) {
                console.log('1 filecontent ',fileContent)
                try {
                    cart = JSON.parse(fileContent||{})
                } catch(error) {
                    throw new Error(error)
                }
                
                console.log('2 ', cart)
            }

            // Analyse the cart => Find the existing product
            const existingProductIndex = cart.products.findIndex(
                prod => prod.id === id
            )
             console.log('existingProductIndex', existingProductIndex)
            let updatedProduct 
            if(existingProductIndex !== -1) {
                const existingProduct = cart.products[existingProductIndex]
                
                updatedProduct = { ...existingProduct }
                updatedProduct.qty = updatedProduct.qty + 1
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct
            } else { 

                updatedProduct = { id: id, qty:1 }
                cart.products = [ ...cart.products, updatedProduct] 
            }
            cart.totalPrice = cart.totalPrice + +productPrice
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err)
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                return
            }
            const content = JSON.parse(fileContent)
            console.log('content' , content)
            const content1 = fileContent
            console.log('content1' , content1)
            const updatedCart = { ...JSON.parse(fileContent)} 

            console.log('updatedCart ', updatedCart)
            const product = updatedCart.products.find(prod => prod.id === id)
            console.log('updatedCart 1.... ')
            if(!product) {
                return 
            }
            console.log('updatedCart 2.... ')
            const productQty = product.qty 
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id)
            updatedCart.totalPrice = updatedCart.totalPrice = productPrice * productQty

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err)
            })
        })
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            
            const cart = JSON.parse(fileContent || {})

            if(err) {
                cb(null)
            } else {
                cb(cart)
            }
        })
    }
}