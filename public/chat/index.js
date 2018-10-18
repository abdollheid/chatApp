 let ws = null;
 const channel = 'chat:index' ;

 $(function () {

   startChat() ;


 });

 function startChat() {

   ws = adonis.Ws().connect() ;
   ws.options.reconnectionAttempts = 1000 ;

   ws.on('open', () => {
     console.log('connected to ws');
     $('#error').append('connected ') ;
     subscribeToChannel();
   });

   ws.on('error', () => {
     console.log('error couldnt connect to ws');
     $('#error').append('cant connect ') ;
   });
 }


 function subscribeToChannel() {
   const chat = ws.subscribe(channel);

   chat.on('error', (error) => {

     console.log('error couldnt subscribe to channel');
     console.log(error) ;
   });

   // chat.on('close', () => {
   //   console.log('----------------------------------should send the message now') ;
   //   ws.getSubscription('chat').emit('server' ,{
   //     message:'off me please'
   //   }) ;
   //
   //   console.log('----------------------------------message should be sent') ;
   // });

   chat.on('onlineUsers', (message) => {
     updateOnlineUsers(message);
     ws.getSubscription(channel).emit('notifyThem');

   });

   chat.on('onlineUsersBack', (message) => {
     console.log('notified') ;
     updateOnlineUsers(message);
   });

   chat.on('offUser', (message)=>{
     $(`#${message.username}`).remove() ;
   });







 }

 function updateOnlineUsers(message) {
   if (message.username !== window.username) { // to not append the same online user
     if ($('#' + message.username).length === 0) { // to not append 2 same user on different user page
       $('ul').append(getUserHtml(message));


     }
   }
 }


 function getUserHtml(message){ // message = {username:'bla' , href = '1023'}
   let name = message.username ;
   let href = Math.min(window.href , message.href) +''+ Math.max(window.href , message.href) ;


   return `<li id=${name}> ${name} is <span id="online" >online </span> <div class="verticalcetner"> <a href='chat/${href}?friend=${name}' ><img src="chat/chat.png" alt="start chat" title="start chat"> </a>` ;
 }
