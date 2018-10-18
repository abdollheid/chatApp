let ws = null;

const indexChannel = 'chat:index';
let typing = false;
let offsetId = 0;
let ready = true;
let lastMessageTime = null;
let tabs = 0;
let first = true ;
$(function() {


  if($(window).width() < 700)
    $('.chat-container').css('width' , '95%') ;

  $('textarea').focus(() => {
    const message = $('#message').val();
    if (message.length > 0)
      sendTyping();

  });



  $('textarea').blur(() => {
    if (typing) {
      ws.getSubscription('chat:' + href).emit('doneWriting');
      typing = false;
    }
  });

  startChat();


});


function sendTyping() {
  if (!typing) {
    ws.getSubscription('chat:' + href).emit('writing');
    typing = true;
  }
}

function startChat() {

  ws = adonis.Ws().connect();
  ws.options.reconnectionAttempts = 1000;

  ws.on('open', () => {
    console.log('connected to ws');
    subscribeToChannel();
  });

  ws.on('error', () => {
    console.log('error couldnt connect to ws');
  });
}


function subscribeToChannel() {

  const chat = ws.subscribe('chat:' + href);
  const index = ws.subscribe(indexChannel);

  chat.on('error', (error) => {
    console.log('error couldnt subscribe to chat channel');
    console.log(error);
  });

  chat.on('welcome', () => {
    getOldMessage();


    $('.chat-window').scroll(function() {
      if ($('.chat-window').scrollTop() < 1) {

        if (ready) {
          $('#loading').slideDown(150);
          setTimeout(() => {
            getOldMessage();
            ready = true;
          }, 500);
          ready = false;
        }
      }
    });

  });

  chat.on('message', (message) => {
    updateMessages(message, message.username, false);
    $('#friendstatus').text('Online');
  })

  chat.on('writing', () => {
    $('#friendstatus').text('typing...');
  });

  chat.on('doneWriting', () => {
    $('#friendstatus').text('Online');
  });


  chat.on('oldMessage', (messages) => {
    let offset = 0;
    $('#loading').slideUp(150);


    for (let i = messages.length - 1; i > -1; --i) {

      if (i === messages.length - 1)
        lastMessageTime = new Date(Date.parse(messages[i].migration_time));


      updateMessages({
        username: messages[i].user,
        body: messages[i].message
      }, messages[i].user, true);

      offset += $(`#${offsetId-1}`).outerHeight(true);




      if (i > 0) {
        let nw = new Date(Date.parse(messages[i].migration_time));
        let old = new Date(Date.parse(messages[i - 1].migration_time));

        let diff = checkTime(old, nw);
        if (diff) {
          updateTime(diff, true);
          offset += $(`#${offsetId-1}`).outerHeight(true);
        }
      } else {
        if (messages[0].id === 1) {
          let diff = checkTime(new Date(0), new Date(Date.parse(messages[0].migration_time)));
          updateTime(diff, true);
        }
      }

    }

    if(first){
        $('.chat-window').scrollTop($('.chat-page').height());
        first = false;
        return ;
    }


    $('.chat-window').scrollTop(offset);

  });


  chat.on('endOldMessage', () => {
    $('#loading').hide();
  });


  index.on('onlineUsers', (message) => {

    if (me(message.username))
      return;

    tabs++;
    $('#friendstatus').text('Online');
    $('#online-sign').css('background-color', 'green');

    ws.getSubscription(indexChannel).emit('notifyThem');

  });

  index.on('onlineUsersBack', function(message) {

    if (me(message.username))
      return;


    tabs++;
    $('#online-sign').css('background-color', 'green');
    $('#friendstatus').text('Online');
  });

  index.on('offUser', (message) => {


    if (me(message.username))
      return;

    tabs--;
    if (tabs > 0)
      return;
    $('#online-sign').css('background-color', 'red');
    $('#friendstatus').text('Offline');
  });

  index.on('error', (error) => {
    console.log('error couldnt subscribe to index channel');
    console.log(error);
  });

}




$('#message').keyup(function(e) {
  let message = $(this).val() ;

  if (message.length > 0)
    sendTyping();
  else {
    if (typing) {
      ws.getSubscription('chat:' + href).emit('doneWriting');
      typing = false;
    }
  }

  if (e.which === 13) {
    e.preventDefault();
    message = removeSpecialChar(message) ;
    $(this).val('');


    if (isNaN(message.charAt(0).charCodeAt(0)) || message.length === 0)
      return ;



    ws.getSubscription('chat:' + href).emit('doneWriting');
    typing = false;


    let theMessage = {
      username: username,
      body: message
    };

    updateMessages(theMessage, username, false);

    ws.getSubscription('chat:' + href).emit('message', theMessage);
    typing = false;
  }
});

function updateMessages(message, turn, old) {
  let style = null;

  if (turn === username)
    style = 'right';

  else
    style = 'left';


  if (old) {
    $('.chat-page').prepend(`<div class="message" style='text-align:${style}'id=${offsetId}><div class='messageholder'><p id='msg${offsetId}'></p></div> </div>`);
    $(`#msg${offsetId}`).text(message.body) ;
  } else {
    let currTime = new Date();
    let time = checkTime(lastMessageTime, currTime);
    lastMessageTime = currTime;

    if (time)
      updateTime(time, false);

    $('.chat-page').append(`<div class="message" style='text-align:${style}'id=${offsetId}><div class='messageholder'><p id='msg${offsetId}'></p></div> </div>`);
    $(`#msg${offsetId}`).text(message.body) ;
    console.log($('.chat-page').height()) ;
    $('.chat-window').scrollTop($('.chat-page').height());
  }
  offsetId++;
}
function updateTime(time, old) {
  if (old)
    $('.chat-page').prepend(`<div class="message" ><div class="time"><div id="${offsetId}">${time}</div></div></div>`);
  else
    $('.chat-page').append(`<div class="message" ><div class="time"><div id="${offsetId}">${time}</div></div></div>`);

  offsetId++;
}

function getOldMessage() {
  ws.getSubscription('chat:' + href).emit('oldMessage');
}

function checkTime(lastTime, newTime) {

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let diff = null;

  if (lastTime) {


    if (newTime.getFullYear() !== lastTime.getFullYear())
      diff = newTime.getDate() + " " + months[newTime.getMonth()] + " " + newTime.getFullYear() + " " + ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2);
    else
    if (newTime.getMonth() !== lastTime.getMonth())
      diff = newTime.getDate() + " " + months[newTime.getMonth()] + " " + ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2);

    else
    if (newTime.getDate() !== lastTime.getDate())
      diff = newTime.getDate() + " " + months[newTime.getMonth()] + " " + ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2);
    else
    if (newTime.getHours() !== lastTime.getHours() || newTime.getMinutes() > lastTime.getMinutes() + 4)
      diff = ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2);

  } else {
    diff = newTime.getDate() + " " + months[newTime.getMonth()] + " " + newTime.getFullYear() + " " + newTime.getHours() + ":" + newTime.getMinutes();
  }



  return diff;
}

function me(name) {
  if (name === username)
    return true;

  return false;
}

function removeSpecialChar(oldS) {
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
