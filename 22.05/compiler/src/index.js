// webpack测试用的
import _ from 'lodash'; // 正常可以用import引入
let d3 = require('d3');// 有些包声明方式不一样需要用require

d3.select('#d3div').append('h1').text('d3')
alert(_.join([1,2]))
