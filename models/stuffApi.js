'use strict'

var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var common = require('../common/common')
var config = require('../config')

var the_that = this // 全局对象

exports.searchMovie = function() {
    // console.log('====api_url====')
    // console.log(api_url)
    var api_url = config.douban.prefix + config.douban.movie
    return request({ url: api_url, json: true }).then(function(response) {
        // console.log(response.body.subjects[0])
        var data = {
            title: response.body.subjects[0].title,
            image: response.body.subjects[0].images.medium,
            id: response.body.subjects[0].id
        }
        return Promise.resolve(data)
    })

}

exports.searchMusic = function() {
	var api_url = config.baidu.prefix + config.baidu.music
    return request({ url: api_url, json: true }).then(function(response) {
        // console.log(response.body.song_list[0])
        var data = {
            title: response.body.song_list[0].title,
            author: response.body.song_list[0].author,
            album_title: response.body.song_list[0].album_title,
            id: response.body.song_list[0].song_id
        }
        return Promise.resolve(data)
    })
}
