'use strict'

class Guest {
  async handle ({response , auth }, next) {
    try {
      await auth.check() ; 
      return response.redirect('/') ;
    }catch(err){

    }
    await next()
  }
}

module.exports = Guest
