// 部署在云端的node socketio 作为 server , 用于将消息通知到本地

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser");  
const urlib = require("url"); 

app.use(bodyParser.urlencoded({ extended: false }));  
app.set('view engine','ejs');
app.set('views', __dirname + '/views');


var ParkingLots = {}
 

app.get('/', function(req, res){
    var myobj = urlib.parse(req.url,true);
    // console.info(myobj.query.id)
    // console.info(myobj.query.haha)
    // res.sendFile(__dirname + '/index.html');
    // res.send({'name': 'asdf'})
    res.render(__dirname + '/index.ejs', {name:'dsc'})
});



app.post('/publish', function(req, res){         // 接收 server 推送的消息
    var myobj = urlib.parse(req.url,true);
    console.info(req.body)
    
    var id = req.body.id
     
    try{
        var parkinglot = ParkingLots[id]
        parkinglot.emit('chat message', req.body.body);     // 数据下发到本地 node client

        console.info(['下发数据到: ', id , ', 内容: ', req.body.body].join(''))
        res.send({'success': true}) 

    }catch(err){
        console.error(err)
        console.error(['下发数据报错: ', err , ', 内容: ', req.body].join(''))
        res.send({'success': false}) 
    }
    
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
    ParkingLots[parkinglot_id] = socket
    console.log(parkinglot_id)
    console.log('a user connected');
     
    socket.broadcast.emit('hi');
      
      
    socket.on('chat message', function(msg){
     
        io.emit('chat message', msg);
        console.info('server -> client : success')
        
    });

    socket.on('define', function(cam_id){
        console.info(cam_id)
        ParkingLots[cam_id] = this
        console.info(ParkingLots)
    })

  
    socket.on('disconnect', function(cam_id){
        console.log(cam_id)
        console.log('user disconnected');
        delete(ParkingLots[cam_id])
    });


});

http.listen(3001, function(){
  console.log('listening on *:3001');
});
