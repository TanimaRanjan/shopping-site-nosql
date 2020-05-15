const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const errorController = require('./controllers/error');


const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res, next) => {
    User.findById('5ebd8cc23f9b581890edda09').then(user => {
        // req.user = new User(user.name, user.email, user.cart, user._id)
        req.user = user
        next()
    }).catch(error => console.log(error))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const db = require('./config/keys').mongoURI

mongoose.connect(db, { useNewUrlParser: true } )
.then((result) => {
    User.findOne().then(user => {
        if(!user) {
            user = new User({
                name:'Tanima',
                email:'testemail@test.com',
                cart: {
                    items:[]
                }
            })
            user.save()
        }
    })
    console.log('Connected to DB')
    app.listen(3000)
}).catch(error => { console.log(error )})


        

