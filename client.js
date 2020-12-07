const io = require('socket.io-client');
const request = require('request');

const express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require("body-parser");  
const urlib = require("url"); 

app.use(bodyParser.urlencoded({ extended: false })); 

const port = 3000


const LOCAL = 'http://localhost:8000'     // 本地服务器 地址
// const SERVER = 'http://127.0.0.1:3001'    // 本地socketio 地址

const SERVER = 'http://47.100.40.50:3001'    // 本地socketio 地址
// const SERVER = 'http://parkingtest.jietingtech.com'



const notice_url = LOCAL+'/server/notice/' // 推送本地url


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





var ids = []
var sockets = []
var network = false


app.get('/', function(req, res){
    var myobj = urlib.parse(req.url,true); 
    console.info(myobj.query.id)  
    var id = myobj.query.id
    if(ids.indexOf(id)==-1){
    	var socket = io(server_url+id)   // 创建socketio连接, 每个车场一个连接
		socket.on('chat message', function(msg){
		 	post(m, msg, ()=>{console.info('node client -> django Local : success')}) 
		});
		sockets.push(socket)
		ids.push(id)
		console.info(sockets)
		console.info(ids)
    }
     return  res.send({'success': true})     
});

app.get('/network', function(req, res){
	return res.send({'network': network})
})

http.listen(port, function(){
  console.log('listening on *:'+port);
});




function connect_server(){
	
	server_url = SERVER + '?token=asf23rwf23&parkinglot_id='
	
	post( LOCAL + '/sync/parkinglot/ids/', '{}', (data)=>{  // 获取本地所有车场
		if(data.ids){ 
			
			for (var i = data.ids.length - 1; i >= 0; i--) {
				console.info(data.ids[i])

				var socket = io(server_url+data.ids[i].uuid)   // 创建socketio连接, 每个车场一个连接
				 
				socket.on('chat message', function(msg){
				 	console.info(msg)
				 	post(notice_url, msg, ()=>{console.info('node cilent-> django Local : success')}) 
				});

				socket.on('disconnect', function(){
					console.info('network down')
			        network = false
			    });

				socket.on('connect', function(){
					console.info('network ok')
			        network = true
			        post(LOCAL+'/realtime/upload/offline/', '', ()=>{console.info('upload offline...')}) 
			    });

				sockets.push(socket)
				ids.push(data.ids[i].uuid)
			}	
		}
	})
	
}

connect_server()

// setInterval(function(){
// 	console.info(sockets)
// }, 60000)
