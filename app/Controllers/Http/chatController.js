'use strict'
const db = use('Database') ;

class chatController {

  index({view , auth}){

    let username = auth.user.username ;
    console.log(username) ;

    let href = auth.user.id + 1000 ;

    return view.render('chat.index' , {username , href}) ;
  }


  async chat({params , auth , response , view , request}){
    let part1 = Number(params.id.substring(0,4)) ;
    let part2 = Number(params.id.substring(4)) ;

    if(auth.user.id + 1000 !== part1 && auth.user.id + 1000 !== part2)
      return response.redirect('back') ;




      const href = params.id ;
      const username = auth.user.username;
      const friend = request.input('friend') ;

      const hasTable = await db.schema.hasTable(href+'') ;
      if(!hasTable)
        await db.schema.createTable( href + "", (table) => {
        table.increments();
        table.string('user' , 80).notNullable();
        table.text('message').notNullable();
        table.timestamp('migration_time').defaultsTo(db.fn.now());
      }) ;


      return view.render('chat.chat' , {username , href , friend}) ;
  }




}

module.exports = chatController
