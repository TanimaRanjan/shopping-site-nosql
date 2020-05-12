const db = require('../util/database')

const uuid = require('uuid4')
const Cart = require('./cart')

module.exports = class Product {
  
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price
  }

  save() {
    this.id = uuid()
    return  db.execute(`insert into products (id, title, price, description, imageUrl) values (?, ?, ?, ?, ?)`, 
    [this.id, this.title, this.price, this.description, this.imageUrl])
  }

  static deleteById(id) {
   
  }

  static fetchAll() {
    
    return db.execute('select * from products')
    // .then(results => results[0])
    //).catch(error => console.log(error))
  }

  static findById(id) {
    return db.execute(`select * from products where products.id=?`, [id])
  }
   
};
