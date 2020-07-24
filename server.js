// 部署在云端的node socketio 作为 server , 用于将消息通知到本地

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser");  
const urlib = require("url"); 
  
// need it...  
app.use(bodyParser.urlencoded({ extended: false }));  

app.set('view engine','ejs');
app.set('views', __dirname + '/views');


Cameras = {}
 

app.get('/', function(req, res){
    var myobj = urlib.parse(req.url,true);
    // console.info(myobj.query.id)
    // console.info(myobj.query.haha)
   // res.sendFile(__dirname + '/index.html');
   // res.send({'name': 'asdf'})
   res.render(__dirname + '/index.ejs', {name:'dsc'})
});

app.post('/publish', function(req, res){   // 接收 server 推送的消息
    var myobj = urlib.parse(req.url,true);
    console.info(req.body)
    
    var id = req.body.id
    
    Cameras[id].emit('chat message', req.body.body);     // 数据下发到本地 node client
    
    console.info(['下发数据到: ', id , ', 内容: ', req.body.body].join(''))
    res.send({'success': true}) 
});


// middleware
// io.use((socket) => {
//   let token = socket.handshake.query.token;
//   // if (isValid(token)) {
//   //   // return next();
//   // }
//   // return next(new Error('authentication error'));
// });


io.on('connection', function(socket){
  
  let parkinglot_id = socket.handshake.query.parkinglot_id;
  Cameras[parkinglot_id] = socket

  console.log('a user connected');
  socket.broadcast.emit('hi');
  
  
  socket.on('chat message', function(msg){
 
    io.emit('chat message', msg);
    
  });

  socket.on('define', function(cam_id){
    console.info(cam_id)
    Cameras[cam_id] = this
    console.info(Cameras)
  })

  
  socket.on('disconnect', function(cam_id){
    console.log('user disconnected');
    delete(Cameras[cam_id])
  });


});

http.listen(3001, function(){
  console.log('listening on *:3000');
});
