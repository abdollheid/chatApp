'use strict'
const ws = use('Ws') ;
const db = use('Database') ;
let lastClientIndex = null ;


class ChatController {

   constructor ({ socket, request , auth}) {
    this.socket = socket ;
    this.request = request ;
    this.auth = auth ;
    this.typing = false ;
    this.href = null ;
    this.currentFetchId = null ;
    this.ready = true ;
    this.limit = 200 ;

    if(socket.topic === 'chat:index')
      lastClientIndex = socket.id ;

    else{
      this.href = socket.topic.substring(5) ;
      this.socket.emit('welcome') ;

    }
    // console.log(socket.topic) ;

    console.log(socket.id) ;

    this.socket.broadcast('onlineUsers' ,{username:auth.user.username,href:auth.user.id+1000});

  }


  isReady(){
    if(!this.ready){
      console.log('not  ready yet') ;
     return false;
    }
    // console.log('ready') ;
    return true ;
  }

  next(){
    this.ready = false ;
    setTimeout(()=>{
      this.ready = true ;
    },this.limit) ;
  }

   removeSpecialChar(oldS) {
    let s = ""
    let specailChars = ['\n'  , '\t' , '\r' , '\f' , '\b'] ;
    let bad = false ;
    for(let i = 0 ; i < oldS.length ; ++i){
      for(let x = 0 ; x < specailChars.length ; ++x )
        if(oldS.charAt(i) === specailChars[x]) {
          bad = true ;
          break ;
        }

      if(!bad)
        s += oldS.charAt(i) ;

      bad = false ;
    }
    return s ;
  }


  onNotifyThem(message){
    // console.log('notifiying: ' + lastClientIndex) ;
    this.socket.emitTo('onlineUsersBack' , {username:this.auth.user.username,href:this.auth.user.id+1000} , [lastClientIndex]);
    // console.log('notified') ;
  }



  async onMessage(message){
    if(!this.isReady()) return ;
    message.body = this.removeSpecialChar(message.body) ;
    if( !isNaN(message.body.charAt(0).charCodeAt(0)) && message.body.length !== 0){
      message.username = this.auth.user.username ;

      if(!this.href)
        throw new Error('no href stored in controller') ;

      await db
        .from(this.href+'')
        .insert([{user: message.username , message : message.body }]) ;

      this.socket.broadcast('message' , message);
      this.typing = false ;
    }

    this.next() ;
  }


  async onOldMessage(){
    if(!this.isReady()) return ;

    if(!this.href)
      throw new Error('no href stored in controller 2') ;

    if(this.currentFetchId === 0){
      // console.log('no more messages') ;
      this.socket.emit('endOldMessage');
      return ;
     }

    if(!this.currentFetchId){
      // console.log('first time fetch messages') ;
      const lastRow = await db
        .from(this.href)
        .last();

        if(!lastRow){
          this.currentFetchId = 0 ;
          return ;
        }
      this.currentFetchId = lastRow.id ;
      // console.log('first time id:' + this.currentFetchId) ;

 }
    let start = 0 , end = this.currentFetchId , limit= 40 ;
    if ( this.currentFetchId > limit)
      start = end - limit;

    const result  = await db.raw('select * from `?` limit ? , ?', [Number(this.href) , start , end - start]);

    this.currentFetchId = start ;
    // console.log('fectch id = '+ this.currentFetchId);



    this.socket.emit('oldMessage' , result[0]);

    this.next() ;

  }




  onWriting(){
    if(!this.typing) {
    this.socket.broadcast('writing') ;
    this.typing = true ;
   }
  }

  onDoneWriting(){
    if(this.typing) {
    this.socket.broadcast('doneWriting') ;
    this.typing = false ;
   }
  }




  onClose(message){
    // console.log('trying to close socket') ;


  if(this.socket.topic === 'chat:index')
    ws.getChannel('chat:*')
      .topic('chat:index')
      .broadcast('offUser', {username : this.auth.user.username }) ;

    // console.log('sockect closed') ;


    // console.log('######################################################################################################################################3') ;
  }

  onError(){
    console.log('got some errors') ;
  }
}

module.exports = ChatController
