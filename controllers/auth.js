const User = require('../models/user')

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        isAuthenticate:false
    })
}


exports.postLogin = (req, res) => {
    User.findById('5ebd8cc23f9b581890edda09')
    .then(user => {
        console.log('Login ', user)
        req.session.isLoggedIn = true
        req.session.user = user
        req.session.save(error => {
            res.redirect('/')
        })
    }).catch(error => console.log(error))
}