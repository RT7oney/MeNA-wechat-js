'use strict'

var Promise = require('bluebird')

exports.wechat = {
    appId: 'wx17ea2dd41f40de31',
    appSecret: '8318b4d4511c90f8ba963e0b5a8b74d3',
    token: 'bushitry',
    access_token:function(){
    	return new Promise(function (resolve,reject) {
    		resolve()
    	})
    },
}
exports.douban = {
	prefix : 'https://api.douban.com/v2',
	movie:'/movie/in_theaters?count=1',
	// movie:'/movie/search?q=',
	// music:'/music/search?q=',
}
exports.baidu = {
	prefix:'http://tingapi.ting.baidu.com/v1/restserver/ting?',
	music:'method=baidu.ting.billboard.billList&type=2&size=1&offset=0'
}
exports.port = 7070
