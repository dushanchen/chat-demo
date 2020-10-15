const io = require('socket.io-client');
const request = require('request');

const LOCAL = 'http://localhost:8000'     // 本地服务器 地址
const SERVER = 'http://localhost:3001'    // 本地socketio 地址
// const SERVER = 'http://parkingtest.jietingtech.com'



const notice_url = LOCAL+'/server/notice/' // 推送本地

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




var sockets = []

function connect_server(){
	
	server_url = SERVER + '?token=asf23rwf23&parkinglot_id='
	
	post( LOCAL + '/sync/parkinglot/ids/', '{}', (data)=>{  // 获取本地所有车场
		if(data.ids){
			var ids = data.ids
			for (var i = ids.length - 1; i >= 0; i--) {
				console.info(ids[i])
				
				var socket = io(server_url+ids[i].uuid)   // 创建socketio连接, 每个车场一个连接
				
				socket.on('chat message', function(msg){
				 	console.info(msg)
				 	post(notice_url, msg, ()=>{console.info('node -> 本地 : 成功')}) 
				});

				sockets.push(socket)
			}	
		}
	})
	
}

connect_server()

// setInterval(function(){
// 	console.info(sockets)
// }, 60000)
