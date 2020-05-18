const bcrypt = require('bcryptjs')

const User = require('../models/user')

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        isAuthenticated:false
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.body.password

    // User.findById('5ebd8cc23f9b581890edda09')
    User.findOne({email:email})
    .then(user => {
        if(!user) {
            return res.redirect('/login')
        }
        bcrypt.compare(password, user.password)
        .then(match => {
            if(match) {
                req.session.isLoggedIn = true
                req.session.user = user
                return req.session.save(error => {
                    console.log(error)
                    res.redirect('/')
                })
            }
            return res.redirect('/login')
        })
        .catch(error => {
            console.log(error)
            res.redirect('/login')
        })
        console.log('Login ', user)
        
    }).catch(error => console.log(error))
}

exports.postLogout = (req, res) => {
    req.session.destroy(error => {
        console.log(error)
        res.redirect('/')
    })
}

exports.getSignup = (req, res) => {
    res.render('auth/signup', {
        path:'/signup', 
        pageTitle:'Sign up',
        isAuthenticated:false
    })
}

exports.postSignup = (req, res) => {
    const name = req.body.name
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword


    User.findOne({email:email})
    .then(userDoc => {
        if(userDoc) { 
            return res.redirect('/signup')
        }
        return bcrypt
        .hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                name:name,
                email:email,
                password:hashPassword,
                cart:{ item:[]}
            })
            return user.save()
        })
        
        .then(result => {
            res.redirect('/login')
        }) 
        
    })
    
    .catch(error => console.log(error))
}