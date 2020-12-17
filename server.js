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
 

function post(url, params, callback){
    request({
        url: url,//请求路径
        method: "POST",//请求方式，默认为get
        headers: {//设置请求头
            "content-type": "application/json",
        },
        body: params//post参数字符串
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body)
            callback(body)
        }
        if ( error ) {
            console.error(error) 
        }
    }); 
}



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

        if(! parkinglot) {
            console.error('Error: '+ id + ' 未连接!')
            return res.send({'success': false}) 

        }

        parkinglot.emit('chat message', req.body.body);     // 数据下发到本地 node client
        console.info(['Success: 下发数据到: ', id , ', 内容: ', req.body.body].join(''))
        return res.send({'success': true}) 

    }catch(err){
        console.error(err)
        console.error(['Error: 下发数据报错: ', err , ', 内容: ', req.body].join(''))
        return res.send({'success': false}) 
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
    console.info(parkinglot_id + ' connected');

      
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
        console.info(parkinglot_id + ' disconnected');
        delete(ParkingLots[parkinglot_id])
    });


});

http.listen(3001, function(){
  console.info('listening on *:3001');
});
