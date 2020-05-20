const bcrypt = require('bcryptjs')

const User = require('../models/user')

const nodemailer = require('nodemailer')
const sendGrid = require('nodemailer-sendgrid-transport')

const keys = require('../config/keys')

const transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key:keys.sendGridKey
    }
}))

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        isAuthenticated:false,
        errorMessage:req.flash('error')
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.body.password

    // User.findById('5ebd8cc23f9b581890edda09')
    User.findOne({email:email})
    .then(user => {
        if(!user) {
            req.flash('error', 'Invalid email or password')
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
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login')
        })
        .catch(error => {
            console.log(error)
            req.flash('error', 'Invalid email or password')
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
    console.log(req.flash('error'))
    res.render('auth/signup', {
        path:'/signup', 
        pageTitle:'Sign up',
        errorMessage:req.flash('error')
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
            req.flash('error', 'Email already registered. Please go to Login page')
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
            return transporter.sendMail({
                to:email,
                from:'shop@node-shop.com',
                subject:'Signup successful',
                html:'<h1>You signed up successfully</h1>'

            })
            
        })     
    })
    .catch(error => console.log(error))
}