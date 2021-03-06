module.exports.name = 'login'
module.exports.dependencies = ['usersRepo', 'User', 'jsonwebtoken', 'environment']
module.exports.factory = function (repo, User, jwt, env) {
  'use strict'
    var ncrypt = require('ncrypt')


  const SECRET = env.get('jwt:secret')
  const EXPIRATION = env.get('jwt:expiresIn')

  const getUser = (email,password) => (resolve, reject) => {
    console.log("Password ", password, "Email ", email)
    var encryptedPassword = ncrypt.encr(password)
    return repo.get(email,encryptedPassword)
      .then(resolve)
      .catch(reject)
  }

  const makeAuthToken = (user) => (resolve, reject) => {
    resolve({
      user,
      authToken: jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password
      },
      SECRET,
      { expiresIn: EXPIRATION })
    })
  }

  return { getUser, makeAuthToken }
}
