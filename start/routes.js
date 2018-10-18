'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create``
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Route = use('Route')

Route.group(function(){
  Route.get('/' ,'chatController.index');

  Route.get('/logout','sessionController.logout') ;
  Route.get('/chat/:id', 'chatController.chat') ;
}).middleware(['auth']) ;


// 
// Route.get('/createdb', async () => {
//   const db = use('Database');
//   await db.schema.createTable(122 +'', (table) => {
//     table.increments();
//     table.text('paragraph').notNullable();
//     table.integer('age').notNullable();
//     table.timestamp('migration_time').defaultsTo(db.fn.now());
//   });
//
//
//
//   return 'db should be created';
// });

// Route.get('/createcol' , async()=>{
//   const db = use('Database') ;
//   const firstUserId = await db
//     .from('test')
//     .insert([{name: 'abdo' , age : 23 }]) ;
//
//   return 'things should be done' ;
// }) ;
//
//
// Route.get('/getcol', async () => {
//   const db = use('Database');
//
//
//   const count = await db
//     .from('10011002')
//     .last();
//
//
//   return count.id ;
//
//
// });





Route.group(function(){
  Route.get('/login','sessionController.loginView') ;
  Route.post('/login' , 'sessionController.login') ;


  Route.get('/register', 'sessionController.registerationView') ;
  Route.post('/register', 'sessionController.register') ;

  Route.post('/login' , 'sessionController.login') ;

  Route.get('/debug' , 'sessionController.debug') ;

}).middleware(['guest']) ;
