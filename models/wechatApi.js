'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var fs = require('fs')
var common = require('../common/common')
var tpl = require('../common/tpl')
var stuffApi = require('./stuffApi')

var the_that = this // 全局对象

exports.getAccessToken = function(opts) {
    return the_that.readAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data)
                    // console.log('======get the data======')
                    // console.log(data.access_token)
            } catch (e) {
                return the_that.updateAccessToken(opts)
            }

            if (the_that.checkAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                return the_that.updateAccessToken(opts)
            }

        })
        .then(function(data) {
            the_that.saveAccessToken(data)
            console.log('======final send the access_token======')
            console.log(data.access_token)
            return Promise.resolve(data.access_token)
                // the_that.access_token = data.access_token
        })
}

exports.readAccessToken = function() {
    // the_the_that.updateAccessToken(opts)
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

exports.updateAccessToken = function(opts) {
    // console.log('==========updateAccessToken==========')
    var appId = opts.appId
    var appSecret = opts.appSecret
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

exports.checkAccessToken = function(data) {
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

exports.saveAccessToken = function(data) {
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

exports.getMsg = function(data) {
    // console.log('==========sendMsg==========')
    // console.log(data)
    return common.parseXml(data)
        .then(function(data) {
            console.log('======xml data======')
            console.log(data)
            var users = {
                fromUser: data.xml.FromUserName[0],
                toUser: data.xml.ToUserName[0],
            }
            if (data.xml.MsgType[0] === 'event') {
                if (data.xml.Event[0] === 'subscribe') {
                    var tpl_msg = common.tpl('谢谢您的关注！！oh yeah', users)
                        // console.log('======tpl_msg======')
                        // console.log(tpl_msg)
                    return Promise.resolve(tpl_msg)
                }
            } else if (data.xml.MsgType[0] === 'voice') {
                console.log('====语音识别====')
                var movie_preg_1 = new RegExp('电影')
                var movie_preg_2 = new RegExp('影片')
                var movie_preg_3 = new RegExp('片子')
                var music_preg_1 = new RegExp('音乐')
                var music_preg_2 = new RegExp('歌')
                var music_preg_3 = new RegExp('曲')
                if (data.xml.Recognition[0]) {
                    if (movie_preg_1.test(data.xml.Recognition[0]) || movie_preg_2.test(data.xml.Recognition[0]) || movie_preg_3.test(data.xml.Recognition[0])) {
                        console.log('电影')
                        return stuffApi.searchMovie().then(function(data) {
                            console.log(data)
                            if (!data || !data.title || !data.id) {
                                return Promise.reject(false)
                            } else {
                                var tpl_msg = ` <xml>
											    <ToUserName><![CDATA[` + users.fromUser + `]]></ToUserName>
											    <FromUserName><![CDATA[` + users.toUser + `]]></FromUserName>
											    <CreateTime>` + new Date().getTime() + `</CreateTime>
											    <MsgType><![CDATA[text]]></MsgType>
											    <Content><![CDATA[<a href="https://m.douban.com/movie/subject/` + data.id + `">` + data.title + `</a>]]></Content>
										    </xml>`
                                return Promise.resolve(tpl_msg)
                            }
                        })
                    } else if (music_preg_1.test(data.xml.Recognition[0]) || music_preg_2.test(data.xml.Recognition[0]) || music_preg_3.test(data.xml.Recognition[0])) {
                        console.log('音乐')
                        return stuffApi.searchMusic().then(function(data) {
                            console.log(data)
                            if (!data || !data.title || !data.id) {
                                return Promise.reject(false)
                            } else {
                                var tpl_msg = ` <xml>
											    <ToUserName><![CDATA[` + users.fromUser + `]]></ToUserName>
											    <FromUserName><![CDATA[` + users.toUser + `]]></FromUserName>
											    <CreateTime>` + new Date().getTime() + `</CreateTime>
											    <MsgType><![CDATA[text]]></MsgType>
											    <Content><![CDATA[`+data.author+`：<a href="http://music.baidu.com/song/` + data.id + `">` +data.title + `</a>]]></Content>
										    </xml>`
                                return Promise.resolve(tpl_msg)
                            }
                        })
                    } else {
                        var tpl_msg = common.tpl('臣妾听不懂啊~', users)
                        return Promise.resolve(tpl_msg)
                    }
                }
            } else {
                //toKefu
                var tpl_msg = common.tpl('呵呵哒', users)
                    // console.log('======tpl_msg======')
                    // console.log(tpl_msg)
                return Promise.resolve(tpl_msg)
            }
        })
}
