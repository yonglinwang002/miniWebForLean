const AV = require('leanengine')
const fs = require('fs')
const path = require('path')

var ucfetch = require('./functions/cloud/ucfetch.js');

// /**
//  * 加载 functions 目录下所有的云函数
//  */
// fs.readdirSync(path.join(__dirname, 'functions')).forEach( file => {
//   require(path.join(__dirname, 'functions', file))
// })

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request) {
  return 'Hello world!'
})


AV.Cloud.define('fetchUCData', function(request) {
  var reseult = ucfetch.fetchUCData();
  return reseult;
})

AV.Cloud.define('sumData', function(request) {
  var reseult = ucfetch.sumData();
  return reseult;
})