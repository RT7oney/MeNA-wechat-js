'use strict'

var fs = require('fs')
var xml2js = require('xml2js')
var tpl = require('./tpl') 
    // var the_that = this

exports.parseXml = function(xml) {
    // console.log('=========parseXml=========')
    // console.log(xml)
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, { trim: true }, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

exports.log = function(log, where) {
    // console.log('==========where==========')
    // console.log(where)
    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth()
    if (month < 10) {
        month = '0' + month
    }
    var log_path = year + '' + month + '.log'
    var log_file = '[#' + now.toLocaleString() + '@' + where + '#]---------' + log + '\r\n'
    fs.exists('./log/' + log_path, (exists) => {
        fs.appendFile('./log/' + log_path, log_file, function(err) {
            if(err){
                console.log('======err from common.log @ 26======')
                console.log(err)
            }
        })
    })
}

exports.tpl = function(content,users){
    var info = {}
    var type = 'text'
    var fromUser = users.fromUser
    var toUser= users.toUser
    type = content.type || type
    info.content = content
    info.createTime= new Date().getTime()
    info.msgType = type
    info.toUser = fromUser
    info.fromUser = toUser

    return tpl.compiled(info)
}
