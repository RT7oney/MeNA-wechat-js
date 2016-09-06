'use strict'

var Koa = require('koa')
var KoaRouter = require('koa-router')
var connWechat = require('./middleware/connWechat')
var common = require('./common/common')
var wechatApi = require('./models/wechatApi')
var config = require('./config')

// 建立项目
var app = new Koa()
var router = new KoaRouter()

/**
 * 接入微信中间件
 */
app.use(connWechat(config.wechat))

/**
 * todo
 * 路由(存在问题，路由失效)
 */
// app.use(function *(next){
// 	if (this.url.indexOf('/wechat') > -1){
// 		var access_token = wechatApi.getAccessToken(config.wechat)
// 		return next
// 	}
// 	yield next
// })
/*****************使用export.getAccessToken这种方式书写代码的时候**********************/
// router.get('/test', wechatApi.getAccessToken(config.wechat))
router.get('/test', function*(next){
    wechatApi.getAccessToken(config.wechat)
})
/**********************************************************************************/
/*****************使用wechatApi并用原型方式写代码的时候**********************/
// router.get('/test', function *(next){
// 	common.log('dasdfa','test-lalalala')
// })
/**********************************************************************************/

app.use(router.routes()).use(router.allowedMethods()) //使路由规则生效

app.listen(config.port)
console.log('sever run @ ' + config.port)
