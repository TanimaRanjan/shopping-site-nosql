const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
// const nodemailer = require('nodemailer')
// const sendGrid = require('nodemailer-sendgrid-transport')

const keys = require('./config/keys')



const errorController = require('./controllers/error');
const User = require('./models/user');



const app = express();
const store = new MongoDBStore({
    uri:keys.mongoURI,
    collection:'sessions'
})

const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret:keys.secretOrKey,
        resave:false,
        saveUninitialized:false,
        store:store
    })
)

app.use(csrfProtection)
app.use(flash())

app.use((req,res, next) => {
    if(!req.session.user) {
        return next()
    }
    
    User.findById(req.session.user._id
    ).then(user => {
        // req.user = new User(user.name, user.email, user.cart, user._id)
        req.user = user
        
        next()
    }).catch(error => {
        next(new Error(error))
    })
})

app.use((req,res,next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

app.use((error, req,res, next) => {
    res.status(500).render('500', {
        pageTitle:'Error!',
        path:'/500',
        isAuthenticated:req.session.isLoggedIn
    })
})

mongoose.connect(keys.mongoURI, { useNewUrlParser: true } )
.then((result) => {
    // User.findOne().then(user => {
    //     if(!user) {
    //         user = new User({
    //             name:'Tanima',
    //             email:'testemail@test.com',
    //             cart: {
    //                 items:[]
    //             }
    //         })
    //         user.save()
    //     }
    // })
    console.log('Connected to DB')
    app.listen(3000)
}).catch(error => { console.log(error )})


        

