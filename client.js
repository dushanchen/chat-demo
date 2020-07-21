const io = require('socket.io-client');
const request = require('request');


const url = 'http://localhost:8000/server/notice/' // 推送本地
var socket = io('http://localhost:3000?token=asf23rwf23&parkinglot_id=86e98306-c9c8-11ea-8696-f45c89b1ee3f'); 

const post = (params)=>{
	 
	request({
	    url: url,//请求路径
	    method: "POST",//请求方式，默认为get
	    headers: {//设置请求头
	        "content-type": "application/json",
	    },
	    body: params//post参数字符串
	}, function(error, response, body) {
	    if (!error && response.statusCode == 200) {

	    }
	    if ( error ) {
	    	console.error(error) 
	    }
	}); 
}

socket.on('chat message', function(msg){
 	console.info(msg)
 	post(msg)
});

 


// const get_parkinglots = ()=>{
	
// }