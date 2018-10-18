'use strict'

const User = use('App/Models/User')  ;

class sessionController {

  loginView({view}){
    console.log('got a visit') ; 
    return view.render('session.login') ;
  }


  async login({request , auth,response , session}){

    try{
      await auth.remember(this.rememberME(request.input('remember'))).attempt(request.input('email') ,request.input('password') ) ;
      return response.redirect('/') ;

    }
    catch(err){
      session.flash({ error: ['We cannot find any account with these credentials.']});
      return response.redirect('/login') ;
    }

  }

  async logout({auth , response}){
    await auth.logout();
    return response.redirect('back') ;
  }



  registerationView({view}){
    return view.render('session.register') ;
  }

  async register({request , auth , response, session}){

     const user = new User() ;

     user.username = request.input('username') ;
     user.email = request.input('email') ;
     const password= request.input('password') ;
     const confPassword = request.input('confirm-password') ;

     if(password !== confPassword){
       session.flash({ error: ['password doesnt match']});
       return response.redirect('back') ;
     }

     user.password = password  ;

     try{
        await user.save() ;
      }
      catch(error){
        if(error.code === 'ER_DUP_ENTRY'){
          session.flash({ error: ['username or email already registered']});
          return response.redirect('back') ;
        }else {
          throw error ;
        }
      }

      await auth.login(user) ;
      return response.redirect('/')  ;

  }


  async debug({auth , response}){
    try{
      await auth.check() ;
      console.log('user is in') ;
    }catch(err){
        console.log('user is not in') ;
    }
    return response.redirect('/login') ;
  }


  rememberME(on){
    if(on === 'on')
      return true ;

    return false ;
  }


}

module.exports = sessionController
