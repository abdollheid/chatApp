'use strict'

class PrivateChat {
  async wsHandle ({request, auth , response , socket}, next) {


      // console.log('******************************************************************') ;
      await auth.check() ;
      // console.log('auth') ;
      // console.log(auth.user.username);


      // console.log(socket.topic) ;

      if(socket.topic !== 'chat:index'){
        let part1 =  Number(socket.topic.substring(5,9)) ;
        let part2 =  Number(socket.topic.substring(9)) ;


        if(auth.user.id + 1000 !== part1 && auth.user.id + 1000 !== part2){
          console.log('didnt pass room check');
          console.log(auth.user.username);
          console.log(sockect.id) ;

          throw new Error('you are not welcomed here !') ;
        }
        // console.log('chat room passed');
      }






      // console.log('******************************************************************') ;


      await next() ;



  }



}

module.exports = PrivateChat
