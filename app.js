const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db.execute('select * from products').then(result => {
//     console.log(result[0][0])
// }).catch(error => { 
//     console.log(error)
// })
//db.execute('insert into product values ("db34288c-3ed9-420e-a78e-a80cd363d7f7","Mochi",10.50,  "Mochi", "https://images.unsplash.com/photo-1563941569144-b8218cb02671?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9"')
//db.execute('select * from products')
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Syncs with DB and creates table if not exists
sequelize.sync().then(result => {
    console.log(result)
    app.listen(3000);
}).catch(error => {
    console.log(error)
})


