const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

const nodemailer = require('nodemailer')
const sendGrid = require('nodemailer-sendgrid-transport')
const { validationResult } = require('express-validator');

const keys = require('../config/keys')

const transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key:keys.sendGridKey
    }
}))

exports.getLogin = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null
    
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        isAuthenticated:false,
        errorMessage:message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
          },
          validationErrors: []
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)
    // User.findById('5ebd8cc23f9b581890edda09')
    if(!errors.isEmpty()) {
        return res.status(402).render('auth/login' , {
            path: '/login', 
            pageTitle:'Login',
            errorMessage: errors.array()[0].msg, 
            oldInput: {
                email,
                password
            },  
            validationErrors : errors.array()
        })
    }

    User.findOne({email:email})
    .then(user => {
        if(!user) {
            return res.status(422).render('auth/login', {
                path:'/login',
                pageTitle:'Login',
                errorMessage:'Invalid email or password!!',
                oldInput: {
                    email,
                    password
                },
                validationErrors:[]
            })

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
            return res.status(422).render('auth/login', {
                path:'/login',
                pageTitle:'Login',
                errorMessage:'Invalid email or password',
                oldInput: {
                    email,
                    password
                },
                validationErrors:[]
            })
            // req.flash('error', 'Invalid email or password')
            // return res.redirect('/login')
        })
        .catch(error => {
            console.log(error)
            req.flash('error', 'Invalid email or password')
            res.redirect('/login')
        })
        console.log('Login ', user)
        
    }).catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
}

exports.postLogout = (req, res) => {
    req.session.destroy(error => {
        console.log(error)
        res.redirect('/')
    })
}

exports.getSignup = (req, res) => {

    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null

    res.render('auth/signup', {
        path:'/signup', 
        pageTitle:'Sign up',
        errorMessage:message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
          },
          validationErrors: []
    })
}

exports.postSignup = (req, res) => {
    const name = req.body.name
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword

    const errors = validationResult(req)
    console.log('error ... ', errors)
    if(!errors.isEmpty()) {
        console.log(errors.array());

        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
              email,
              password,
              confirmPassword
            },
            validationErrors: errors.array()
        })
    }


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
                name,
                email,
                password:hashPassword,
                cart:{ item:[]}
            })
            return user.save()
        })
        .then(result => {
            res.redirect('/login')
            // return transporter.sendMail({
            //     to:email,
            //     from:'shop@node-shop.com',
            //     subject:'Signup successful',
            //     html:'<h1>You signed up successfully</h1>'

            // })
            
        })     
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
}


exports.getReset = (req,res) => {
    let message = req.flash('error')
    if(message.length > 0) {
        message = message[0]
    } else {
        message = null
    }

    res.render('auth/reset', {
        path:'/reset',
        pageTitle:'Reset Password',
        errorMessage:message
    })
    
}

exports.postReset = (req,res) => {
    crypto.randomBytes(32, (error, buffer) => {
        if(error) { 
            console.log(error)
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex')
        User.findOne({email:req.body.email})
        .then(user => {
            if(!user) {
                req.flash('error', 'Account not found')
                return res.redirect('/reset')
            }
            user.resetToken = token
            user.resetTokenExpiration = Date.now() - 360000
            return user.save()
        })
        .then(result => {
            res.redirect('/')
            transporter.sendMail({
                to:req.body.email,
                from:'shop@node-shop.com',
                subject:'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
            })
        })
        .catch(err =>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          })
    })
}


exports.getNewPassword = (req,res) => {
    const token = req.params.token

    User.findOne({resetToken:token, 
        resetTokenExpiration: { $gt:Date.now()}
    })
    .then(user => {

        let message = req.flash('error')
        message = message.length > 0 ? message[0] : null
            
        res.render('auth/new-password', {
            path:'/new-password',
            pageTitle:'New Password',
            errorMessage:message,
            userId:user._id.toString(),
            passwordToken:token
        })
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
}

exports.postNewPassword = (req,res) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken

    let resetUser 

    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration: { $gt:Date.now()},
        _id:userId
    })
    .then(user => {
        resetUser = user
        return bcrypt.hash(newPassword, 12)        
    })
    .then(hashPassword => {
        resetUser.password = hashPassword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
        return resetUser.save()
    })
    .then(result => {
        res.redirect('/login')
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
}