/**
 * 这里有一个问题，就是在实例化WechatApiObj的时候，我们无法立马拿到this.access_token的值，因为getAccessToken这个方法是通过一系列promise的异步方法执行的，所以拿不到值
 */
'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var fs = require('fs')

var WechatApiObj = function (opts) {
    var that = this
    this.appId = opts.appId
    this.appSecret = opts.appSecret
    this.access_token = this.getAccessToken()
        // console.log('======this.access_token from WechatApiObj======')
        // console.log(this.access_token)
}

WechatApiObj.prototype.getAccessToken = function() {
    var that = this
    this.readAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data)
                    // console.log('======get the data======')
                    // console.log(data.access_token)
            } catch (e) {
                return that.updateAccessToken()
            }

            if (that.checkAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                return that.updateAccessToken()
            }

        })
        .then(function(data) {
            that.saveAccessToken(data)
            console.log('======final send the access_token======')
            console.log(data.access_token)
            return data.access_token
            // that.access_token = data.access_token
        })
}

WechatApiObj.prototype.readAccessToken = function() {
    // the_that.updateAccessToken(opts)
    return new Promise(function(resolve, reject) {
        fs.readFile('./data/access_token.json', function(err, origin_buffer) {
            var data = origin_buffer.toString()
                // console.log('======read data======')
                // console.log(data)
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })

}

WechatApiObj.prototype.updateAccessToken = function() {
    // console.log('==========updateAccessToken==========')
    var appId = this.appId
    var appSecret = this.appSecret
    var apiUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret // todo
    return new Promise(function(resolve, reject) {
        request({ url: apiUrl, json: true }).then(function(response) {
            // console.log('======请求的data======')
            // console.log(response.body)
            var now = (new Date().getTime())
            response.body.expires_in = now + (response.body.expires_in - 20) * 1000
            resolve(response.body)
        })
    })

}

WechatApiObj.prototype.checkAccessToken = function(data) {
    // console.log('==========checkAccessToken==========')
    // console.log(data)
    if (!data || !data.access_token || !data.expires_in) {
        // console.log('==========-1==========')
        return false
    }

    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
        // console.log('==========1==========')
        return true
    } else {
        // console.log('==========0==========')
        return false
    }
}

WechatApiObj.prototype.saveAccessToken = function(data) {
    // console.log('==========checkAccessToken==========')
    // console.log(data)
    data = JSON.stringify(data)
    return new Promise(function(resolve, reject) {
        fs.writeFile('./data/access_token.json', data, function(err) {
            if (err) reject(err)
            else resolve()
        })
    })
}

WechatApiObj.prototype.sendMsg = function(msg) {
    console.log('==========sendMsg==========')
    console.log(msg)
}


module.exports = WechatApiObj
