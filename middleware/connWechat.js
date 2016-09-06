'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var common = require('../common/common')
var wechatApi = require('../models/wechatApi')

module.exports = function(opts) {

    return function*(next) /*发电机函数*/ {
        // this.body = this.query.echo
        // console.log('=======use connWechat=======')
        if (this.query.signature) {
            console.log('=======this.query from connWechat=======')
            console.log(this.query)
            var query = this.query
            var token = opts.token
            var signature = query.signature
            var nonce = query.nonce
            var timestamp = query.timestamp
            var echostr = query.echostr

            var tmpstr = [token, timestamp, nonce].sort().join('')
            var shastr = sha1(tmpstr)

            // console.log(this)

            if (shastr === signature) {
                if (echostr !== undefined) {
                    this.body = echostr + ''
                } else {
                    //响应消息
                    var data = yield getRawBody(this.req, {
                            length: this.length,
                            limit: '1mb',
                            encoding: this.charset
                        })
                        // console.log('=======data here=======')
                        // console.log(data)
                    var tpl_msg = yield wechatApi.getMsg(data)
                    // console.log('======tpl_msg from connWechat======')
                    // console.log(typeof tpl_msg)
                    this.status = 200
                    this.type = 'application/xml'
                    this.body = tpl_msg
                }
            } else {
                //记录日志
                this.body = 'error'
                common.log(JSON.stringify(query), 'connWechat.31')
            }
        }
    }
}
