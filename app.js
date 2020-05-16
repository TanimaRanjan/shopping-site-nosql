const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error');
const User = require('./models/user');

const db = require('./config/keys').mongoURI
const secret = require('./config/keys').secretOrKey

const app = express();
const store = new MongoDBStore({
    uri:db,
    collection:'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret:secret,
        resave:false,
        saveUninitialized:false,
        store:store
    })
)

app.use((req,res, next) => {
    if(!req.session.user) {
        return next()
    }
    
    User.findById(req.session.user._id
    ).then(user => {
        // req.user = new User(user.name, user.email, user.cart, user._id)
        req.user = user
        next()
    }).catch(error => console.log(error))
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);



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


        

